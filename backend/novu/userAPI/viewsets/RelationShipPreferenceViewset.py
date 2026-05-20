from rest_framework import viewsets, status, permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework_simplejwt.authentication import JWTAuthentication
from ..models import Relationship_preference, User, User_relation_preference 
from ..serializers import RelationshipPreferenceSerializer


class RelationshipPreferenceViewset(viewsets.ModelViewSet):
    queryset = Relationship_preference.objects.all()
    serializer_class = RelationshipPreferenceSerializer
    authentication_classes = [JWTAuthentication]
 
    def get_permissions(self):
        return [permissions.IsAuthenticated()]
 
    # GET /api/users/relationship-preference/?user_id=1
    def list(self, request):
        user_id = request.query_params.get('user_id')
        if not user_id:
            return Response(
                {'error': 'Falta el user_id'},
                status=status.HTTP_400_BAD_REQUEST
            )
 
        user_pref = User_relation_preference.objects.filter(user_id=user_id).first()
        if not user_pref:
            return Response(
                {'error': 'No se encontró preferencia para este usuario'},
                status=status.HTTP_404_NOT_FOUND
            )
 
        serializer = RelationshipPreferenceSerializer(user_pref.preference_id)
        return Response(serializer.data, status=status.HTTP_200_OK)
 
    # POST /api/users/relationship-preference/save/
    @action(methods=['post'], detail=False, url_path='save')
    def save_preference(self, request):
        user_id = request.data.get('user_id')
        preference_type = request.data.get('preference')
 
        if not user_id or not preference_type:
            return Response(
                {'error': 'Faltan datos: user_id y preference son obligatorios'},
                status=status.HTTP_400_BAD_REQUEST
            )
 
        if not User.objects.filter(id=user_id).exists():
            return Response(
                {'error': f'No existe ningún usuario con id {user_id}'},
                status=status.HTTP_404_NOT_FOUND
            )
 
        user = User.objects.get(id=user_id)
 
        # Buscar o crear el tipo de preferencia en el catálogo
        preference, _ = Relationship_preference.objects.get_or_create(type=preference_type)
 
        # Actualizar si ya tiene una preferencia, crear si no
        user_pref, created = User_relation_preference.objects.update_or_create(
            user_id=user,
            defaults={'preference_id': preference}
        )
 
        action_done = 'creada' if created else 'actualizada'
        return Response(
            {'message': f'Preferencia de relación {action_done} correctamente'},
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK
        )

