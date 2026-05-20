from django.shortcuts import get_object_or_404
from ..serializers import StudySerializer
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.http import JsonResponse
from ..models import Study
from ..models import User
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.authentication import JWTAuthentication
class StudyViewset(viewsets.ModelViewSet):
    queryset = Study.objects.all()
    serializer_class = StudySerializer
    lookup_field = "user_id"
    lookup_url_kwarg = "pk"
    authentication_classes = [JWTAuthentication]
    
    
    def get_permissions(self):
        
        if self.action in ['createFromUser', 'list', 'retrieveByEmail', "createFromAdmin", "list_all"]:   # public routes | create Admin is Public for now 
            permission_classes = [permissions.AllowAny]
        elif self.action in ["retrieveStudyById", "saveStudy"]:  # Routes that require authentication
            permission_classes = [permissions.IsAuthenticated]
        else:                                    # PUT, PATCH, DELETE
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]

    #GET /api/studies/?user_id=1
    def list(self, request):
        user_id = request.query_params.get('user_id')
        if not user_id:
            return Response(
                {'error': 'Falta el user_id'},
                status = status.HTTP_400_BAD_REQUEST
            )
        studies = Study.objects.filter(user_id=user_id)
        serializer = StudySerializer(studies, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    #POST /api/studies/save/
    @action(methods=["post"], detail=False)
    def saveStudy(self, request):
        user_id = request.data.get('user_id')
        study_name = request.data.get('study_name')

        if not user_id or not study_name:
            return Response(
                {'error': 'Faltan datos: se requiere user_id y study_name'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Verify that user exists
        from ..models import User
        if not User.objects.filter(id=user_id).exists():
            return Response(
                {'error': f'No existe ningun usuario con id {user_id}'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Delete the previous study and save the new one (user only has one current study)
        Study.objects.filter(user_id=user_id).delete()

        # Create the new study
        Study.objects.create(user_id=user_id, name=study_name)

        return Response(
            {'message': 'Estudio guardado correctamente'},
            status=status.HTTP_201_CREATED
        )

    # GET /api/studies/retrieve/<user_id>/
    @action(methods=["get"], detail=False)
    def retrieveStudyById(self, request, pk=None):
        studies = Study.objects.filter(user_id=pk)
        serializer = StudySerializer(studies, many=True)
        return JsonResponse(serializer.data, safe=False)

    # PUT /api/studies/update/
    def update(self, request, pk=None):
        user_id = request.data.get('user_id')
        study_name = request.data.get('study_name')

        if not user_id or not study_name:
            return Response(
                {'error': 'Faltan datos: se requiere user_id y study_name'},
                status=status.HTTP_400_BAD_REQUEST
            )

    # Verify that user exists

        if not User.objects.filter(id=user_id).exists():
            return Response(
                {'error': f'No existe ninugn usuario con id {user_id}'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Update or create the study
        study, created = Study.objects.update_or_create(
            user_id_id=user_id,
            defaults={'name': study_name}
        )

        return Response(
            {'message':'Estudio actualizado correctamente'},
            status=status.HTTP_200_OK
        )
    
    @action(methods=['get'], detail=False)
    def list_all(self, request):
        names = (
            Study.objects
            .values_list('name',flat=True)
            .distinct()
            .order_by('name')
        )
        return Response([{'name': n} for n in names], status=status.HTTP_200_OK)