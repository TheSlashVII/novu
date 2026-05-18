from django.contrib.auth.models import *
from rest_framework import serializers
from .models import *
from django.contrib.auth.hashers import make_password # make_password is to encrypt passwords

# these Serializer Classes are used to simplify the process of serializing models
# we would have to serialize manually each field.
# by doing it this way we can avoid that. We also get the default implementations of the create and update methods (using ModelSerializer)
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model=User
        fields='__all__'


class CardTabSerializer(serializers.ModelSerializer):
    class Meta:
        model=CardTab
        fields='__all__'


class UserCardSerializer(serializers.ModelSerializer):
    class Meta:
        model=UserCard
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
        model=Relationship_preference
        fields='__all__'

class UserRelationPreferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model=User_relation_preference
        fields='__all__'

class PhotoSerializer(serializers.ModelSerializer):
    class Meta:
        model=Photo
        fields='__all__'

class RequestSerializer(serializers.ModelSerializer):
    class Meta:
        model=Request
        fields='__all__'
    def create(self, validated_data):
        validated_data['password'] = make_password(str(validated_data['password']))
        return super().create(validated_data)
    
    def update(self, instance, validated_data):
        if 'password' in validated_data:
            validated_data['password'] = make_password(str(validated_data['password']))
        return super().update(instance, validated_data)
    
class LoginSerializer(serializers.Serializer):
    email=serializers.EmailField()
    password=serializers.CharField()
# for the search bar functionality in the restrict users section
class UserSearchSerializer(serializers.Serializer):
    name=serializers.CharField()

# serializer to show user cards easier when fetching for them
class UserProfileSerializer(serializers.ModelSerializer):
    amount_tabs = serializers.IntegerField(source='usercard.amount_tabs')
    tabs = CardTabSerializer(source='usercard.cardtab_set', many=True)
    interests = InterestSerializer(many=True, read_only=True, source='interest_set')

    class Meta:
        model = User
        # these are the fields for the SQL join query
        fields = [
            'id', 'name', 'surnames', 'email',
            'gender', 'age','height', 'date_of_birth',
            'profile_pic', 'likes', 'school_name',
            'amount_tabs', 'tabs','interests'   
        ]






