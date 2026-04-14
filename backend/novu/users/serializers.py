from django.contrib.auth.models import *
from rest_framework import serializers

# these Serializer Classes are used to simplify the process of serializing models
# we would have to serialize manually each field.
# by doing it this way we can avoid that. We also get the default implementations of the create and update methods
"""
class UserSeralizer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = User
        fields = [
            "name",
            "surnames",
            "email",
            "password",
            "school_name",
            "gender",
            "biography",
            "height", 
            "date_of_birth",
            "min_age",
            "max_age",
            "profile_pic",
            "max_distance_km", 
            "show_me", 
            "likes", 
            "restricted", 
            "restricted_reason", 
            "restricted_at"
        ]

"""

class UserSeralizer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model=User
        fields='__all__'



