from django.shortcuts import get_object_or_404
from ..serializers import UserSerializer, LoginSerializer, UserSearchSerializer, UserProfileSerializer
from rest_framework import viewsets, status, permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from django.http import JsonResponse, Http404
from ..models import User, UserCard, Block, Swipe, CardTab
from django.contrib.auth.hashers import check_password, make_password
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.db.models import F, Q # used to select fields and to execute additional functionality on the columns
from ..emailTemplates.emailUtilities import *
# this is the equivalent to a controller
"""
Documentation for viewsets: https://www.django-rest-framework.org/api-guide/viewsets/#example

"""
class UserViewset(viewsets.ViewSet):
    # methods of a viewset
    # to list every model
    authentication_classes = [JWTAuthentication] # type of authentication
    def list(self, request):
        if(not request.data.get("is_admin")):
            return JsonResponse({"message":"Unauthorized Access"}, status=status.HTTP_401_UNAUTHORIZED)
        queryset = User.objects.all()
        serializer = UserSerializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def get_permissions(self):
        if self.action in ['isUserAdmin','createFromUser', 'retrieveByEmail', "createFromAdmin", "getMostLikedProfiles", "getUserProfiles", "getBlockedIds"]:   # public routes
            permission_classes = [permissions.AllowAny]
        elif self.action in ['retrieve',"adminUserUpdate", "retrieveUserById", 'test', "retrieveByName", "partial_update", "modifyUserAccess", "destroy", "activeUsersCount", ]:  # Routes that require authentication
            permission_classes = [permissions.IsAuthenticated]
        else:                                    # PUT, PATCH, DELETE
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]
    

    @action(methods=["post"], detail=True)
    def isUserAdmin(self, request):
        userID = request.data.get("user_id")
        try:
            user = get_object_or_404(User, pk=int(userID))
        except Http404:
            JsonResponse({"message": "no user was found"})
        except Exception:
            JsonResponse({"message": "something went wrong"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return JsonResponse({"is_admin" : user.admin}, status=status.HTTP_200_OK)

    # to create a new model inside the database
    @action(methods=["post"], detail=False)
    def createFromUser(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            sendAcceptedEmail(email=str(serializer.validated_data["email"]), name=str(serializer.validated_data["name"]))
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    # separate user creation for admins
    @action(methods=["post"], detail=False)
    def createFromAdmin(self, request):
        
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.validated_data["password"] = make_password(serializer.validated_data["password"]) # overrides the plain text password inserted by the admin
            serializer.validated_data["is_active"] = True # to enforce that the session is created correctly
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        

    # to get a specific user based on primary key (To be confirmed)
    @action(methods=["get"], detail=False)
    def retrieveUserById(self, request, id=None):
        try:
            user = get_object_or_404(User, pk=id)
        except Http404 :
            return JsonResponse({"errorMessage": "No user was found"})
        except:
            return JsonResponse({"error": "Something went wrong"})
        serializer = UserSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    # use Post for login functionality.
    @action(methods=["post"], detail=False)
    def retrieveByEmail(self, request):
        loginSerializer= LoginSerializer(data=request.data) # serialize the login form data
        if loginSerializer.is_valid():
            # retrieve the form field data
            email = loginSerializer.validated_data["email"] 
            password = loginSerializer.validated_data["password"]
            try:
                user = User.objects.get(email=email) # user search
            except User.DoesNotExist:
                # catch the error in case of the user not being found
                return JsonResponse({"error": "No se encontró un usuario con las mismas credenciales"}, status=status.HTTP_401_UNAUTHORIZED)
            except:
                return JsonResponse({"error": "No se encontró un usuario con las mismas credenciales"}, status=status.HTTP_401_UNAUTHORIZED)
            # compare the passwords inserted into the database and the ones queried by the user
            if check_password(password=password, encoded=user.password):
                refresh = RefreshToken.for_user(user) # generate tokens for the user
                # serialize the user
                isUserRestricted = user.restricted
                isUserNew = user.is_new
                # send the tokens to the user
                return JsonResponse({
                    "access": str(refresh.access_token), # JWT Access token
                    "refresh" : str(refresh), # JWT Refresh Token
                    "is_new" : isUserNew, # send the boolean value of is new to skip the login process
                    "is_restricted" : isUserRestricted # sends a boolean of the status of the user if he is restricted to access the app
                }, status=status.HTTP_200_OK)
            return JsonResponse({"error": "No se encontró un usuario con las mismas credenciales"}, status=status.HTTP_401_UNAUTHORIZED)
        return JsonResponse({"error": "Invalid data"}, status=status.HTTP_400_BAD_REQUEST)
    
    # function used to search the name of the user
    @action(methods=["post"], detail=False)
    def retrieveByName(self, request):
        serializer = UserSearchSerializer(data=request.data) # serialize the HTTP request body
        if serializer.is_valid():
            userList = User.objects.all()
            
            # filtering process | filter by name field
            userSearchResultList = userList.filter(name__contains=serializer.validated_data["name"]) # get fields with 
            results = UserSerializer(userSearchResultList, many=True) # serialize the data to be able to be parsed as json
            return JsonResponse(list(results.data), safe=False)   # list function transforms data into a list. (Inserts the data inside an array)
        else:
            return JsonResponse({"error" : "Bad Request"}, status=status.HTTP_400_BAD_REQUEST) # returns this if the data inserted was incorrect
        
    @action(methods=["put"], detail=False)
    def modifyUserAccess(self, request):
        serializer = UserSerializer(data=request.data, partial=True) # serialize the HTTP request body
        if serializer.is_valid():
            user_id = request.data.get("id")
            try:
                user = get_object_or_404(User, pk=user_id) # search the user
            except Http404:
                return JsonResponse({"message": "User not found"}, status=status.HTTP_404_NOT_FOUND) 
            user.restricted = serializer.validated_data["restricted"]
            user.restricted_at = serializer.validated_data["restricted_at"]
            user.restricted_reason = serializer.validated_data["restricted_reason"]
            user.save()
            # filtering process | filter by name field
            return JsonResponse({"message": "User was updated successfuly"})   # list function transforms data into a list. (Inserts the data inside an array)
        else:
            return JsonResponse({"error" : "Bad Request","message" : serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
            
    # to update a specific model 
    def update(self, request, pk=None):
        user = get_object_or_404(User, pk=pk)
        serializer = UserSerializer(user, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # admin update method
    @action(methods=['patch'], detail=True)
    def adminUserUpdate(self,request,id=None):
        try:
            user = get_object_or_404(User, pk=id)
        except Http404:
            JsonResponse({"error": "user not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            JsonResponse({"message": "Something went wrong"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        serializer = UserSerializer(user, data=request.data, partial=True)
        
        if serializer.is_valid():
            if(not serializer.validated_data["password"] == user.password):
                serializer.validated_data["password"] = make_password(serializer.validated_data["password"])
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


        

    @action(methods=["patch"], detail=False)
    def updateUserAge(self, request, pk=None):
        try:
            user = get_object_or_404(User, pk=pk)
        except Http404:
            JsonResponse({"user not found"}, status=status.HTTP_404_NOT_FOUND)
        user.age = int(request.data.get("age"))
        user.save()
        return JsonResponse({"message" : "age updated"},status=status.HTTP_200_OK, safe=False)
    
    @action(methods=["patch"], detail=False)
    def updateUserGender(self, request, pk=None):
        try:
            user = get_object_or_404(User, pk=pk)
        except Http404:
            JsonResponse({"user not found"}, status=status.HTTP_404_NOT_FOUND)
        user.gender = str(request.data.get("gender"))
        user.save()
        return JsonResponse({"message" : "Gender updated"},status=status.HTTP_200_OK, safe=False)
    
    """
    # update user
    def updateUser(self, request, id=None):
        try:
            user = get_object_or_404(User, pk=id)
        except Http404:
            return JsonResponse({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
    """        
        
    @action(detail=False, methods=["put"])
    def updateIsNewStatus(self, request, id=None):
        # expected parameters: {is_new:boolean} (integer 0 or 1) 
        try:
            user = get_object_or_404(User, pk=id)
        except Http404:
            return JsonResponse({"error" : "User not found"})
        except:
            return JsonResponse({"error":"Something went wrong"})
        newStatus = request.data.get("is_new")
        if(int(newStatus) == 1):
            user.is_new = True
        else:
            user.is_new = False
        
        try:
            user.save()
        except:
            return JsonResponse({"error" : "something went wrong"})
        return JsonResponse({"message":"Updated status"}, status=status.HTTP_200_OK)
        
    @action(detail=False, methods=["get"])
    def activeUsersCount(self,request):
        userCount = User.objects.all().count() # returns the amount of users available at the database currently
        return JsonResponse({"count" : userCount})
    
    #function to get the most liked profiles
    @action(detail=False, methods=["get"])
    def getMostLikedProfiles(self, request):
        #userList = User.objects.all().order_by(F("likes").desc()) # F allows us to select specific columns and run special functions on them like using desc to return the objects in descending order
        # serializer = UserSerializer(userList, many=True)
        users = User.objects.select_related('usercard').prefetch_related(
        'usercard__cardtab_set').order_by(F('likes').desc())[:2]
        return JsonResponse({"join_test" : list(UserProfileSerializer(users, many=True).data)}, safe=False)
    
    #function to block users
    @action(detail=False, methods=["post"])
    def blockUser(self, request):
        """
        POST /api/users/block/
        Blocks a user from the chat detail view
        """
        id_logged_user = request.data.get('id_logged_user')
        id_blocked_user = request.data.get('id_blocked_user')
        reason = request.data.get('reason', 'Bloqueado desde el chat')
        
        if not id_logged_user or not id_blocked_user:
            return JsonResponse({'error': 'Missing fields.'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            Block.objects.get_or_create(
                id_logged_user_id=id_logged_user,
                id_blocked_user_id=id_blocked_user,
                defaults={'reason': reason}
            )
            return JsonResponse({'message': 'User blocked succesfully.'}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
    @action(detail=False, methods=["get"])
    def getBlockedIds(self, request):
        user_id = request.query_params.get("user_id")
        if not user_id:
            return JsonResponse({'error': 'Missing user_id'}, status=400)
        
        blocked = Block.objects.filter(
            Q(id_logged_user=user_id) | Q(id_blocked_user=user_id)
        ).values_list("id_logged_user", "id_blocked_user")
        
        flat = set()
        for a, b in blocked:
            flat.add(a)
            flat.add(b)
        flat.discard(int(user_id))
        
        return JsonResponse({'blocked': list(flat)})
        

    @action(detail=False, methods=["get"])
    def getUserProfiles(self, request):
        #userList = User.objects.all().order_by(F("likes").desc()) # F allows us to select specific columns and run special functions on them like using desc to return the objects in descending order
        # serializer = UserSerializer(userList, many=True)
        current_user_id = request.query_params.get("current_user_id")
        
        users = User.objects.select_related('usercard').prefetch_related(
        'usercard__cardtab_set',
        'interest_set'
        )
        
        if current_user_id:
            blocked_ids = Block.objects.filter(
                Q(id_logged_user=current_user_id) | Q(id_blocked_user=current_user_id)
            ).values_list("id_logged_user", "id_blocked_user")
            
            blocked_flat = set()
            for a, b in blocked_ids:
                blocked_flat.add(a)
                blocked_flat.add(b)
            blocked_flat.discard(int(current_user_id))
            
            users = users.exclude(id__in=blocked_flat).exclude(id=current_user_id)
            
        return JsonResponse( list(UserProfileSerializer(users, many=True).data), safe=False)
    
    @action(detail=False, methods=["get"])
    def getUserProfile(self, request, id=None):
        #userList = User.objects.all().order_by(F("likes").desc()) # F allows us to select specific columns and run special functions on them like using desc to return the objects in descending order
        # serializer = UserSerializer(userList, many=True)
        users = User.objects.select_related('usercard').prefetch_related(
        'usercard__cardtab_set',
        'interest_set'
        ).get(id=id)
        return JsonResponse(UserProfileSerializer(users).data, safe=False)
    # to eliminate a user
    def destroy(self, request, id=None):
        try:
            user = get_object_or_404(User, pk=id)
        except Http404:
            return JsonResponse({"error": "User Not found"}, status=status.HTTP_400_BAD_REQUEST)
        except OSError: # treat error in case it tries to delete a file that does not exist
            return JsonResponse({"message" : "User deleted", "warning" : "attempted to delete a non-existing file"}, status=status.HTTP_204_NO_CONTENT)
        user.delete()
        return Response({"message": "User deleted"}, status=status.HTTP_204_NO_CONTENT)

    @action(detail=False, methods=["post"])
    def getFilteredProfiles(self, request):
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
        interests_list = data.get("interests", [])
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

        if min_age is not None or max_age is not None:
            users = users.exclude(age__isnull=True)

        if min_age is not None:
            users = users.filter(age__gte=int(min_age))

        if max_age is not None:
            users = users.filter(age__lte=int(max_age))

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