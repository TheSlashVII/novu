from django.contrib.auth.models import *
from rest_framework import serializers

# these Serializer Classes are used to simplify the process of serializing models
# we would have to serialize manually each field.
# by doing it this way we can avoid that. We also get the default implementations of the create and update methods
"""
class UserSeralizer(serializers.ModelSerializer):
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

class UserSeralizer(serializers.ModelSerializer):
    class Meta:
        model=User
        fields='__all__'

class UserCardSerializer(serializers.ModelSerializer):
    class Meta:
        model=UserCard
        fields='__all__'

class CardTabSerializer(serializers.ModelSerializer):
    class Meta:
        model=CardTab
        fields='__all__'

class StudySerializer(serializers.ModelSerializer):
    class Meta:
        model=Study
        fields='__all__'

class BlockSerializer(serializers.ModelSerializer):
    class Meta:
        model=Block
        fields='__all__'

class MatchSerializer(serializers.ModelSerializer):
    class Meta:
        model=Match
        fields='__all__'

class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model=Message
        fields='__all__'

class SwipeSerializer(serializers.ModelSerializer):
    class Meta:
        model=Swipe
        fields='__all__'

class InterestSerializer(serializers.ModelSerializer):
    class Meta:
        model=Interest
        fields='__all__'

class GoalSerializer(serializers.ModelSerializer):
    class Meta:
        model=Goal
        fields='__all__'

class RelationshipPreferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model=RelationshipPreference
        fields='__all__'

class UserRelationPreferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model=UserRelationPreference
        fields='__all__'

class PhotoSerializer(serializers.ModelSerializer):
    class Meta:
        model=Photo
        fields='__all__'

class RequestSerializer(serializers.ModelSerializer):
    class Meta:
        model=Request
        fields='__all__'








