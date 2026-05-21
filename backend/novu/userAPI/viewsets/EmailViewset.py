from django.shortcuts import get_object_or_404
from ..serializers import UserCardSerializer, PhotoSerializer
from rest_framework import viewsets, status, permissions
from rest_framework.response import Response
from django.http import JsonResponse
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.decorators import action
from ..emailTemplates import emailUtilities

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
            emailUtilities.sendAcceptedEmail(email=email, name=name)
        except Exception as e:
            return JsonResponse({"Error": "Something went wrong"}, status = status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return JsonResponse({"message": "Email sent"}, status=status.HTTP_200_OK) 

    @action(methods=["post"], detail=False)
    def sendDeniedMailHandler(self,request):
        data = request.data
        email = data.get("email")
        name = data.get("name") 
        
        try:
            emailUtilities.sendDeniedEmail(email=email, name=name)
        except Exception as e:
            return JsonResponse({"Error": "Something went wrong"}, status = status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return JsonResponse({"message": "Email sent"}, status=status.HTTP_200_OK) 