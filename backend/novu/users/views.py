# from django.shortcuts import render
from rest_framework.response import Response
from rest_framework.decorators import api_view
from .serializers import *
from .models import *

# Create your views here.

@api_view(['GET'])
def getUsers(request):
    Users = User.objects.all()
    serialization = UserSeralizer(Users, many=True)
    return Response(serialization)

@api_view(['GET'])
def getAllUsers(request):
    users = {"name": "Samba","pass":"samba1"}
    return Response(users)
    
