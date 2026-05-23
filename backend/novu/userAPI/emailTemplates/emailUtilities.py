from django.core.mail import send_mail,EmailMultiAlternatives
from django.template.loader import render_to_string
from django.http import JsonResponse
from rest_framework import status
from rest_framework.decorators import action

def testMail():
    send_mail(
        subject="Test Email",
        message="Hi from django",
        from_email="novu-daemon@novu.cat",
        recipient_list=["hjmanhacks@gmail.com"],
        fail_silently=False,
        
    )
# to send an email saying that the request was recieved
def sendPostRegisterEmail(email:str):
    htmlMessage = render_to_string("postRegisterEmail.html")
    plainMessage = "Se ha registrado su petición de registro. Recibirá una notificación cuando se resuelva su petición de registro. ¡Esperamos verte pronto en nuestra comunidad!"

    msg = EmailMultiAlternatives(
        subject="Petición de registro",
        body=plainMessage,
        from_email="novu-daemon@novu.cat",
        to=[email],
    )
    msg.attach_alternative(htmlMessage, "text/html")
    msg.send(fail_silently=False)
# to send a email saying that the account was accepted
def sendAcceptedEmail(email:str, name:str):
    htmlMessage = render_to_string("acceptedAccountEmail.html", {"name": name})
    plainMessage = "¡Se ha acceptado su petición de registro! Bienvenido a nuestra comunidad. Puede acceder a su cuenta usando los mismos credenciales en novu.cat"

    msg = EmailMultiAlternatives(
        subject="Petición de registro acceptada",
        body=plainMessage,
        from_email="novu-daemon@novu.cat",
        to=[email],
    )
    msg.attach_alternative(htmlMessage, "text/html")
    msg.send(fail_silently=False)

def sendDeniedEmail(email:str, name:str):
    htmlMessage = render_to_string("deniedAccountEmail.html", {"name": name}) # email template
    # message in case the html does not render well
    plainMessage = "Lamentamos informale que se ha denegado su petición de registro. Possiblemente haya ocurrido una de estas opciones: Ha introducido datos que no coincidian con su carnet de estudiante, el carnet de estudiante no era valido o no coincidia con la persona en la foto del carnet" 
    msg = EmailMultiAlternatives(
        subject="Petición de registro denegada",
        body=plainMessage,
        from_email="novu-daemon@novu.cat",
        to=[email],
    )
    msg.attach_alternative(htmlMessage, "text/html") # tells the email processor that the preferred format is html
    msg.send(fail_silently=False)


def sendPasswordResetEmail(email:str, name:str, reset_link:str):
    htmlMessage = render_to_string("passwordResetEmail.html", {"name":name, "reset_link": reset_link})
    plainMessage = f"Hola {name}, recibimos una solicitud para restablecer tu contraseña. Accede al siguiente enlace para crear una nueva (válido 15 minutos): {reset_link}. Si no lo solicitaste, ignora este mensaje."

    msg = EmailMultiAlternatives(
        subject="Restablecer contraseña — Novu",
        body=plainMessage,
        from_email="novu-daemon@novu.cat",
        to=[email],
    )
    msg.attach_alternative(htmlMessage, "text/html")
    msg.send(fail_silently=False)
