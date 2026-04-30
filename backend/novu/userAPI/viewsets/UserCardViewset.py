from django.shortcuts import get_object_or_404
from ..serializers import UserCardSerializer
from rest_framework import viewsets, status
from rest_framework.response import Response
from django.http import JsonResponse
from ..models import UserCard, User

class UserCardViewset(viewsets.ModelViewSet):
    queryset = UserCard.objects.all()
    serializer_class = UserCardSerializer

    #GET /api/cards/?user_id=1
    def list(self, request):
        user_id = request.query_params.get('user_id')
        if not user_id:
            return Response(
                {'error':'Falta el user_id'},
                status=status.HTTP_400_BAD_REQUEST
            )

        user_card = UserCard.objects.filter(user_id=user_id)
        serializer = UserCardSerializer(user_card, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    #POST /api/cards/create
    def createUserCard(self, request):
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

        if UserCard.objects.filter(user_id=user_id).exists():
            return Response(
                {'error':f'Ya existe una UserCard para este usuario'},
                status=status.HTTP_409_CONFLICT
            )

        user_card = UserCard.objects.create(user_id=user_id)
        serializer = UserCardSerializer(user_card)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

        # GET /api/cards/<pk>/
        def retrieve(self, request, pk=None):
            user_card = get_object_or_404(UserCard, pk=pk)
            serializer = UserCardSerializer(user_card)
            return JsonResponse(serializer.data, safe=False)

        # GET /api/users/cards/with-tabs/?user_id=1
        def getCardWithTabs(self, request):
            user_id = request.query_params.get('user_id')

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


            user_card = UserCard.objects.prefetch_related('cardtab_set').get(user_id=user_id)

            data = {
                'user': user_card.user_id,
                'amount_tabs': user_card.amount_tabs,
                'tabs': [
                    {
                        'id_section': tab.id_section,
                        'id_card': tab.id_card_id,
                        'header': tab.header,
                        'sub_header': tab.sub_header,
                        'body': tab.body,
                        'tab_biography': tab.tab_biography,
                        'background_photo': tab.background_photo,
                    }
                    for tab in user_card.cardtab_set.all()
                ]
            }

            return Response(data, status=status.HTTP_200_OK)

           