from django.shortcuts import get_object_or_404
from ..serializers import UserCardSerializer, PhotoSerializer
from rest_framework import viewsets, status, permissions
from rest_framework.response import Response
from django.http import JsonResponse
from ..models import UserCard, User, Photo
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.decorators import action


class PhotoViewset(viewsets.ModelViewSet):
    queryset = Photo.objects.all()
    authentication_classes = [JWTAuthentication]
    
    
    def get_permissions(self):
        if self.action in ["uploadPhoto"]:   # public routes | create Admin is Public for now 
            permission_classes = [permissions.AllowAny]
        elif self.action in []:  # Routes that require authentication
            permission_classes = [permissions.IsAuthenticated]
        else:                                    # PUT, PATCH, DELETE
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    @action(methods=["post"], detail=False)
    def uploadPhoto(self,request, id=None):
        reqData = request.data.copy()
        photoInfo = {"user_id": id, "url": reqData['background_photo'], "visible":True}
        imageSerializer = PhotoSerializer(data=photoInfo)
        if imageSerializer.is_valid():
            imageSerializer.save()
            return JsonResponse({"message": "Photo uploaded", "photo" : imageSerializer.data})
        return JsonResponse({"message": "error while uploading", "errors": imageSerializer.errors}, status=status.HTTP_400_BAD_REQUEST)