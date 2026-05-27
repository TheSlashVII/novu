from django.core.mail import send_mail
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json

@csrf_exempt
def send_contact_email(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)
    
    try:
        data = json.loads(request.body)
        name = data.get('name', '').strip()
        email = data.get('email', '').strip()
        message = data.get('message', '').strip()
        
        if not name or not email or not message:
            return JsonResponse({'error': 'All fields are required.'}, status=400)
        
        send_mail(
            subject=f'Novu - Mensaje de contacto de {name}',
            message=f'Nombre: {name}\nEmail: {email}\n\nMensaje:\n{message}',
            from_email='contact-daemon@novu.cat',
            recipient_list=['junioruzama@gmail.com'],
            fail_silently=False,
        )
        
        return JsonResponse({'message': 'Email sent succesfully.'}, status=200)
    
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)