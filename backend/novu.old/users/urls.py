from django.urls import path
from rest_framework import routers
from . import views
router=routers.SimpleRouter()
router.register("get/", viewset=views.getAllUsers)

urlpatterns = router