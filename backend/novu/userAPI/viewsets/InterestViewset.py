from django.shortcuts import get_object_or_404
from ..serializers import InterestSerializer
from rest_framework import viewsets, status, permissions
from rest_framework.response import Response
from django.http import JsonResponse
from ..models import Interest
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.decorators import action


class InterestViewset(viewsets.ModelViewSet):
    queryset = Interest.objects.all()
    serializer_class = InterestSerializer
    lookup_field = "user_id"
    lookup_url_kwarg = "pk"
    authentication_classes = [JWTAuthentication]
    
    
    def get_permissions(self):    
        if self.action in ['createFromUser', 'list', 'retrieveByEmail', "createFromAdmin"]:   # public routes | create Admin is Public for now 
            permission_classes = [permissions.AllowAny]
        elif self.action in ["retrieveStudyById", "saveStudy"]:  # Routes that require authentication
            permission_classes = [permissions.IsAuthenticated]
        else:                                    # PUT, PATCH, DELETE
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]

    #GET /api/interests/?user_id=1
    def list(self, request):
        user_id = request.query_params.get('user_id')
        if not user_id:
            return Response(
                {'error': 'Falta el user_id'},
                status=status.HTTP_400_BAD_REQUEST
            )
        interests = Interest.objects.filter(user_id=user_id)
        serializer = InterestSerializer(interests, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    #POST /api/interests
    @action(methods=["post"], detail=False)
    def saveInterest(self, request):
        user_id = request.data.get('user_id')
        interest_names = request.data.get('interests', [])

        if not user_id or not interest_names:
            return Response(
                {'error': 'Faltan datos'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        #Verify that user exists
        from ..models import User
        if not User.objects.filter(id=user_id).exists():
            return Response(
                {'error': f'No existe ningún usuario con id {user_id}'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        #Delete the previous and save the new ones
        Interest.objects.filter(user_id=user_id).delete()
        user = User.objects.get(id=user_id)
        for name in interest_names:
            Interest.objects.create(user_id=user, name=name)
        
        # set is_new to false
        
        if(user.is_new):
            user.is_new = False
            user.save()
        
        return Response(
            {'message': 'Intereses guardados correctamente'},
            status=status.HTTP_201_CREATED
        )

    
    def retrieve(self, request,pk=None):
        interests = Interest.objects.filter(user_id=pk)
        serializer = InterestSerializer(interests, many=True)
        return JsonResponse(serializer.data,safe=False)

        # Hacer que el feed del usuario se actualice cada vez que se actualicen sus intereses, que la funcion compare con todo los usuarios y sus intereses, y que recomiende sus cards de usuarios con intereses similares, .
    


