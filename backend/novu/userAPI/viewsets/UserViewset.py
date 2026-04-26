
from django.shortcuts import get_object_or_404
from ..serializers import UserSerializer, LoginSerializer, UserSearchSerializer
from rest_framework import viewsets, status, permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from django.http import JsonResponse, Http404
from ..models import User
from django.contrib.auth.hashers import check_password, make_password
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.authentication import JWTAuthentication
# this is the equivalent to a controller
"""
Documentation for viewsets: https://www.django-rest-framework.org/api-guide/viewsets/#example

"""
class UserViewset(viewsets.ViewSet):
    # methods of a viewset
    # to list every model
    authentication_classes = [JWTAuthentication]
    def list(self, request):
        queryset = User.objects.all()
        serializer = UserSerializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def get_permissions(self):
        if self.action in ['createFromUser', 'list', 'retrieveByEmail', "createFromAdmin"]:   # public routes | create Admin is Public for now 
            permission_classes = [permissions.AllowAny]
        elif self.action in ['retrieve', "retrieveUserById", 'test', "retrieveByName", "partial_update", "modifyUserAccess"]:  # Routes that require authentication
            permission_classes = [permissions.IsAuthenticated]
        else:                                    # PUT, PATCH, DELETE
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]
    

    # to create a new model inside the database
    @action(methods=["post"], detail=False)
    def createFromUser(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
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
    @action(methods=["get", "post"], detail=False)
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
                user = get_object_or_404(User, email=email) # user search
            except Http404:
                # catch the error in case of the user not being found
                return JsonResponse({"error": "No user with the same credentials was found"}, status=status.HTTP_404_NOT_FOUND)
            # compare the passwords inserted into the database and the ones queried by the user
            if check_password(password=password, encoded=user.password):
                refresh = RefreshToken.for_user(user) # generate tokens for the user
                # serialize the user
                
                
                # send the tokens to the user
                return JsonResponse({
                    "access": str(refresh.access_token), # JWT Access token
                    "refresh" : str(refresh), # JWT Refresh Token
                    "is_new" : user.is_new # send the boolean value of is new to skip the login process
                }, status=status.HTTP_200_OK)
            return JsonResponse({"error": "No user with the same credentials was found"}, status=status.HTTP_401_UNAUTHORIZED)
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
        
    @action(methods=["post"], detail=False)
    def modifyUserAccess(self, request):
        serializer = UserSerializer(data=request.data, partial=True) # serialize the HTTP request body
        if serializer.is_valid():
            try:
                user = get_object_or_404(User, pk=serializer.validated_data["id"]) # search the user
            except Http404:
                return JsonResponse({"message": "User not found"}, status=status.HTTP_404_NOT_FOUND) 
            user.restricted = serializer.validated_data["restricted"]
            user.restricted_at = serializer.validated_data["restricted_at"]
            user.restricted_reason = serializer.validated_data["restricted_reason"]
            user.save()
            # filtering process | filter by name field
            return JsonResponse({"message": "User was updated successfuly"})   # list function transforms data into a list. (Inserts the data inside an array)
        else:
            return JsonResponse({"error" : "Bad Request"}, status=status.HTTP_400_BAD_REQUEST)
        
    @action(methods=["post"], detail=False)
    def test(self, request):
        return JsonResponse({"Authenticated" : True})
    
    @action(methods=["get"], detail=False)
    def test2(self,request):
        return JsonResponse({"Auth2":True})

        
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

    # update user
    def updateUser(self, request, id=None):
        try:
            user = get_object_or_404(User, pk=id)
        except Http404:
            return JsonResponse({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
        



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

    