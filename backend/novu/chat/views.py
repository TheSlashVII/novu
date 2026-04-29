from django.http import JsonResponse
from django.db.models import Q
from userAPI.models import Message

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