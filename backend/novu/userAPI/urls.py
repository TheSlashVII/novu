# from django.contrib import admin
from django.urls import path, include
from .viewsets import UserViewset, RegisterRequestViewset
# the UserViewset is duplicated because the first one is the file name
# and the second one is tha actual class
# controller Lists
UserController=UserViewset.UserViewset
RegisterRequestController=RegisterRequestViewset.RequestViewset

list_test=UserController.as_view({ "post" : "test2" })
create_user=UserController.as_view({"post" : "create"})
create_register_request=RegisterRequestController.as_view({"post" : "create"})
list_register_requests=RegisterRequestController.as_view({"get" : "list"})



#urlpatterns = router.urls
urlpatterns = [
    path('test/', list_test),
    path('list/request/', list_register_requests),
    path("create/", create_user),
    path("create/request", create_register_request)
]