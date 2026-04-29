import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from urllib.parse import parse_qs
from rest_framework_simplejwt.tokens import AccessToken
from userAPI.models import Message, User, Match
from django.db import models

class ChatConsumer(AsyncWebsocketConsumer):
    
    async def connect(self):
        print("🔵 Intentando conectar...")
        
        # Obtener el token de la query string
        query_string = self.scope['query_string'].decode()
        params = parse_qs(query_string)
        token = params.get('token', [None])[0]
        
        if not token:
            print("❌ No hay token")
            await self.close()
            return
        
        # Autenticar usuario con el token
        user = await self.authenticate_user(token)
        
        if not user:
            print("❌ Autenticación fallida")
            await self.close()
            return
        
        print(f"✅ Usuario autenticado: {user.email}")
        
        # Obtener IDs de la URL
        self.user1_id = int(self.scope['url_route']['kwargs']['user1_id'])
        self.user2_id = int(self.scope['url_route']['kwargs']['user2_id'])
        self.user = user
        
        # Crear sala única para la conversación
        ids = sorted([self.user1_id, self.user2_id])
        self.room_name = f"chat_{ids[0]}_{ids[1]}"
        self.room_group_name = f"chat_{self.room_name}"
        
        # Unir al grupo
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        
        await self.accept()
        print(f"✅ Conectado a sala: {self.room_group_name}")
    
    async def disconnect(self, close_code):
        if hasattr(self, 'room_group_name'):
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )
        print(f"❌ Desconectado: {close_code}")
    
    async def receive(self, text_data):
        data = json.loads(text_data)
        message = data.get('message', '')
        
        if not message:
            return
        
        # Determinar el destinatario
        recipient_id = self.user2_id if self.user.id == self.user1_id else self.user1_id
        
        # Guardar mensaje en la base de datos
        await self.save_message(self.user.id, recipient_id, message)
        
        # Enviar al grupo
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': message,
                'sender_id': self.user.id,
                'sender_name': self.user.email,
                'timestamp': ''
            }
        )
    
    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            'message': event['message'],
            'sender_id': event['sender_id'],
            'sender_name': event['sender_name'],
            'timestamp': event.get('timestamp', '')
        }))
    
    @database_sync_to_async
    def authenticate_user(self, token):
        try:
            # Decodificar el token JWT
            access_token = AccessToken(token)
            user_id = access_token['user_id']
            user = User.objects.get(id=user_id)
            print(f"✅ Usuario autenticado: {user.email}")
            return user
        except Exception as e:
            print(f"❌ Error autenticando: {e}")
            return None
    
    @database_sync_to_async
    def save_message(self, sender_id, recipient_id, content):
        try:
            # Búsqueda corregida
            match = Match.objects.filter(
                (models.Q(user1_id=sender_id) & models.Q(user2_id=recipient_id)) | 
                (models.Q(user1_id=recipient_id) & models.Q(user2_id=sender_id))
            ).first()
            
            if not match:
                print(f"❌ No se encontró un Match para {sender_id} y {recipient_id}")
                return None
            
            message = Message.objects.create(
                match_id=match,
                sender_id_id=sender_id,
                recipient_id_id=recipient_id,
                content=content
            )
            print(f"💾 Mensaje guardado: {content}")
            return message
        except Exception as e:
            print(f"❌ Error guardando mensaje: {e}")
            return None