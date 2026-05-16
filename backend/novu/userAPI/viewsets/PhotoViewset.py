from django.shortcuts import get_object_or_404
from ..serializers import UserCardSerializer, PhotoSerializer
from rest_framework import viewsets, status, permissions
from rest_framework.response import Response
from django.http import JsonResponse
from ..models import UserCard, User, Photo
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.decorators import action
import os
from pathlib import Path

class PhotoViewset(viewsets.ModelViewSet):
    queryset = Photo.objects.all()
    authentication_classes = [JWTAuthentication]
    
    
    def get_permissions(self):
        if self.action in ["uploadPhoto", "deletePhoto"]:   # public routes | create Admin is Public for now 
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
    @action(methods=["delete"], detail=True)
    def deletePhoto(self, request, id=None):
        """

        This function awaits this body = 
        {
            url:string,

        }
        and the id on the url is for the user
        """
        reqData = request.data.copy()
        try:
            photoToDelete = get_object_or_404(Photo, user_id=id, url=reqData["url"])
        except Exception:
            return JsonResponse({"error": "user not found"}, status=status.HTTP_404_NOT_FOUND)
        BASE_DIR = Path(__file__).resolve().parent.parent.parent
        dirToRemove = str(BASE_DIR / str(photoToDelete.url))
        try:
            os.remove(dirToRemove)
        except FileNotFoundError:
            return JsonResponse({"message": "no photos to delete"}, status=status.HTTP_200_OK)
        except Exception:
            return JsonResponse({"error": "something went wrong"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        photoToDelete.delete()
        return JsonResponse({"message" : "Photo was deleted successfully"}, status=status.HTTP_204_NO_CONTENT)
    
    @action(methods=["patch"], detail=True)
    def updateProfilePicture(self, request, id=None):
        """
        this is a method to update the profile picture of the user
        Expecting

        {
            url: string # image url path on the server
        }
        """
        try:
            user = get_object_or_404(User, pk=id)
        except Exception:
            return JsonResponse({"Error":"User not found"}, status=status.HTTP_404_NOT_FOUND)
        reqData = request.data.copy()
        photoInfo = {"user_id": id, "url": reqData['background_photo'], "visible":True}
        newPhoto = PhotoSerializer(data=photoInfo)
        if newPhoto.is_valid():
            user.profile_pic = newPhoto.validated_data["url"]
            user.save()
            return JsonResponse({"message": "profile picture updated"}, status=status.HTTP_201_CREATED)
        return JsonResponse({"error":"incorrect data"}, status=status.HTTP_400_BAD_REQUEST)
        
    
        
        

