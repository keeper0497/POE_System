from django.db import models
from django.contrib.auth.models import User

# Create your models here.

class UserProfile(models.Model):
    first_name = models.CharField(max_length= 2500, blank= False, null= False)
    last_name = models.CharField(max_length= 2500, blank= False, null= False)
    middle_name = models.CharField(max_length= 2500, blank= False, null= False)
    suffix = models.CharField(max_length= 500, blank= True, null= True)
    position = models.CharField(max_length= 2500, blank= False, null= False)
    division = models.CharField(max_length= 2500, blank=False, null= False)
    start_date = models.DateField()
    num_sickleave = models.IntegerField()
    num_vicationleave = models.IntegerField()
    
