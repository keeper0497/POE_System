from django.db import models
from django.contrib.auth.models import User


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    position = models.CharField(max_length=2500, blank=False, null=False)
    division = models.CharField(max_length=2500, blank=False, null=False)
    start_date = models.DateField()
    num_sickleave = models.IntegerField()
    num_vacationleave = models.IntegerField()
    contact_number = models.CharField(max_length=250, unique=True, blank=False, null=True)
    custom_user_id = models.CharField(max_length=250, unique=True, blank=False, null=False)
    first_name = models.CharField(max_length=2500, blank=False, null=False)
    last_name = models.CharField(max_length=2500, blank=False, null=False)
    middle_name = models.CharField(max_length=2500, blank=False, null=False)
    suffix = models.CharField(max_length=500, blank=True, null=True)
    email = models.EmailField(unique=True)

    def __str__(self):
        return f'{self.first_name} {self.last_name}'


class Notification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)  # The user who will receive the notification
    message = models.TextField()  # The notification message
    created_at = models.DateTimeField(auto_now_add=True)  # Timestamp when the notification is created
    read = models.BooleanField(default=False)  # Mark if the notification has been read

    def __str__(self):
        return f'Notification for {self.user.username}'
