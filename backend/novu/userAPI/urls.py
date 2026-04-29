# from django.contrib import admin
from django.urls import path, include
from .viewsets import UserViewset, RegisterRequestViewset, InterestViewset, StudiesViewset, SwipeViewset, MatchViewset, UserCardViewset, CardTabViewset
# the UserViewset is duplicated because the first one is the file name
# and the second one is tha actual class
# controller Lists
UserController=UserViewset.UserViewset
RegisterRequestController=RegisterRequestViewset.RequestViewset
InterestController = InterestViewset.InterestViewset
StudiesController = StudiesViewset.StudyViewset
SwipeController = SwipeViewset.SwipeViewset
MatchController = MatchViewset.MatchViewset
UserCardController = UserCardViewset.UserCardViewset
CardTabController = CardTabViewset.CardTabViewset


login=UserController.as_view({"post" : "retrieveByEmail"})
create_user=UserController.as_view({"post" : "create"})
admin_create_user=UserController.as_view({"post" : "createFromAdmin"})
retrieve_user=UserController.as_view({"get" : "retrieve"})
delete_request=RegisterRequestController.as_view({"delete" : "destroy"})
register_request_count=RegisterRequestController.as_view({"get" : "countRequests"})
create_register_request=RegisterRequestController.as_view({"post" : "create"})
list_register_requests=RegisterRequestController.as_view({"get" : "list"})
register_request_detail=RegisterRequestController.as_view({"get" : "retrieve"})
save_interests = InterestController.as_view({"post": "saveInterest"})
list_interests = InterestController.as_view({"get": "list"})
retrieve_interest = InterestController.as_view({"get": "retrieve"})
save_study = StudiesController.as_view({"post":"create"})
list_studies = StudiesController.as_view({"get":"list"})
retrieve_study = StudiesController.as_view({"get":"retrieve"})
update_study = StudiesController.as_view({"put":"update"})
list_users = UserController.as_view({"get": "list"})
register_swipe = SwipeController.as_view({'post': 'register_swipe'})
check_match = SwipeController.as_view({'get': 'check_match'})
get_user_swipes = SwipeController.as_view({'get': 'get_user_swipes'})
get_user_matches = MatchController.as_view({'get': 'get_user_matches'})
list_user_card = UserCardController.as_view({"get": "list"})
create_user_card = UserCardController.as_view({"post": "createUserCard"})
retrieve_user_card = UserCardController.as_view({"get": "retrieve"})
list_card_tabs      = CardTabController.as_view({"get": "list"})
create_card_tab     = CardTabController.as_view({"post": "createCardTab"})
retrieve_card_tab   = CardTabController.as_view({"get": "retrieve"})
update_card_tab     = CardTabController.as_view({"put": "update"})
patch_card_tab      = CardTabController.as_view({"patch": "partial_update"})
delete_card_tab     = CardTabController.as_view({"delete": "destroy"})

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
    path("list/", list_users),
    path("studies/", list_studies), #Lists the studies of a user
    path("studies/save/", save_study), #Save or update user's study
    path("studies/retrieve/<int:pk>/", retrieve_study), #Retrieve study by user_id
    path("studies/update/", update_study), #Update user's study
    path("swipes/register/", register_swipe),
    path("swipes/check-match/", check_match),
    path("swipes/user/<int:user_id>/", get_user_swipes),
    path("matches/user/<int:user_id>/", get_user_matches),
    path("cards/", list_user_card),
    path("cards/create/", create_user_card),
    path("cards/retrieve/<int:pk>/", retrieve_user_card),
    path("tabs/", list_card_tabs),
    path("tabs/create/", create_card_tab),
    path("tabs/retrieve/<int:pk>/", retrieve_card_tab),
    path("tabs/update/<int:pk>/<int:id_section>/", update_card_tab),
    path("tabs/patch/<int:pk>/<int:id_section>/", patch_card_tab),
    path("tabs/delete/<int:pk>/<int:id_section>/", delete_card_tab),
]