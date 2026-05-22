from django.shortcuts import get_object_or_404
from ..serializers import UserSerializer, LoginSerializer, UserSearchSerializer, UserProfileSerializer, CardTabSerializer, PhotoSerializer
from rest_framework import viewsets, status, permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from django.http import JsonResponse, Http404
from ..models import User, UserCard, Block, Swipe, CardTab, Photo, Match
from django.contrib.auth.hashers import check_password, make_password
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.db.models import F, Q # used to select fields and to execute additional functionality on the columns
from ..emailTemplates.emailUtilities import *
from django.core.files.base import ContentFile
import uuid, base64
from pathlib import Path
import os
# this is the equivalent to a controller
"""
Documentation for viewsets: https://www.django-rest-framework.org/api-guide/viewsets/#example

"""
class UserViewset(viewsets.ViewSet):
    # methods of a viewset
    # to list every model
    authentication_classes = [JWTAuthentication] # type of authentication
    def list(self, request):
        user_requesting_search = get_object_or_404(User, email=request.user)
        if not user_requesting_search.admin:
            return JsonResponse({"error": "user not allowed to enter this endpoint"})
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
        #user_requesting_creation_email = request.user
        new_user = request.data
        #user_requesting_creation = get_object_or_404(User, email=user_requesting_creation_email)

        #if not user_requesting_creation.admin:
        #    return JsonResponse({"error": "user not allowed to access this endpoint"}, status=status.HTTP_401_UNAUTHORIZED)

        serializer = UserSerializer(data=new_user)
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
        user_requesting_search = get_object_or_404(User, email=request.user)
        if not user_requesting_search.admin:
            return JsonResponse({"error": "user not allowed to enter this endpoint"})
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
        user_requesting = get_object_or_404(User, email=request.user)
        if not user_requesting.admin:
            return JsonResponse({"error": "user not allowed to enter this endpoint"})
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
        user_requesting_update = get_object_or_404(User, email=request.user)
        if not user_requesting_update.admin:
            return JsonResponse({"error": "user not allowed to enter this endpoint"})
        user = get_object_or_404(User, pk=pk)
        serializer = UserSerializer(user, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # admin update method
    @action(methods=['patch'], detail=True)
    def adminUserUpdate(self,request,id=None):
        user_requesting = get_object_or_404(User, email=request.user)
        if not user_requesting.admin:
            return JsonResponse({"error": "user not allowed to enter this endpoint"})
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
            user_requesting = get_object_or_404(User, email=request.user)
        except Http404:
            JsonResponse({"user not found"}, status=status.HTTP_404_NOT_FOUND)
        if not user_requesting.id == user.id:
            return JsonResponse({"error" : "access denied"}, status=status.HTTP_401_UNAUTHORIZED)
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


    @staticmethod
    def handle_tab_background(raw: str, user: User) -> str:
        if not raw or (isinstance(raw, str) and raw.strip() in ("", " ")):
            print(f"[tab_bg] Empty or sentinel value, returning ''")
            return ""

        if isinstance(raw, str) and raw.startswith("data:"):
            try:
                header, b64 = raw.split(",", 1)
                ext = header.split("/")[1].split(";")[0]
                filename = f"{uuid.uuid4()}.{ext}"
                file_content = ContentFile(base64.b64decode(b64), name=filename)

                photo = Photo.objects.create(
                    user_id=user,
                    url=file_content,
                    visible=True
                )
                print(f"[tab_bg] Photo created, pk: {photo.pk}, url field before refresh: {photo.url}")

                photo.refresh_from_db()
                print(f"[tab_bg] After refresh, url field: {photo.url}, url.url: {photo.url.url}")

                return photo.url.name

            except Exception as e:
                print(f"[tab_bg] Upload failed at: {e}")
                return ""

        print(f"[tab_bg] Raw value passed through: {raw}")
        return raw

    def updateUserProfile(self, request):
        BASE_DIR = Path(__file__).resolve().parent.parent.parent
        #  1. Fetch the user 
        user = get_object_or_404(User, email=request.user)

        profile_data = request.data.get("profile", {})
        tabs_data    = request.data.get("tabs", [])
        new_password = request.data.get("newPassword")

        #  2. Update profile fields 
        allowed_fields = {"name", "surnames", "date_of_birth", "gender", "height", "school_name"}
        for field in allowed_fields:
            if field in profile_data:
                setattr(user, field, profile_data[field])

        #  3. Handle profile picture (base64) 
        raw_pic = profile_data.get("profile_pic", "")
        if raw_pic and raw_pic.startswith("data:"):
            try:
                header, b64 = raw_pic.split(",", 1) # separate the b64 header from the actual content
                ext      = header.split("/")[1].split(";")[0] # get file extension
                filename = f"{uuid.uuid4()}.{ext}"

                file_content = ContentFile(base64.b64decode(b64), name=filename)

                photo = Photo.objects.create(
                    user_id=user,
                    url=file_content,
                    visible=True
                )
                photo.refresh_from_db()
                # print(f"{str(BASE_DIR / user.profile_pic)}")
                os.remove(str(BASE_DIR / user.profile_pic))
                user.profile_pic = str(photo.url)
            except Exception:
                return Response({"error": "Invalid profile picture"}, status=status.HTTP_400_BAD_REQUEST)

        #  4. Handle password change 
        if new_password:
            if len(new_password) < 8:
                return Response({"error": "Password must be at least 8 characters"}, status=status.HTTP_400_BAD_REQUEST)
            user.set_password(new_password)

        user.save()

        #  5. Update card tabs 
        try:
            user_card = UserCard.objects.get(pk=user.id)
        except UserCard.DoesNotExist:
            return Response({"error": "UserCard not found"}, status=status.HTTP_404_NOT_FOUND)

        existing_sections = set(
            CardTab.objects.filter(id_card=user_card).values_list("id_section", flat=True)
        )
        incoming_sections = set()

        for tab in tabs_data:
            id_section = tab.get("id_section")
            if id_section is None:
                continue

            incoming_sections.add(id_section)
            background_photo = self.handle_tab_background(
                raw=tab.get("background_photo", ""),
                user=user  # pass the already-fetched object instead of user_id
            )

            CardTab.objects.update_or_create(
                id_card=user_card,
                id_section=id_section,
                defaults={
                    "header": tab.get("header", "").strip(),
                    "sub_header":tab.get("sub_header", "").strip(),
                    "tab_biography":tab.get("tab_biography", "").strip(),
                    "background_photo": background_photo,
                },
            )

        #  6. Delete removed tabs 
        removed = existing_sections - incoming_sections
        if removed:
            CardTab.objects.filter(id_card=user_card, id_section__in=removed).delete()

        user_card.amount_tabs = CardTab.objects.filter(id_card=user_card).count()
        user_card.save()

        # 7. Return refreshed profile 
        serializer = UserSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)
    

        
    

        
        
        
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
        'interest_set',
        'study_set'
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
    
    @action(detail=True, methods=["get"])
    def getUserProfile(self, request, id=None):
        user_requesting_profile = get_object_or_404(User, email=request.user)
        #userList = User.objects.all().order_by(F("likes").desc()) # F allows us to select specific columns and run special functions on them like using desc to return the objects in descending order
        # serializer = UserSerializer(userList, many=True)
        user = User.objects.select_related('usercard').prefetch_related(
        'usercard__cardtab_set',
        'interest_set'
        ).get(id=id)
        if user_requesting_profile.admin == True:
            return JsonResponse(UserProfileSerializer(user).data, safe=False)
        elif user_requesting_profile.id == id:
            return JsonResponse(UserProfileSerializer(user).data, safe=False)
        else:
            return JsonResponse({"error": "you are not authorized to access this endpoint"}, status=status.HTTP_401_UNAUTHORIZED)
    # method to get another user's profile picture
    @action(detail=True, methods=["get"])
    def getUserProfilePic(self, request, id=None):
        # get users
        user_requesting_profile = get_object_or_404(User, email=request.user)
        requested_user_profile = get_object_or_404(User, id=id)
        try:
                # query if a match does exist with the requested user
                match_exists = Match.objects.filter(Q(user1_id_id=user_requesting_profile.id, user2_id_id=requested_user_profile.id) | Q(user1_id=requested_user_profile.id, user2_id=user_requesting_profile.id)).exists()
        except:
            return JsonResponse({"error": "you are not authorized to perform this action"}, status=status.HTTP_401_UNAUTHORIZED)
        if not match_exists:
            # rejects petition if the user does not have a match
            return JsonResponse({"error": "you are not authorized to perform this action"}, status=status.HTTP_401_UNAUTHORIZED)

        
        return JsonResponse({"profile_picture": UserSerializer(requested_user_profile).data.get("profile_pic")}, safe=False)
        # check if the user requesting it has any matches with that user 
        
        

    
    # to eliminate a user
    def destroy(self, request, id=None):
        user_requesting_deletion = get_object_or_404(User, email=request.user)
        if not user_requesting_deletion.admin:
            return JsonResponse({"error": "user not allowed to enter this endpoint"})
        try:
            user = get_object_or_404(User, pk=id) # user to be deleted
        except Http404:
            return JsonResponse({"error": "User Not found"}, status=status.HTTP_400_BAD_REQUEST)
        if not user_requesting_deletion.admin:
            return JsonResponse({"error": "Unauthorized action"}, status=status.HTTP_401_UNAUTHORIZED)
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