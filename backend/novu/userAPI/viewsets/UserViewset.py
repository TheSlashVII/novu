
from django.shortcuts import get_object_or_404
from ..serializers import UserSerializer
from rest_framework import viewsets
from rest_framework.response import Response
from django.http import JsonResponse
from ..models import User
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
        return Response(serializer.data)

# test function to try out the API functionality
    def test(self,request):
        testData = {"name": "Junior"}
        return JsonResponse(testData)

    # to create a new model inside the database
    def create(self, request):
        pass

    # to get a specific user based on primary key (To be confirmed)
    def retrieve(self, request, pk=None):
        pass

    # to update a specific model 
    def update(self, request, pk=None):
        pass

    # to update partially a new model
    def partial_update(self, request, pk=None):
        pass
    # to eliminate a model
    def destroy(self, request, pk=None):
        pass

    