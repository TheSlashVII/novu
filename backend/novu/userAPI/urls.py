# from django.contrib import admin
from django.urls import path, include
from .viewsets import UserViewset
# the UserViewset is duplicated because the first one is the file name
# and the second one is tha actual class
# controller Lists
UserController=UserViewset.UserViewset

list_test=UserController.as_view({ "get" : "test" })




#urlpatterns = router.urls
urlpatterns = [
    path('list/', list_test)
]