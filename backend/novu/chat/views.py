from django.http import JsonResponse
from django.db.models import Q, Max
from userAPI.models import Message, User

def get_conversations(request, user_id):
    print(f"🔍 Buscando conversaciones para usuario: {user_id}")

    #Get all the users with the user speaks
    messages = Message.objects.filter(
        Q(sender_id=user_id) | Q(recipient_id=user_id)
    ).order_by('-sent_at')

    print(f"🔍 Mensajes encontrados: {messages.count()}")

    #Get the last message of the last conversation
    seen = set()
    conversations = []
    for m in messages:
        other_id = m.recipient_id_id if m.sender_id_id == user_id else m.sender_id_id
        if other_id not in seen:
            seen.add(other_id)
            try:
                other_user = User.objects.get(id=other_id)
                conversations.append({
                    'id': other_id,
                    'name': other_user.name,
                    'lastMessage': m.content,
                    'lastMessageTime': m.sent_at.strftime('%H:%M') if m.sent_at else '',
                    'avatar': '',
                    'unreadCount': 0,
                })
            except User.DoesNotExist:
                pass
            
    print(f"🔍 Conversaciones: {conversations}")
    return JsonResponse(conversations, safe=False)


def get_messages(request, user1_id, user2_id):
    messages = Message.objects.filter(
       Q(sender_id=user1_id) | Q(sender_id=user2_id)
    ).order_by('sent_at')
    
    data = []
    for m in messages:
        data.append({
            'message': m.content,
            'sender_id': m.sender_id_id,
            'sender_name': m.sender_id.email,
            'timestamp': m.sent_at.strftime('%H:%M') if m.sent_at else ''
        })
    
    return JsonResponse(data, safe=False)