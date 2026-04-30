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
create_user=UserController.as_view({"post" : "createFromUser"})
admin_create_user=UserController.as_view({"post" : "createFromAdmin"})
retrieve_user=UserController.as_view({"get" : "retrieveUserById"})
delete_request=RegisterRequestController.as_view({"delete" : "deleteRequest"})
register_request_count=RegisterRequestController.as_view({"get" : "countRequests"})
create_register_request=RegisterRequestController.as_view({"post" : "create"})
list_register_requests=RegisterRequestController.as_view({"get" : "listRequests"})
register_request_detail=RegisterRequestController.as_view({"get" : "retrieveRequest"})
save_interests = InterestController.as_view({"post": "saveInterest"})
list_interests = InterestController.as_view({"get": "list"})
retrieve_interest = InterestController.as_view({"get": "retrieve"})
save_study = StudiesController.as_view({"post":"saveStudy"})
list_studies = StudiesController.as_view({"get":"list"})
retrieve_study = StudiesController.as_view({"get":"retrieveStudyById"})
update_study = StudiesController.as_view({"put":"update"})
list_users = UserController.as_view({"get": "list"})
test_api = UserController.as_view({"post" : "test"})
admin_search_user = UserController.as_view({"post" : "retrieveByName"}) # functionality to search users by name
admin_modify_access = UserController.as_view({"put" : "modifyUserAccess"})
change_user_is_new = UserController.as_view({"put" : "updateIsNewStatus"}) # function to update the user's is_new status
admin_delete_user = UserController.as_view({"delete": "destroy"})
admin_count_active_users = UserController.as_view({"get" : "activeUsersCount"})
count_most_liked_users = UserController.as_view({"get" : "getMostLikedProfiles"})
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
    path("interests/retrieve/<int:pk>/", retrieve_interest), # gets a list of interests based on the user
    path("list/", list_users), # used to list users
    path("admin/user/search/", admin_search_user),
    path("admin/user/modify/access/", admin_modify_access),
    path("studies/", list_studies), #Lists the studies of a user
    path("studies/save/", save_study), #Save or update user's study
    path("studies/retrieve/<int:pk>/", retrieve_study), #Retrieve study by user_id
    path("studies/update/", update_study), #Update user's study
    path("update/status/<int:id>", change_user_is_new), # update is new status
    path("admin/delete/<int:id>", admin_delete_user), # deletes users
    path("admin/count/", admin_count_active_users), # counts users in the database
    path("count/most_liked", count_most_liked_users)

]