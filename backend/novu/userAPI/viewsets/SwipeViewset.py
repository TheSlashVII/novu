# swipe_viewsets.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth.models import User
from ..models import Swipe, Match
from ..serializers import SwipeSerializer, MatchSerializer
from django.shortcuts import get_object_or_404
from django.http import JsonResponse, Http404

class SwipeViewset(viewsets.ModelViewSet):
    queryset = Swipe.objects.all()
    serializer_class = SwipeSerializer
    lookup_field = "origin_user_id"
    lookup_url_kwarg = "pk"

    # POST /api/swipes/register/
    @action(detail=False, methods=['post'])
    def register_swipe(self, request):
        """
        Registrar un like o skip
        El match solo se crea cuando AMBOS se han dado like mutuamente
        """
        serializer = SwipeSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        origin_user_id = serializer.validated_data["origin_user_id"] #  request.data.get('origin_user_id')
        target_user_id = serializer.validated_data["target_user_id"]
        matched = serializer.validated_data["matched"] # True = like, False = skip

        if not matched:
            swipe, created = Swipe.objects.update_or_create(
                origin_user_id=origin_user_id,
                target_user_id=target_user_id,
                defaults={'matched': False}
            )
            return Response({
                'success': True,
                'swipe_registered': True,
                'matched': False,
                'match_created': False
            }, status=status.HTTP_201_CREATED)
        # Verificar que los usuarios existen

        # Si es SKIP, solo guardar el swipe y no crear match
        if not matched:
            swipe, created = Swipe.objects.update_or_create(
                origin_user_id=origin_user_id,
                target_user_id=target_user_id,
                defaults={'matched': False}
            )
            return Response({
                'success': True,
                'swipe_registered': True,
                'matched': False,
                'match_created': False
            }, status=status.HTTP_201_CREATED)

        # Si es LIKE, guardar el swipe
        swipe, created = Swipe.objects.update_or_create(
            origin_user_id=origin_user_id,
            target_user_id=target_user_id,
            defaults={'matched': True}
        )

        response_data = {
            'success': True,
            'swipe_registered': True,
            'matched': True,
            'match_created': False
        }

        # Verificar si el target_user también ha dado like al origin_user
        # O sea, si existe un swipe donde:
        # origin_user_id = target_user AND target_user_id = origin_user AND matched = True
        reverse_swipe = Swipe.objects.filter(
            origin_user_id=target_user_id,
            target_user_id=origin_user_id,
            matched=True
        ).exists()

        # Si existe el like mutuo, crear el match
        if reverse_swipe:
            # Ordenar IDs para tener consistencia
            user1_id = min(origin_user_id.pk, target_user_id.pk)
            user2_id = max(origin_user_id.pk, target_user_id.pk)

            # Crear el match si no existe
            match, match_created = Match.objects.get_or_create(
                user1_id_id=user1_id,
                user2_id_id=user2_id,
                defaults={'active': True}
            )

            response_data['match_created'] = True
            response_data['match_id'] = match.id
            response_data['message'] = '¡Es un match! Ambos se dieron like'

        return Response(response_data, status=status.HTTP_201_CREATED)

    # GET /api/swipes/check-match/?user1=1&user2=2
    def check_match(self, request):
        """
        Verificar si dos usuarios tienen match mutuo
        """
        user1 = request.query_params.get('user1')
        user2 = request.query_params.get('user2')

        if not user1 or not user2:
            return Response(
                {'error': 'Faltan user1 o user2'},
                status=status.HTTP_400_BAD_REQUEST
            )

        user1_id = min(int(user1), int(user2))
        user2_id = max(int(user1), int(user2))

        match = Match.objects.filter(
            user1_id=user1_id,
            user2_id=user2_id,
            active=True
        ).first()

        # También verificar que ambos se hayan dado like
        swipe1 = Swipe.objects.filter(
            origin_user_id=user1,
            target_user_id=user2,
            matched=True
        ).exists()
        
        swipe2 = Swipe.objects.filter(
            origin_user_id=user2,
            target_user_id=user1,
            matched=True
        ).exists()

        return Response({
            'match_exists': match is not None,
            'both_liked': swipe1 and swipe2,
            'match': {
                'id': match.id,
                'active': match.active
            } if match else None
        })

    # GET /api/swipes/user/<int:user_id>/
    def get_user_swipes(self, request, user_id=None):
        """
        Obtener todos los swipes de un usuario
        """
        try:
            swipes = Swipe.objects.filter(origin_user_id=user_id)
            serializer = SwipeSerializer(swipes, many=True)
            return JsonResponse(serializer.data, safe=False)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
