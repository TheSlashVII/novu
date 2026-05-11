from django.core.mail import send_mail,EmailMultiAlternatives
from django.template.loader import render_to_string

#import django.core.mail
def testMail():
    send_mail(
        subject="Test Email",
        message="Hi from django",
        from_email="novu-daemon@novu.cat",
        recipient_list=["hjmanhacks@gmail.com"],
        fail_silently=False,
        
    )
def sendPostRegisterEmail(email:str):
    htmlMessage = render_to_string("postRegisterEmail.html")
    plainMessage = "Se ha registrado su petición de registro. Recibirá una notificación cuando se resuelva su petición de registro. ¡Esperamos verte pronto en nuestra comunidad!"

    msg = EmailMultiAlternatives(
        subject="Register Request",
        body=plainMessage,
        from_email="novu-daemon@novu.cat",
        to=[email],
    )
    msg.attach_alternative(htmlMessage, "text/html")
    msg.send(fail_silently=False)
