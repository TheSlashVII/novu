from django.db import models
from . import utilities
from django.contrib.auth.models import AbstractBaseUser
from . import userManagers
# Create your models here.
# this file is used to create the models for the database
# by default the id field is created so no need to declare it 

class User(AbstractBaseUser):
    # basic fields
    id = models.AutoField(primary_key=True)
    name=models.CharField(max_length=200)
    surnames=models.CharField(max_length=200)
    email=models.CharField(max_length=200, unique=True)
    password=models.CharField(max_length=500)
    # preferences fields
    school_name=models.CharField(max_length=150, default='')
    gender=models.CharField(max_length=10, default='') # on django '' is equal to NULL
    height=models.CharField(max_length=5,default='')
    date_of_birth=models.DateField()
    min_age=models.IntegerField(default=0)
    max_age=models.IntegerField()
    profile_pic=models.TextField()
    max_distance_km=models.IntegerField()
    likes=models.IntegerField(default=0)
    # check to see if the user is new or not
    is_new=models.BooleanField(default=True)
    # acces management fields
    restricted=models.BooleanField(default=False)
    restricted_reason=models.CharField(max_length=100, default='')
    restricted_at=models.DateField(null=True)
    admin=models.BooleanField(default=0)
    is_active = models.BooleanField(default=True, db_default=True) # must be true for the sessions to work 
    last_login = models.DateTimeField(blank=True, null=True)
    # Constraints and other conditions
    max_age.null = True
    profile_pic.null = True
    max_distance_km.null = True
    REQUIRED_FIELDS = []
    USERNAME_FIELD = 'email' # field used to distinguish between users
    objects = userManagers.UserManager() # used to manage the user sess


    # VERY IMPORTANT! This subclass is used to rename the table. 
    # By default this model would be named users_user. By doing this we avoid that
    class Meta:
        db_table='User'
    
    def __str__(self):
        return self.email

# user_card table
# this is to represent the user presentation card
class UserCard(models.Model):
    user=models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True) # primary_key parameter sets the primary key for the table instead of the default ID
    amount_tabs=models.IntegerField(default=1) # the user will have at least one or more tabs on his card
    
    class Meta:
        db_table='User_card'


# card_tab table
# it represents each tab for an user card
class CardTab(models.Model):
    id_section=models.IntegerField(null=False, default=1) # this is to identify the section number of the tab, for example 1, 2, 3, etc. It is not the primary key because it can be repeated for different users
    id_card=models.ForeignKey(UserCard, on_delete=models.CASCADE, db_column="id_card" , null=False, default=1) # db_column is for changing the name of the column at the database.
    body=models.CharField(max_length=200)
    header=models.CharField(max_length=50)
    sub_header=models.CharField(max_length=50)
    tab_biography=models.CharField(max_length=100)
    background_photo=models.TextField()
    pk=models.CompositePrimaryKey("id_section", "id_card") # Fix to define multiple columns as primary keys
    class Meta:
        db_table='Card_tab'

# study table
# represents the studies of the user
class Study(models.Model):
    user=models.ForeignKey(User, models.CASCADE)
    name=models.CharField(max_length=100) # name of the study
    currently_studying=models.BooleanField(default=False)
    pk=models.CompositePrimaryKey("user_id", "name") # Fix to define multiple columns as primary keys
    class Meta:
        db_table='Study'

# Block table
# it is for blocking unwanted users from interacting with others
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
# Match table
# this is the table that will track whenever two users have liked eachother
class Match(models.Model):
    # columns
    user1_id=models.ForeignKey(User, related_name="user1_id", db_column="user1_id", on_delete=models.CASCADE)
    user2_id=models.ForeignKey(User, related_name="user2_id", db_column="user2_id", on_delete=models.CASCADE)
    active=models.BooleanField()
    # table name
    class Meta:
        db_table='Match'

# Message table
# this table is for having a record on messages being sent 
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
    pk=models.CompositePrimaryKey("user_id", "name") # to make primary keys with multiple fields
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
    url=models.ImageField(upload_to=utilities.fileRename, max_length=200)
    visible=models.BooleanField()

    class Meta:
        db_table='Photo'


class Request(models.Model):
    id_request=models.BigAutoField(primary_key=True)
    name=models.CharField(max_length=100)
    surnames=models.CharField(max_length=150)
    email=models.CharField(max_length=100, unique=True)
    password=models.TextField()
    date_of_birth=models.DateField()
    photo_student_id=models.ImageField(upload_to=utilities.fileRenameRegister, max_length=200) # the url to the photo uploaded to the server
    photo_id_selfie=models.ImageField(upload_to=utilities.fileRenameRegister, max_length=200) # the url to the photo with the student holding his id 
    id_student=models.BigIntegerField()
    id_student.null = True
    submitted_at=models.DateTimeField(auto_now_add=True)
    class Meta:
        db_table='Request'




