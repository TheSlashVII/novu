# backend/novu/userAPI/viewsets/RegisterRequestViewset.py

from django.shortcuts import get_object_or_404
from django.http import JsonResponse, Http404
from django.contrib.auth.hashers import make_password
from rest_framework import viewsets, status, permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework_simplejwt.authentication import JWTAuthentication
import os
from pathlib import Path
from ..emailTemplates.emailUtilities import sendPostRegisterEmail

from ..models import Request, User, UserCard, CardTab
from ..serializers import RequestSerializer
from ..face_recognition_utils import verificar_caras


class RequestViewset(viewsets.ModelViewSet):
    queryset = Request.objects.all()
    serializer_class = RequestSerializer
    lookup_field = "id_request"
    lookup_url_kwarg = "id"
    authentication_classes = [JWTAuthentication]
    parser_classes = [MultiPartParser, FormParser]

    def get_permissions(self):
        if self.action in ['create']:
            permission_classes = [permissions.AllowAny]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]

    @action(methods=["get"], detail=False)
    def listRequests(self, request):
        """Lists all register requests."""
        queryset = Request.objects.all()
        serializer = RequestSerializer(queryset, many=True)
        return JsonResponse(serializer.data, status=status.HTTP_200_OK, safe=False)

    @action(methods=["get"], detail=False)
    def countRequests(self, request):
        """Returns the total count of pending register requests."""
        numRegisterRequest = self.queryset.count()
        return JsonResponse({"request_count": numRegisterRequest})

    # to create a new request inisde the database
    def create(self,request):
        serializer = RequestSerializer(data=request.data)
        if serializer.is_valid():
            sendPostRegisterEmail(serializer.validated_data['email'])
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
        """Retrieves a specific register request by its ID."""
        queryset = Request.objects.all()
        register_request = get_object_or_404(queryset, pk=id)
        serializer = RequestSerializer(register_request)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(methods=["delete"], detail=False)
    def deleteRequest(self, request, id=None):
        """Deletes a register request and its associated photos."""
        try:
            user = get_object_or_404(User, pk=id)
        except Http404:
            return JsonResponse({"error": "user not found"}, status=status.HTTP_404_NOT_FOUND)
        if(not user.admin):
            return JsonResponse({"error": "not authorized to access this endpoint"}, status=status.HTTP_401_UNAUTHORIZED)
        BASE_DIR = Path(__file__).resolve().parent.parent.parent
        try:
            register_request = get_object_or_404(Request, pk=id)
            selfie = str(BASE_DIR / str(register_request.photo_id_selfie))
            idCard = str(BASE_DIR / str(register_request.photo_student_id))
            os.remove(selfie)
            os.remove(idCard)
        except Http404:
            return JsonResponse({"error": "Request not found."}, status=status.HTTP_404_NOT_FOUND)
        except FileNotFoundError:
            register_request.delete()
            return JsonResponse(
                {"message": f"Request {id} deleted successfully."},
                status=status.HTTP_204_NO_CONTENT
            )
        register_request.delete()
        return JsonResponse(
            {"message": f"Request {id} deleted successfully."},
            status=status.HTTP_204_NO_CONTENT
        )

    def create(self, request):
        print("=== CREATE CALLED ===")
        print("FILES:", request.FILES)
        print("DATA:", request.data)
        """
        POST /api/users/create/request/
        Receives registration form data, verifies that the face on the student ID
        matches the face in the selfie, and if they match, saves the request
        as pending for admin review.
        """
        serializer = RequestSerializer(data=request.data)
        print("IS VALID:", serializer.is_valid())
        print("ERRORS:", serializer.errors)

        if not serializer.is_valid():
            print("SERIALIZER ERRORS:", serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        # Retrieve uploaded files
        photo_student_id = request.FILES.get("photo_student_id")
        photo_id_selfie = request.FILES.get("photo_id_selfie")

        if not photo_student_id or not photo_id_selfie:
            return Response(
                {"error": "You must upload both the student ID photo and the selfie."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # --- Face verification ---
        resultado = verificar_caras(photo_student_id, photo_id_selfie)
        print("RESULTADO FACIAL:", resultado)

        if resultado["error"]:
            print("ERROR FACIAL:", resultado["error"])
            return Response(...)

        if not resultado["verified"]:
            print("CARAS NO COINCIDEN, distancia:", resultado["distance"])
            return Response(
                {
                    "error": (
                        "The face on the student ID does not match the selfie."
                        "Make sure your student ID is clearly visible next to your face."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if resultado["error"]:
            return Response(
                {"error": f"Face verification error: {resultado['error']}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not resultado["verified"]:
            return Response(
                {
                    "error": (
                        "The face on the student ID does not match the selfie. "
                        "Make sure your student ID is clearly visible next to your face."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # --- Faces match: save the registration request ---
        # Reset file pointers before saving, since they were already read during verification
        photo_student_id.seek(0)
        photo_id_selfie.seek(0)

        register_request = serializer.save()

        return Response(
            {
                "message": "Registration request submitted successfully. An administrator will review it shortly.",
                "id": register_request.id_request,
            },
            status=status.HTTP_201_CREATED,
        )

    @action(methods=["post"], detail=False)
    def acceptRequest(self, request, id=None):
        """
        POST /api/users/accept/request/<id>/
        Accepts a pending register request and creates the user account.
        """
        request_id = self.kwargs.get('id') or id
        try:
            register_request = get_object_or_404(Request, pk=request_id)
        except Http404:
            return JsonResponse({"error": "Request not found."}, status=status.HTTP_404_NOT_FOUND)

        # --- Create the user from the request data ---
        try:
            user = User.objects.create(
                name=register_request.name,
                surnames=register_request.surnames,
                email=register_request.email,
                password=register_request.password,
                date_of_birth=register_request.date_of_birth,
                is_active=True,
                is_new=True,
            )
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        user_card = UserCard.objects.create(user=user, amount_tabs=1)
        CardTab.objects.create(
            id_card=user_card,
            id_section=1,
            header='',
            sub_header='',
            tab_biography='',
            background_photo='',
        )

        # --- Delete the request after creating the user ---
        register_request.delete()

        return JsonResponse(
            {
                "message": f"User {user.email} created successfully.",
                "user_id": user.id,
            },
            status=status.HTTP_201_CREATED
        )