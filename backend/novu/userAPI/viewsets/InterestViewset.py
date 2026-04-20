from django.shortcuts import get_object_or_404
from ..serializers import InterestSerializer
from rest_framework import viewsets, status
from rest_framework.response import Response
from django.http import JsonResponse
from ..models import Interest


class InterestViewset(viewsets.ModelViewSet):
    queryset = Interest.objects.all()
    serializer_class = InterestSerializer


