from django.db import models
from . import utilities
# Create your models here.

# this file is used to create the models for the database
# by default the id field is created so no need to declare it 
class User(models.Model):
    # basic fields
    name=models.CharField(max_length=200)
    surnames=models.CharField(max_length=200)
    email=models.CharField(max_length=200)
    password=models.CharField(max_length=500)
    # preferences fields
    school_name=models.CharField(max_length=150)
    gender=models.CharField(max_length=10, default='') # on django '' is equal to NULL
    biography=models.CharField(max_length=150)
    height=models.CharField(max_length=5,default='')
    date_of_birth=models.DateField()
    min_age=models.IntegerField()
    max_age=models.IntegerField()
    profile_pic=models.TextField()
    max_distance_km=models.IntegerField(default='')
    show_me=models.BooleanField(default=True)
    likes=models.IntegerField(default=0)
    # acces management fields
    restricted=models.BooleanField(default=False)
    restricted_reason=models.CharField(max_length=100)
    restricted_at=models.DateField()

    # VERY IMPORTANT! This subclass is used to rename the table. 
    # By default this model would be named users_user. By doing this we avoid that
    class Meta:
        db_table='User'

# user_card table
# this is to represent the user presentation card
class UserCard(models.Model):
    user=models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True) # primary_key parameter sets the primary key for the table instead of the default ID
    amount_tabs=models.IntegerField(default=1) # the user will have at least one or more tabs on his card
    
    class Meta:
        db_table='User_card'



class CardTab(models.Model):
    card=models.ForeignKey(UserCard, on_delete=models.CASCADE)
    body=models.CharField(max_length=200)
    header=models.CharField(max_length=50)
    sub_header=models.CharField(max_length=50)
    tab_biography=models.CharField(max_length=100)
    background_photo=models.TextField()

    class Meta:
        db_table='Card_tab'


class Study(models.Model):
    user=models.ForeignKey(User, models.CASCADE)
    name=models.CharField(max_length=100) # name of the study
    currently_studying=models.BooleanField(default=False)
    pk=models.CompositePrimaryKey("user_id", "name") # Fix to define multiple columns as primary keys
    class Meta:
        db_table='Study'
    
class Block(models.Model):
    # db_column is for changing the name of the column at the database. 
    # mainly is for it not to append _id at the end of the Foreign Keys
    id_logged_user=models.ForeignKey(User, related_name="id_logged_user", on_delete=models.CASCADE, db_column="id_logged_user") 
    id_blocked_user=models.ForeignKey(User, related_name="id_blocked_user", on_delete=models.CASCADE, db_column="id_blocked_user")
    reason=models.CharField(max_length=100)
    # primary key constraint
    pk=models.CompositePrimaryKey("id_logged_user", "id_blocked_user")
    # table name 
    class Meta:
        db_table='Block'

class Match(models.Model):
    # columns
    user1_id=models.ForeignKey(User, related_name="user1_id", db_column="user1_id", on_delete=models.CASCADE)
    user2_id=models.ForeignKey(User, related_name="user2_id", db_column="user2_id", on_delete=models.CASCADE)
    active=models.BooleanField()
    # table name
    class Meta:
        db_table='Match'

class Message(models.Model):
    # Columns
    id_message=models.BigAutoField(primary_key=True)
    match_id=models.ForeignKey(Match, on_delete=models.CASCADE, db_column="match_id")
    sender_id=models.ForeignKey(User, on_delete=models.CASCADE, db_column="sender_id")
    content=models.TextField()
    # read recipients
    sent_at=models.DateTimeField(auto_now_add=True)
    read_at=models.DateTimeField()
    # to reply to messages as Instagram or Whatsapp
    id_previous_message=models.ForeignKey('self', related_name="+",on_delete=models.CASCADE, db_column="id_previous_message")
    id_next_message=models.ForeignKey('self', related_name="+",on_delete=models.CASCADE, db_column="id_next_message")
    # column name
    class Meta:
        db_table="Message"



class Swipe(models.Model):
    # columns
    origin_user_id=models.ForeignKey(User,related_name="origin_user_id", on_delete=models.CASCADE, db_column="origin_user_id")
    target_user_id=models.ForeignKey(User,related_name="target_user_id", on_delete=models.CASCADE, db_column="target_user_id")
    matched=models.BooleanField()
    # primary key constraint 
    pk=models.CompositePrimaryKey("origin_user_id", "target_user_id")
    # table name
    class Meta:
        db_table='Swipe'

class Interest(models.Model):
    user_id=models.ForeignKey(User, db_column="user_id", on_delete=models.CASCADE)
    name=models.CharField(max_length=50)
    pk=models.CompositePrimaryKey("user_id", "name")
    class Meta:
        db_table="Interest"

class Goal(models.Model):
    user_id=models.ForeignKey(User, db_column="user_id", on_delete=models.CASCADE)
    description=models.CharField(max_length=100)
    pk=models.CompositePrimaryKey("user_id", "description")
    class Meta:
        db_table="Goal"

class Relationship_preference(models.Model):
    preference_id=models.BigAutoField(primary_key=True)
    type=models.CharField(max_length=50)
    class Meta:
        db_table='Relationship_preference'

class User_relation_preference(models.Model):
    user_id=models.ForeignKey(User, db_column="user_id", on_delete=models.CASCADE)
    preference_id=models.ForeignKey(Relationship_preference, on_delete=models.CASCADE)
    class Meta:
        db_table='User_relation_preference'

class Photo(models.Model):
    id_photo=models.BigAutoField(primary_key=True)
    user_id=models.ForeignKey(User, db_column="user_id",on_delete=models.CASCADE)
    url=models.TextField()
    visible=models.BooleanField()

    class Meta:
        db_table='Photo'


class Request(models.Model):
    id_request=models.BigAutoField(primary_key=True)
    name=models.CharField(max_length=100)
    surnames=models.CharField(max_length=150)
    email=models.CharField(max_length=100)
    password=models.TextField()
    date_of_birth=models.DateField()
    photo_student_id=models.ImageField(upload_to=utilities.fileRename) # the url to the photo uploaded to the server
    photo_id_selfie=models.ImageField(upload_to=utilities.fileRename) # the url to the photo with the student holding his id 
    id_student=models.BigIntegerField()
    
    # set status states
    # this is for setting a list of available choices when writing to this column. Only these options are valid
    PENDING = 'Pending'
    ACCEPTED = 'Accepted'
    DENIED = 'Denied'
    status_choices = {
        ACCEPTED: 'Accepted',
        DENIED: 'Denied',
        PENDING: 'Pending'
    }
    status=models.CharField(max_length=15, choices=status_choices, default=PENDING)
    submitted_at=models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table='Request'




