from django.shortcuts import get_object_or_404
from ..serializers import CardTabSerializer, PhotoSerializer
from rest_framework import viewsets, status, permissions
from rest_framework.response import Response
from django.http import JsonResponse
from ..models import CardTab, UserCard, User, Photo
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.decorators import action
class CardTabViewset(viewsets.ModelViewSet):
    queryset = CardTab.objects.all()
    serializer_class = CardTabSerializer
    authentication_classes = [JWTAuthentication] # type of authentication
    
    def get_permissions(self):
        if self.action in ["createCardTab","partial_update"]:   # public routes | create Admin is Public for now 
            permission_classes = [permissions.AllowAny]
        elif self.action in ["retrieve" , "update", "destroy"]:  # Routes that require authentication
            permission_classes = [permissions.IsAuthenticated]
        else:                                    # PUT, PATCH, DELETE
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]

    #GET /api/tabs/?user_id=1
    def list(self, request):
        user_id = request.query_params.get('user_id')
        if not user_id:
            return Response(
                {'error':'Falta el user_id'},
                status=status.HTTP_400_BAD_REQUEST
            )
        tabs = CardTab.objects.filter(card__user_id=user_id)
        serializer = CardTabSerializer(tabs, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    #POST /api/tabs/create/
    @action(detail=False, methods=["post"])
    def createCardTab(self, request):
        user_id = request.data.get('user_id')

        if not user_id:
            return Response(
                {'error':'Falta el user_id'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not User.objects.filter(id=user_id).exists():
            return Response(
                {'error':f'No existe ningun usuario con id {user_id}'},
                status=status.HTTP_404_NOT_FOUND
            )

        try:
            user_card = get_object_or_404(UserCard, user_id=user_id) # Get the user's card, if it doesn't exist, return a 404 error
        except UserCard.DoesNotExist:
            return Response(
                {'error':f'No existe ninguna tarjeta de usuario con id {user_id}'},
                status=status.HTTP_404_NOT_FOUND
            )

        current_tab_id = CardTab.objects.filter(id_card=user_card.user_id).count() + 1 # Get the current number of tabs for the user's card and increment by 1 for the new tab ID

        data = request.data.copy()
        data['id_section'] = current_tab_id
        data['id_card'] = user_card.user_id
        # to store background photo inside the backend
        photoInfo = {"user_id": data['id_card'], "url": data['background_photo'], "visible":True}
        imageSerializer = PhotoSerializer(data=photoInfo)
        if imageSerializer.is_valid():
            imageSerializer.save()
            
        
        serializer = CardTabSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            user_card.amount_tabs = user_card.cardtab_set.count()
            user_card.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # GET /api/tabs/<pk>/
    def retrieve(self, request, pk=None):
        tabs = CardTab.objects.filter(id_card__user_id=pk)
        if not tabs.exists():
            return Response(
                {'error': f'No se encontraron tabs para el usuario {pk}'},
                status=status.HTTP_404_NOT_FOUND
            )
        serializer= CardTabSerializer(tabs, many=True)
        return JsonResponse(serializer.data, safe=False)

    # PUT /api/tabs/<pk>/
    def update(self, request, pk=None):
        tab = get_object_or_404(CardTab, id_card__user_id=pk, id_section=request.data.get("id_section"))
        serializer = CardTabSerializer(tab, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # PATCH /api/tabs/<pk>/
    def partial_update(self, request, pk=None, id_section=None):
        try:
            tab = get_object_or_404(CardTab, id_card__user_id=pk, id_section=id_section)
        except:
            return JsonResponse({"user not found"}, status=status.HTTP_404_NOT_FOUND)
        # to save the foto
        reqData = request.data.copy()
        # check if the user has uploaded a photo 
        if not reqData['background_photo'] == '':
            photoInfo = {"user_id": pk, "url": reqData['background_photo'], "visible":True}
            imageSerializer = PhotoSerializer(data=photoInfo)
            
            if imageSerializer.is_valid():
                imageSerializer.save()
            newPhoto = Photo.objects.filter(user_id=pk).last()
            request.data["background_photo"] = newPhoto
        serializer = CardTabSerializer(tab, data=request.data, partial=True) # transform the data into json 
        if serializer.is_valid():
            serializer.save()
            return JsonResponse(serializer.data, status=status.HTTP_200_OK)
        return JsonResponse(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # DELETE /api/tabs/<pk>/
    def destroy(self, request, pk=None, id_section=None):
        tab = get_object_or_404(CardTab, id_card__user_id=pk, id_section=id_section)
        user_card = tab.card
        tab.delete()
        user_card.amount_tabs = CardTab.objects.filter(id_card=user_card).count()
        user_card.save()
        return Response(status=status.HTTP_204_NO_CONTENT)