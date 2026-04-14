from django.urls import path, include

#from django.urls import path
# In case each app has it's own urls
urlpatterns = [
   path('users/', include('users.urls')),
#    path('products/', include('products.urls')),
]