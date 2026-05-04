# swipe_viewsets.py
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth.models import User
from ..models import Swipe, Match
from ..serializers import SwipeSerializer, MatchSerializer
from django.http import JsonResponse
from rest_framework_simplejwt.authentication import JWTAuthentication

class MatchViewset(viewsets.ModelViewSet):
    queryset = Match.objects.all()
    serializer_class = MatchSerializer
    lookup_field = "user1_id"
    lookup_url_kwarg = "pk"
    authentication_classes = [JWTAuthentication] # type of authentication

    def get_permissions(self):
        if self.action in []:   # public routes | create Admin is Public for now 
            permission_classes = [permissions.AllowAny]
        elif self.action in ["get_user_matches"]:  # Routes that require authentication
            permission_classes = [permissions.IsAuthenticated]
        else:                                    # PUT, PATCH, DELETE
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    # GET /api/matches/user/<int:user_id>/
    @action(detail=True, methods=["get"])
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