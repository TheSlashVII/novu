from django.shortcuts import get_object_or_404
from ..serializers import RequestSerializer
from rest_framework import viewsets, status
from rest_framework.response import Response
from django.http import JsonResponse, Http404
from ..models import Request

# Register request controller
class RequestViewset(viewsets.ModelViewSet):
    queryset = Request.objects.all()
    serializer_class = RequestSerializer
    lookup_field = "id_request"
    lookup_url_kwarg = "id"
    
    # to list every request
    def list(self,request):
        queryset = Request.objects.all()
        serializer = RequestSerializer(queryset, many=True)
        return JsonResponse(serializer.data,status=status.HTTP_200_OK, safe=False) # false parameter permits us to convert other items to json. Not exclusively Dictionaries (Json)
    
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
    def partial_update(self,request,pk=None):
        register_request = get_object_or_404(Request,pk=pk)
        serializer = RequestSerializer(register_request, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    # to delete a specific request
    def destroy(self,request,id=None):
        try:
            register_request = get_object_or_404(Request, pk=id)
        except Http404:
            return JsonResponse({"Error": "Error while processing the endpoint"}, status=status.HTTP_400_BAD_REQUEST)
        register_request.delete()
        return JsonResponse(
            {"message": f"Request {id} deleted successfully."},
            status = status.HTTP_204_NO_CONTENT
        )
