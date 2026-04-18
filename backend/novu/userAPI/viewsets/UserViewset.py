
from django.shortcuts import get_object_or_404
from ..serializers import UserSerializer
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.http import JsonResponse, Http404
from ..models import User
from django.contrib.auth.hashers import check_password
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
    def test(self,request):
        testData = {"name": "Junior"}
        return Response(testData)
    def test2(self,request):
        
        return JsonResponse(request, safe=False)

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
        data = request.data
        email = str(data.email)
        password = str(data.password) 
        try:
            user = get_object_or_404(User, email=email, password=password)
        except Http404:
            return JsonResponse({"errorMessage": "No user with the same credentials was found"})
        if check_password(password=password):
            serializer = UserSerializer(user) # transform the django user model into json
            return JsonResponse(serializer.data, status=status.HTTP_200_OK)
        return JsonResponse({"error": "Something went wrong"})
        

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

    