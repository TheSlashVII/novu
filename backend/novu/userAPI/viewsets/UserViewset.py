
from django.shortcuts import get_object_or_404
from ..serializers import UserSerializer, LoginSerializer
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.http import JsonResponse, Http404
from ..models import User
from django.contrib.auth.hashers import check_password
from django.contrib.auth import login, logout 
from rest_framework_simplejwt.tokens import RefreshToken
# this is the equivalent to a controller
"""
Documentation for viewsets: https://www.django-rest-framework.org/api-guide/viewsets/#example

"""
class UserViewset(viewsets.ViewSet):
    # methods of a viewset
    # to list every model
    def list(self, request):
        queryset = User.objects.all()
        serializer = UserSerializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

# test function to try out the API functionality

    # to create a new model inside the database
    def create(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        

    # to get a specific user based on primary key (To be confirmed)
    def retrieve(self, request, pk=None):
        try:
            user = get_object_or_404(User, pk=pk)
        except Http404 :
            return JsonResponse({"errorMessage": "No user was found"})
        except:
            return JsonResponse({"error": "Something went wrong"})
        serializer = UserSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)
    # use Post for login functionality.
    def retrieveByEmail(self, request):
        loginSerializer= LoginSerializer(data=request.data)
        if loginSerializer.is_valid():
            email = loginSerializer.validated_data["email"]
            password = loginSerializer.validated_data["password"]
            try:
                user = get_object_or_404(User, email=email)
            except Http404:
                return JsonResponse({"errorMessage": "No user with the same credentials was found"})
            if check_password(password=password, encoded=user.password):
                # serializer = UserSerializer(user) # transform the django user model into json
                #login(request=request, user=user)
                refresh = RefreshToken.for_user(user)
                return JsonResponse({
                    "access": str(refresh.access_token),
                    "refresh" : str(refresh),
                }, status=status.HTTP_200_OK)
            return JsonResponse({"error": "Something went wrong"}, status=status.HTTP_401_UNAUTHORIZED)
        return JsonResponse({"error": "Something went wrong"}, status=status.HTTP_400_BAD_REQUEST)
        

    # to update a specific model 
    def update(self, request, pk=None):
        user = get_object_or_404(User, pk=pk)
        serializer = UserSerializer(user, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        

    # to update partially a new model
    def partial_update(self, request, pk=None):
        pass

    # to eliminate a model
    def destroy(self, request, pk=None):
        user = get_object_or_404(User, pk=pk)
        user.delete()
        return Response(
            {"message": "Usuario eliminado correctamente"},
            status=status.HTTP_204_NO_CONTENT
        )

    