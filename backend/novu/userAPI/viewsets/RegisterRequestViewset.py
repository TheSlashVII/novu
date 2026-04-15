from django.shortcuts import get_object_or_404
from ..serializers import RequestSerializer
from rest_framework import viewsets
from rest_framework.response import Response
from django.http import JsonResponse
from ..models import Request

# Register request controller
class RequestViewset(viewsets.ViewSet):
    def create(self, request):
        
        
        pass