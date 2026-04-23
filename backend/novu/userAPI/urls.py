# from django.contrib import admin
from django.urls import path, include
from .viewsets import UserViewset, RegisterRequestViewset, InterestViewset, StudiesViewset
# the UserViewset is duplicated because the first one is the file name
# and the second one is tha actual class
# controller Lists
UserController=UserViewset.UserViewset
RegisterRequestController=RegisterRequestViewset.RequestViewset
InterestController = InterestViewset.InterestViewset
StudiesController = StudiesViewset.StudyViewset

login=UserController.as_view({"post" : "retrieveByEmail"})
create_user=UserController.as_view({"post" : "create"})
admin_create_user=UserController.as_view({"post" : "createFromAdmin"})
retrieve_user=UserController.as_view({"get" : "retrieve"})
delete_request=RegisterRequestController.as_view({"delete" : "destroy"})
register_request_count=RegisterRequestController.as_view({"get" : "countRequests"})
create_register_request=RegisterRequestController.as_view({"post" : "create"})
list_register_requests=RegisterRequestController.as_view({"get" : "list"})
register_request_detail=RegisterRequestController.as_view({"get" : "retrieve"})
save_interests = InterestController.as_view({"post": "create"})
list_interests = InterestController.as_view({"get": "list"})
retrieve_interest = InterestController.as_view({"get": "retrieve"})
save_study = StudiesController.as_view({"post":"create"})
list_studies = StudiesController.as_view({"get":"list"})
retrieve_study = StudiesController.as_view({"get":"retrieve"})
update_study = StudiesController.as_view({"put":"update"})

urlpatterns = [
    path('list/request/', list_register_requests), # list register requests
    path("create/", create_user), # creates a user 
    path("create/request", create_register_request), # creates a register request
    path("login/", login), # login API
    path("detail/request/<int:id>/", register_request_detail), # retrieves a specific register request
    path("count/request/", register_request_count), # counts the amount of active register requests
    path("delete/request/<int:id>/", delete_request), # deletes a register request
    path("retrieve/<int:id>/", retrieve_user),
    path("admin/create/", admin_create_user), # creates user from admin panel
    path("interests/", list_interests), #Lists the interests
    path("interests/save/", save_interests), # Save the interests
    path("interests/retrieve/<int:pk>/", retrieve_interest),
    path("studies/", list_studies), #Lists the studies of a user
    path("studies/save/", save_study), #Save or update user's study
    path("studies/retrieve/<int:pk>/", retrieve_study), #Retrieve study by user_id
    path("studies/update/", update_study), #Update user's study
]