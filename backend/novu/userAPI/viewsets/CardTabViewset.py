from django.shortcuts import get_object_or_404
from ..serializers import CardTabSerializer
from rest_framework import viewsets, status
from rest_framework.response import Response
from django.http import JsonResponse
from ..models import CardTab, UserCard, User

class CardTabViewset(viewsets.ModelViewSet):
    queryset = CardTab.objects.all()
    serializer_class = CardTabSerializer

    #GET /api/tabs/?user_id=1
    def list(self, request):
        user_id = request.query_params.get('user_id')
        if not user_id:
            return Response(
                {'error':'Falta el user_id'},
                status=status.HTTP_400_BAD_REQUEST
            )
        tabs = CardTab.objects.filter(card__user_id=user_id)
        serializer = CardTabSerialzier(tabs, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    #POST /api/tabs/create/
    def createCardTab(self, request):
        user_id = request.data.get('user_id')

        if not user_id:
            return Response(
                {'error':'Falta el user_id'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not Use.objects.filter(id=user_id).exists():
            return Response(
                {'error':f'No existe ningun usuario con id {user_id}'},
                status=status.HTTP_404_NOT_FOUND
            )

            user_card = get_object_or_404(UserCard, user_id=user_id)

            data = request.data.copy()
            data['card'] = user_card.user_id

            serializer = CardTabSerializer(data=data)
            if serializer.is_valid():
                serializer.save()
                user_card.amount_tabs = user_card.cardtab_set.count()
                user_card.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # GET /api/tabs/<pk>/
    def retrieve(self, request, pk=None):
        tab = get_object_or_404(CardTab, pk=pk)
        serializer = CardTabSerializer(tab)
        return JsonResponse(serializer.data, safe=False)

    # PUT /api/tabs/<pk>/
    def update(self, request, pk=None):
        tab = get_object_or_404(CardTab, pk=pk)
        serializer = CardTabSerializer(tab, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # PATCH /api/tabs/<pk>/
    def partial_update(self, request, pk=None):
        tab = get_object_or_404(CardTab, pk=pk)
        serializer = CardTabSerializer(tab, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # DELETE /api/tabs/<pk>/
    def destroy(self, request, pk=None):
        tab = get_object_or_404(CardTab, pk=pk)
        user_card = tab.card
        tab.delete()
        user_card.amount_tabs = user_card.cardtab_set.count()
        user_card.save()
        return Response(status=status.HTTP_204_NO_CONTENT)