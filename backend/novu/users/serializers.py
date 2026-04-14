from django.contrib.auth.models import *
from rest_framework import serializers

class UserSeralizer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = User
        fields = ["name", "surnames", "email", "password", "school_name", "gender", "biography", "height", "date_of_birth", "min_age", "max_age", "profile_pic", "max_distance_km", "show_me", "likes", "restricted", "restricted_reason", "restricted_at"]


