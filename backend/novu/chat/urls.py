from django.urls import path
from . import views

urlpatterns = [
    path('messages/<int:user1_id>/<int:user2_id>/', views.get_messages),
    path('conversations/<int:user_id>/', views.get_conversations),
]