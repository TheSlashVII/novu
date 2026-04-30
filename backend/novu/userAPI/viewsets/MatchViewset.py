# swipe_viewsets.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth.models import User
from ..models import Swipe, Match
from ..serializers import SwipeSerializer, MatchSerializer

class MatchViewset(viewsets.ModelViewSet):
    queryset = Match.objects.all()
    serializer_class = MatchSerializer
    lookup_field = "user1_id"
    lookup_url_kwarg = "pk"

    # GET /api/matches/user/<int:user_id>/
    def get_user_matches(self, request, user_id=None):
        """
        Obtener todos los matches de un usuario
        """
        try:
            matches = Match.objects.filter(
                user1_id=user_id
            ) | Match.objects.filter(
                user2_id=user_id
            )
            serializer = MatchSerializer(matches, many=True)
            return JsonResponse(serializer.data, safe=False)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )