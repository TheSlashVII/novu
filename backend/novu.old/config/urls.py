from django.urls import path, include
from django.contrib import admin
#from django.urls import path
# In case each app has it's own urls
urlpatterns = [
   path('user', include('users.urls')),
   path('admin/', admin.site.urls)
#    path('products/', include('products.urls')),
]