from django.shortcuts import get_object_or_404
from ..serializers import RequestSerializer
from rest_framework import viewsets, status
from rest_framework.response import Response
from django.http import JsonResponse
from ..models import Request

# Register request controller
class RequestViewset(viewsets.ViewSet):
    
    # to list every request
    def list(self,request):
        queryset = Request.objects.all()
        serializer = RequestSerializer(queryset, many=True)
        return JsonResponse(serializer.data,status=status.HTTP_200_OK, safe=False) # false parameter permits us to convert other items to json. Not exclusively Dictionaries (Json)

    # to create a new request inisde the database
    def create(self,request):
        serializer = RequestSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save() # save newly created object to the database
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # to get a specific request based on primary key
    def retrieve(self,request,pk=None):
        queryset = Request.objects.all()
        register_request = get_object_or_404(queryset, pk=pk)
        serializer = RequestSerializer(register_request)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    # to fully update a specific request
    def update(self,request,pk=None):
        register_request = get_object_or_404(Request, pk=pk)
        serializer = RequestSerializer(register_request, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # to partially update a specific request (e.g only update status)
    def partial_update(self,request,pk=None):
        register_request = get_object_or_404(Request,pk=pk)
        serializer = RequestSerializer(register_request, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    # to delete a specific request
    def destroy(self,request,pk=None):
        register_request = get_object_or_404(Request, pk=pk)
        register_request.delete()
        return Response(
            {"message": f"Request {pk} deleted successfully."},
            status = status.HTTP_204_NO_CONTENT
        )
