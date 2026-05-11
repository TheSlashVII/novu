from django.shortcuts import get_object_or_404
from ..serializers import RequestSerializer
from rest_framework import viewsets, status, permissions
from rest_framework.response import Response
from django.http import JsonResponse, Http404
from ..models import Request
from rest_framework.decorators import action
from rest_framework_simplejwt.authentication import JWTAuthentication
import os
from pathlib import Path
from ..face_recognition_utils import verify_face_match
from ..models import User
from django.contrib.auth.hashers import make_password

# Register request controller
class RequestViewset(viewsets.ModelViewSet):
    queryset = Request.objects.all()
    serializer_class = RequestSerializer
    lookup_field = "id_request"
    lookup_url_kwarg = "id"
    authentication_classes = [JWTAuthentication]
    def get_permissions(self):
        if self.action in ['create', 'test1']:   # POST /users/, GET /users/
            permission_classes = [permissions.AllowAny]
        elif self.action in ['retrieve',"listRequests", "countRequests", "deleteRequest", "retrieveRequest"]:        # GET /users/{id}/
            permission_classes = [permissions.IsAuthenticated]
        else:                                    # PUT, PATCH, DELETE
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    # to list every request
    @action(methods=["get"], detail=False)
    def listRequests(self,request):
        queryset = Request.objects.all()
        serializer = RequestSerializer(queryset, many=True)
        return JsonResponse(serializer.data,status=status.HTTP_200_OK, safe=False) # false parameter permits us to convert other items to json. Not exclusively Dictionaries (Json)
    @action(methods=["get"], detail=False)
    def countRequests(self, request):
        numRegisterRequest = self.queryset.count()
        return JsonResponse({"request_count": numRegisterRequest})

    # to create a new request inisde the database
    def create(self,request):
        serializer = RequestSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save() # save newly created object to the database
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # to get a specific request based on primary key
    """
    
    def retrieve(self,request,pk=None):
        queryset = Request.objects.all() # gets all Register Requests from the database
        register_request = get_object_or_404(queryset, pk=pk) # searches for a specific register request
        serializer = RequestSerializer(register_request)
        return Response(serializer.data, status=status.HTTP_200_OK)
    """
    # to get a specific request based on primary key. (But cleaner)
    @action(methods=["get"], detail=False)
    def retrieveRequest(self, request, id=None):
        queryset = Request.objects.all() # gets all Register Requests from the database
        register_request = get_object_or_404(queryset, pk=id) # searches for a specific register request
        serializer = RequestSerializer(register_request)
        return Response(serializer.data, status=status.HTTP_200_OK)

    

    # to fully update a specific request
    def update(self,request):
        data = request.data
        pk = int(data.pk) 
        register_request = get_object_or_404(Request, pk=pk)
        serializer = RequestSerializer(register_request, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # to partially update a specific request (e.g only update status)
    def partial_update(self,request,id=None):
        register_request = get_object_or_404(Request,pk=id)
        serializer = RequestSerializer(register_request, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

    @action(methods=["delete"], detail=False)
    def deleteRequest(self,request,id=None):
        BASE_DIR = Path(__file__).resolve().parent.parent.parent  # points to novu root dir
        try:
            register_request = get_object_or_404(Request, pk=id)
            # delete the files used in the register request
            selfie = str(BASE_DIR / str(register_request.photo_id_selfie))
            idCard = str(BASE_DIR / str(register_request.photo_student_id))
            os.remove(selfie)
            os.remove(idCard)
        except Http404:
            return JsonResponse({"Error": "Error while processing the endpoint"}, status=status.HTTP_404_NOT_FOUND)
        except FileNotFoundError:
            register_request.delete()
            return JsonResponse(
                {"message": f"Request {id} deleted successfully."},
                status = status.HTTP_204_NO_CONTENT
            )
        register_request.delete()
        return JsonResponse(
            {"message": f"Request {id} deleted successfully."},
            status = status.HTTP_204_NO_CONTENT
        )
        
    @action(methods=["post"], detail=False)
    def acceptRequest(self, request, id=None):
        BASE_DIR = Path(__file__).resolve().parent.parent.parent
        
        
        try:
            register_request = get_object_or_404(Request, pk=id)
        except Http404:
            return JsonResponse({"error:" "Solicitud no encontrada"}, status=status.HTTP_404_NOT_FOUND)
    
        #Routes of the photos
        selfie_path = str(BASE_DIR / str(register_request.photo_id_selfie))
        id_card_path = str(BASE_DIR / str(register_request.photo_student_id))
    
        #Facial verification
        face_result = verify_face_match(id_card_path, selfie_path)
    
        if not face_result.get('match'):
            return JsonResponse({
                'error': 'Las caras no coinciden',
                'details': face_result.get('error', f"Confianza: {face_result.get('confidence', 0)}%")
            }, status=status.HTTP_400_BAD_REQUEST)

        #Create the user
        try:
            user = User.objects.create(
                name=register_request.name,
                surnames=register_request.surnames,
                email=register_request.email,
                password=make_password(register_request.password),
                date_of_birth=register_request.date_of_birth,
                is_active=True,
                is_new=True,
            )
        
            #Update the state of application
            register_request.status = Request.ACCEPTED
            register_request.save()
        
            return JsonResponse({
                'message': 'Usuario creado correctamente',
                'user_id': user.id,
                'face_confidence': face_result.get('confidence')
            }, status=status.HTTP_201_CREATED)
        
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)