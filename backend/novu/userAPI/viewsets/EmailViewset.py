import base64

from django.shortcuts import get_object_or_404

from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.contrib.auth.hashers import make_password
from django.conf import settings
from ..models import User
from rest_framework import viewsets, status, permissions
from django.http import JsonResponse
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.decorators import action
from ..emailTemplates.emailUtilities import *

class EmailViewset(viewsets.ViewSet):
    
    authentication_classes = [JWTAuthentication]
    
    def get_permissions(self):
        if self.action in []:  
            permission_classes = [permissions.AllowAny]
        elif self.action in ["sendAcceptedMailHandler", "sendDeniedMailHandler"]:  # Routes that require authentication
            permission_classes = [permissions.IsAuthenticated]
        else:              
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]


    @action(methods=["post"], detail=False)
    def sendAcceptedMailHandler(self,request):
        data = request.data
        email = data.get("email")
        name = data.get("name") 
        
        try:
            sendAcceptedEmail(email=email, name=name)
        except Exception as e:
            return JsonResponse({"Error": "Something went wrong"}, status = status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return JsonResponse({"message": "Email sent"}, status=status.HTTP_200_OK) 

    @action(methods=["post"], detail=False)
    def sendDeniedMailHandler(self,request):
        data = request.data
        email = data.get("email")
        name = data.get("name") 
        
        try:
            sendDeniedEmail(email=email, name=name)
        except Exception as e:
            return JsonResponse({"Error": "Something went wrong"}, status = status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return JsonResponse({"message": "Email sent"}, status=status.HTTP_200_OK)
    
    @action(methods=["post"], detail=False)
    def requestPasswordReset(self, request):
        """
        POST /api/users/password-reset/request/
        Body: { "email": "usuario@mail.com" }
        Envía el email de recuperación si el usuario existe.
        Siempre responde 200 para no revelar qué emails están registrados.
        """
        email = request.data.get("email", "").strip().lower()

        if not email:
            return JsonResponse({"error": "Email requerido"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            # Respuesta generica por seguridad
            return JsonResponse({"message": "Si el email existe, recibiras un enlace"}, status=status.HTTP_200_OK)
        
        # Generar el token usando el generador built-in de Django
        # No necesita modelo nuevo: usa last_login, password y date_joined del User
        token_generator = PasswordResetTokenGenerator()
        token = token_generator.make_token(user)

        # El uid es el pk del usuario codificado en base64 (igual que hace Django internamente)
        uid = base64.urlsafe_b64encode(str(user.pk).encode()).decode()

        debug = getattr(settings, "DEBUG")
        if debug:
            frontend_url = getattr(settings, "FRONTEND_URL", "http://localhost:4200")
        else:
            frontend_url = getattr(settings, "FRONTEND_URL", "https://novu.cat")
        reset_link = f"{frontend_url}/reset-password?uid={uid}&token={token}"

        try:
            sendPasswordResetEmail(email=email, name=user.name, reset_link=reset_link)
        except Exception as e:
            return JsonResponse({"error": "Error al enviar el email"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return JsonResponse({"message":"Si el email existe, recibiras un enlace"}, status=status.HTTP_200_OK)
    

    @action(methods=["post"], detail=False)
    def validatePasswordResetToken(self, request):
        """
        POST /api/users/password-reset/validate/
        Body: { "uid": "...", "token": "..." }
        Verifica que el token sea válido y no haya expirado.
        """
        uid = request.data.get("uid", "")
        token = request.data.get("token", "")

        if not uid or not token:
            return JsonResponse({"error": "Datos incompletos"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user_pk = base64.urlsafe_b64decode(uid.encode()).decode()
            user = User.objects.get(pk=user_pk)
        except Exception:
            return JsonResponse({"error": "Token no válido"}, status=status.HTTP_400_BAD_REQUEST)
        
        token_generator = PasswordResetTokenGenerator()
        if not token_generator.check_token(user, token):
            return JsonResponse({"error": "Token no válido o expirado"}, status=status.HTTP_400_BAD_REQUEST)
        
        return JsonResponse({"message": "Token válido"}, status=status.HTTP_200_OK)
    

    @action(methods=["post"], detail=False)
    def confirmPasswordReset(self, request):
        """
        POST /api/users/password-reset/confirm/
        Body: { "uid": "...", "token": "...", "new_password": "..." }
        Valida el token y guarda la nueva contraseña.
        """
        uid = request.data.get("uid","")
        token = request.data.get("token","")
        new_password = request.data.get("new_password","")

        if not uid or not token or not new_password:
            return JsonResponse({"error":"Datos incompletos"}, status=status.HTTP_400_BAD_REQUEST)
        
        if len(new_password) < 8:
            return JsonResponse({"error": "La contraseña debe tener al menos 8 caracteres"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user_pk = base64.urlsafe_b64decode(uid.encode()).decode()
            user = User.objects.get(pk=user_pk)
        except Exception:
            return JsonResponse({"error": "Token no válido"}, status=status.HTTP_400_BAD_REQUEST)
        
        token_generator = PasswordResetTokenGenerator()
        if not token_generator.check_token(user, token):
            return JsonResponse({"error": "El enlace ha expirado o ya fue utilizado"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Guardar la nueva cobtraseña hasheada
        user.password = make_password(new_password)
        user.save()

        return JsonResponse({"message": "Contraseña actualizada exitosamente"}, status=status.HTTP_200_OK)

