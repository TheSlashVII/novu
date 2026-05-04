
from django.shortcuts import get_object_or_404
from ..serializers import UserSerializer, LoginSerializer
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.http import JsonResponse, Http404
from ..models import User
from django.contrib.auth.hashers import check_password, make_password
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated, AllowAny
# this is the equivalent to a controller
"""
Documentation for viewsets: https://www.django-rest-framework.org/api-guide/viewsets/#example

"""
class UserViewset(viewsets.ViewSet):
    # methods of a viewset
    # to list every model
    def list(self, request):
        queryset = User.objects.all()
        serializer = UserSerializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    # to create a new model inside the database
    def create(self, request):
        serializer = UserSerializer(data=request.data)
        self.permission_classes = [AllowAny]
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    # separate user creation for admins
    def createFromAdmin(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.validated_data["password"] = make_password(serializer.validated_data["password"]) # overrides the plain text password inserted by the admin
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        

    # to get a specific user based on primary key (To be confirmed)
    def retrieve(self, request, id=None):
        try:
            user = get_object_or_404(User, pk=id)
        except Http404 :
            return JsonResponse({"errorMessage": "No user was found"})
        except:
            return JsonResponse({"error": "Something went wrong"})
        serializer = UserSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)
    # use Post for login functionality.
    def retrieveByEmail(self, request):
        loginSerializer= LoginSerializer(data=request.data) # serialize the login form data
        if loginSerializer.is_valid():
            # retrieve the form field data
            email = loginSerializer.validated_data["email"] 
            password = loginSerializer.validated_data["password"]
            try:
                user = get_object_or_404(User, email=email) # user search
            except Http404:
                # catch the error in case of the user not being found
                return JsonResponse({"errorMessage": "No user with the same credentials was found"})
            # compare the passwords inserted into the database and the ones queried by the user
            if check_password(password=password, encoded=user.password):
                refresh = RefreshToken.for_user(user) # generate tokens for the user
                # send the tokens to the user
                return JsonResponse({
                    "access": str(refresh.access_token),
                    "refresh" : str(refresh)
                }, status=status.HTTP_200_OK)
            return JsonResponse({"error": "No user with the same credentials was found"}, status=status.HTTP_401_UNAUTHORIZED)
        return JsonResponse({"error": "Invalid data"}, status=status.HTTP_400_BAD_REQUEST)
        

    # to update a specific model 
    def update(self, request, pk=None):
        user = get_object_or_404(User, pk=pk)
        serializer = UserSerializer(user, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        

    # to update partially a new model
    def partial_update(self, request, pk=None):
        pass

    # to eliminate a user
    def destroy(self, request, id=None):
        try:
            user = get_object_or_404(User, pk=id)
        except Http404:
            return JsonResponse({"error": "User Not found"}, status=status.HTTP_400_BAD_REQUEST)
        user.delete()
        return Response(
            {"message": "User deleted"},
            status=status.HTTP_204_NO_CONTENT
        )

    @action(detail=false, methods=["post"])
    def getFilteredProfiles(self, request)
        """
        Body JSON esperado:
        {
            "current_user_id": 1,
            "min_age": 18,
            "max_age": 25,
            "interests": ["música", "deportes"],
            "goals": ["viajar", "estudiar"],
            "studies": ["ingeniería", "medicina"],
            "relation_preference": ["dating", "friendship"],
            "gender": "female"
        }
        """
    
    # 1. Parametros del body
    data = request.data
    current_user_id = data.get("current_user_id")
    min_age = data.get("min_age")
    max_age = data.get("max_age")
    interests = data.get("interests", [])
    goals_list = data.get("goals", [])
    studies_list = data.get("studies", [])
    relation_list = data.get("relation_preference", [])
    gender_param = data.get("gender","")

    # 2. QuerySet base
    users = (
        User.objects.select_related("usercard").prefetch_related("usercard__cardtab_set",
        "interest_set","goal_set","study_set","user_relation_preference_set__preference_id",).filter(show_me=True)
    )

    # 3. Excluir ususario logueado, bloqueados y ya-swipeados
    if current_user_id:
        users = users.exclude(id=current_user_id)

        blocked_ids = Block.objects.filter(Q(id_logged_user=current_user_id) | Q(id_blocked_user=current_user_id)).values_list("id_logged_user", "id_blocked_user")

        blocked_flat = set()
        for a, b in blocked_ids:
            blocked_flat.add(a)
            blocked_flat.add(b)
        blocked_flat.discard(int(current_user_id))
        users = users.exclude(id__in=blocked_flat)

        already_swiped = Swipe.objects.filter(origin_user_id=current_user_id).values_list("target_user_id", flat=True)
        users = users.exclude(id__in=already_swiped)

    # 4. Filtro por edad
    today = date.today()

    if min_age is not None:
        max_dob = date(today.year - int(min_age), today.month, today.day)
        users = users.filter(date_of_birth__lte=max_dob)

    if max_age is not None:
        min_dob = date(today.year - int(max_age) - 1, today.month, today.day + 1)
        users = users.filter(date_of_birth__gte=min_dob)

    # 5. Filtro por género
    if gender_param:
        users = users.filter(gender__iexact=gender_param)

    # 6. Filtro por intereses
    if interests_list:
        users = users.filter(interest__name__in=interests_list).distinct()
    
    # 7. filtro por objetivos
    if goals_list:
        users = users.filter(goal__description__in=goals_list).distinct()

    # 8. filtro por estudios
    if studies_list:
        users = users.filter(Q(study__name__in=studies_list) | Q(school_name__icontains=studies_list[0])).distinct()

    # 9. filtro por preferencia de relacion
    if relation_list:
        users = users.filter(user_relation_preference__preference_id__type__in=relation_list).distinct()

    # 10. Respuesta
    serializer = UserProfileSerializer(users, many=True)
    return JsonResponse({
        "filters_applied":{
            "min_age": min_age,
            "max_age": max_age,
            "interests": interests_list or None,
            "goals": goals_list or None,
            "studies": studies_list or None,
            "relation_preference": relation_list or None,
            "gender": gender_param or None
        },
        "profiles": list(serializer.data)
    },
    safe=False,
)