from django.contrib.auth.models import User
from rest_framework import serializers
from .models import UserProfile


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "password"]
        extra_kwargs = {"password": {"write_only": True}}

    def create(self, validated_data):
        print(validated_data)
        user = User.objects.create_user(**validated_data)
        return user


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['first_name', 'last_name', 'middle_name', 'suffix', 'email', 'position', 'division', 'start_date', 'num_sickleave', 
            'num_vacationleave', 'contact_number', 'custom_user_id']
        extra_kwargs = {"author": {"read_only": True}}
