from django.contrib.auth.models import User
from rest_framework import serializers
from .models import UserProfile, Notification, Message

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = "__all__"
        
        extra_kwargs = {
            "user": {"required": False},  # Make user field not required
            "middle_name": {"required": False},
            'suffix': {"required": False}
        }

class UserSerializer(serializers.ModelSerializer):


    class Meta:
        model = User
        fields = ["id", "username", "password"]
        extra_kwargs = {"password": {"write_only": True}}

    def create(self, validated_data):
        print(validated_data)
        user = User.objects.create_user(**validated_data)
        return user

class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'password']  # Exclude password here

    
        def update(self, instance, validated_data):
            # Handle the password separately to use set_password if provided
            password = validated_data.pop('password', None)
            if password:
                instance.set_password(password)

            # Update the username only if it's provided
            username = validated_data.pop('username', None)
            if username:
                instance.username = username

            # Update other fields
            for attr, value in validated_data.items():
                setattr(instance, attr, value)

            instance.save()
            return instance

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'message', 'created_at', 'read']


class MessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.get_full_name', read_only=True)
    receiver_name = serializers.CharField(source='receiver.get_full_name', read_only=True)

    class Meta:
        model = Message
        fields = ['id', 'sender', 'receiver', 'content', 'timestamp', 'sender_name', 'receiver_name']