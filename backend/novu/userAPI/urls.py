# from django.contrib import admin
from django.urls import path, include
from .viewsets import UserViewset, RegisterRequestViewset
# the UserViewset is duplicated because the first one is the file name
# and the second one is tha actual class
# controller Lists
UserController=UserViewset.UserViewset
RegisterRequestController=RegisterRequestViewset.RequestViewset

login=UserController.as_view({"post" : "retrieveByEmail"})
create_user=UserController.as_view({"post" : "create"})
delete_request=RegisterRequestController.as_view({"delete" : "destroy"})
register_request_count=RegisterRequestController.as_view({"get" : "countRequests"})
create_register_request=RegisterRequestController.as_view({"post" : "create"})
list_register_requests=RegisterRequestController.as_view({"get" : "list"})
register_request_detail=RegisterRequestController.as_view({"get" : "retrieve"})


#urlpatterns = router.urls
urlpatterns = [
    path('list/request/', list_register_requests),
    path("create/", create_user),
    path("create/request", create_register_request),
    path("login/", login),
    path("detail/request/<int:id>/", register_request_detail),
    path("count/request/", register_request_count),
    path("delete/request/<int:id>/", delete_request),
    # JWT authentication urls
    
]