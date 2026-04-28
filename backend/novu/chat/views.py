from django.http import JsonResponse
from .models import Message

def get_messages(request, user1_id, user2_id):
    messages = Message.objects.filter(
        sender_id__in=[user1_id, user2_id],
        recipient_id__in=[user1_id, user2_id]
    ).order_by('timestamp')
    
    data = []
    for m in messages:
        data.append({
            'message': m.content,
            'sender_id': m.sender.id,
            'sender_name': m.sender.username,
            'timestamp': m.timestamp.strftime('%H:%M')
        })
    
    return JsonResponse(data, safe=False)