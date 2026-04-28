import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import User
from urllib.parse import parse_qs
from .models import Message

class ChatConsumer(AsyncWebsocketConsumer):
    
    async def connect(self):
        try:
            # Inicializar atributos con valores por defecto
            self.room_group_name = None
            self.user = None
            self.user1_id = None
            self.user2_id = None
            
            # Obtener token de la query string
            query_string = self.scope['query_string'].decode()
            params = parse_qs(query_string)
            token = params.get('token', [None])[0]
            
            # Autenticar al usuario con el token
            self.user = await self.authenticate_user(token)
            
            if not self.user:
                print("❌ Autenticación fallida")
                await self.close()
                return
            
            # Obtener IDs de la URL
            self.user1_id = int(self.scope['url_route']['kwargs']['user1_id'])
            self.user2_id = int(self.scope['url_route']['kwargs']['user2_id'])
            
            # Verificar que el usuario autenticado es uno de los participantes
            if self.user.id not in [self.user1_id, self.user2_id]:
                print(f"❌ Usuario {self.user.id} no autorizado para este chat")
                await self.close()
                return
            
            # Crear nombre de sala ordenado
            ids = sorted([self.user1_id, self.user2_id])
            self.room_name = f"chat_{ids[0]}_{ids[1]}"
            self.room_group_name = f"chat_{self.room_name}"
            
            # Unir al grupo
            await self.channel_layer.group_add(
                self.room_group_name,
                self.channel_name
            )
            
            # Aceptar la conexión
            await self.accept()
            print(f"✅ Conectado: {self.user.username} a sala {self.room_group_name}")
            
        except Exception as e:
            print(f"❌ Error en connect: {e}")
            await self.close()
    
    async def disconnect(self, close_code):
        try:
            if self.room_group_name:
                await self.channel_layer.group_discard(
                    self.room_group_name,
                    self.channel_name
                )
                print(f"❌ Desconectado: {self.user.username if self.user else 'Unknown'} de {self.room_group_name}")
            else:
                print(f"❌ Desconectado sin sala activa")
        except Exception as e:
            print(f"❌ Error en disconnect: {e}")
    
    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            message = data.get('message', '')
            
            if not message:
                return
            
            # Determinar el destinatario
            recipient_id = self.user2_id if self.user.id == self.user1_id else self.user1_id
            
            # Guardar mensaje en la base de datos
            saved_message = await self.save_message(self.user.id, recipient_id, message)
            
            # Enviar mensaje al grupo
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat_message',
                    'message': message,
                    'sender_id': self.user.id,
                    'sender_name': self.user.username,
                    'timestamp': saved_message.get('timestamp', '')
                }
            )
            print(f"📨 Mensaje de {self.user.username}: {message}")
            
        except json.JSONDecodeError:
            print("❌ Error: Mensaje no es JSON válido")
        except Exception as e:
            print(f"❌ Error en receive: {e}")
    
    async def chat_message(self, event):
        try:
            await self.send(text_data=json.dumps({
                'message': event['message'],
                'sender_id': event['sender_id'],
                'sender_name': event['sender_name'],
                'timestamp': event.get('timestamp', '')
            }))
        except Exception as e:
            print(f"❌ Error en chat_message: {e}")
    
    @database_sync_to_async
    def authenticate_user(self, token):
        # Versión simplificada para pruebas
        # En producción, valida el token JWT correctamente
        try:
            # Si no hay token, devolver None
            if not token:
                return None
            
            # Para pruebas: obtener usuario del ID en la URL
            # Esto es temporal - en producción usa JWT
            return User.objects.filter(id=1).first()
        except Exception as e:
            print(f"Error autenticando: {e}")
            return None
    
    @database_sync_to_async
    def save_message(self, sender_id, recipient_id, content):
        try:
            sender = User.objects.get(id=sender_id)
            recipient = User.objects.get(id=recipient_id)
            
            message = Message.objects.create(
                sender=sender,
                recipient=recipient,
                content=content,
                is_read=False
            )
            
            return {
                'id': message.id,
                'timestamp': message.timestamp.strftime('%H:%M')
            }
        except User.DoesNotExist:
            print(f"❌ Usuario no encontrado: sender={sender_id}, recipient={recipient_id}")
            return {}
        except Exception as e:
            print(f"❌ Error guardando mensaje: {e}")
            return {}