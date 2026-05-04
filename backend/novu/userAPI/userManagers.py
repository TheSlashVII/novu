from django.contrib.auth.models import BaseUserManager
# this class is used to manage the users inside the app. It allows django to know who is who
class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('Email is required')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def get_by_natural_key(self, email):
        return self.get(email=email)