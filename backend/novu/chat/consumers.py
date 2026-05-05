import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from urllib.parse import parse_qs
from rest_framework_simplejwt.tokens import AccessToken
from userAPI.models import Message, User, Match
from django.db import models
from django.utils import timezone

class ChatConsumer(AsyncWebsocketConsumer):
    
    async def connect(self):
        print("🔵 Intentando conectar...")
        query_string = self.scope['query_string'].decode()
        params = parse_qs(query_string)
        token = params.get('token', [None])[0]
        
        if not token:
            print("❌ No hay token")
            await self.close()
            return
        
        user = await self.authenticate_user(token)
        if not user:
            print("❌ Autenticación fallida")
            await self.close()
            return
        
        print(f"✅ Usuario autenticado: {user.email}")
        self.user1_id = int(self.scope['url_route']['kwargs']['user1_id'])
        self.user2_id = int(self.scope['url_route']['kwargs']['user2_id'])
        self.user = user
        
        ids = sorted([self.user1_id, self.user2_id])
        self.room_name = f"chat_{ids[0]}_{ids[1]}"
        self.room_group_name = f"chat_{self.room_name}"
        
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()
        print(f"✅ Conectado a sala: {self.room_group_name}")
    
    async def disconnect(self, close_code):
        if hasattr(self, 'room_group_name'):
            await self.channel_layer.group_discard(self.room_group_name, self.channel_name)
        print(f"❌ Desconectado: {close_code}")
    
    async def receive(self, text_data):
        data = json.loads(text_data)
        message = data.get('message', '')
        if not message:
            return
        
        print(f"👤 Usuario autenticado ID: {self.user.id}")
        print(f"👤 user1_id: {self.user1_id}, user2_id: {self.user2_id}")
        
        recipient_id = self.user2_id if self.user.id == self.user1_id else self.user1_id
        await self.save_message(self.user.id, recipient_id, message)
        
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

        await self.channel_layer.group_send(
            f"notifications_{recipient_id}",
            {
                'type': 'new_message_notification',
                'sender_id': self.user.id,
                'sender_name': self.user.email,
                'message': message,
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
            print(f"🔍 Buscando match entre {sender_id} y {recipient_id}")
            match = Match.objects.filter(
                (models.Q(user1_id=sender_id) & models.Q(user2_id=recipient_id)) | 
                (models.Q(user1_id=recipient_id) & models.Q(user2_id=sender_id))
            ).first()
            print(f"🔍 Match encontrado: {match}")
            
            if not match:
                print(f"❌ No se encontró un Match para {sender_id} y {recipient_id}")
                return None
            
            message = Message.objects.create(
                match_id=match,
                sender_id_id=sender_id,
                recipient_id_id=recipient_id,
                content=content,
                read_at=timezone.now()
            )
            print(f"💾 Mensaje guardado: {content}")
            return message
        except Exception as e:
            print(f"❌ Error guardando mensaje: {e}")
            import traceback
            traceback.print_exc()
            return None


class NotificationConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        query_string = self.scope['query_string'].decode()
        params = parse_qs(query_string)
        token = params.get('token', [None])[0]

        if not token:
            await self.close()
            return

        user = await self.authenticate_user(token)
        if not user:
            await self.close()
            return

        self.user = user
        self.group_name = f"notifications_{user.id}"

        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()
        print(f"🔔 Notificaciones conectadas para: {user.email}")

    async def disconnect(self, close_code):
        if hasattr(self, 'group_name'):
            await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive(self, text_data):
        pass

    async def new_message_notification(self, event):
        await self.send(text_data=json.dumps({
            'type': 'notification',
            'sender_id': event['sender_id'],
            'sender_name': event['sender_name'],
            'message': event['message'],
        }))

    @database_sync_to_async
    def authenticate_user(self, token):
        try:
            access_token = AccessToken(token)
            user_id = access_token['user_id']
            return User.objects.get(id=user_id)
        except Exception as e:
            print(f"❌ Error autenticando: {e}")
            return None