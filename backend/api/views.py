from django.shortcuts import render
from django.contrib.auth.models import User
from rest_framework import generics
from .serializers import NotificationSerializer, UserSerializer, UserProfileSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Notification, UserProfile
from rest_framework.exceptions import NotFound
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

# UserProfile CRUD Views
class UserProfileCreateView(generics.CreateAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        # Save the UserProfile and assign the current user to the project
        serializer.save(user=self.request.user)

        # Send a WebSocket notification to the project group
        user = self.request.user
        project_id = self.request.data.get('project_id')  # Assuming project_id is passed in the request data
        channel_layer = get_channel_layer()

        # Notify all users in the project group about the assignment
        async_to_sync(channel_layer.group_send)(
            f'project_{project_id}',
            {
                'type': 'send_notification',
                'notification': f"User {user.username} has been assigned to project {project_id}."
            }
        )

class UserProfileDetailView(generics.RetrieveAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return UserProfile.objects.filter(user=self.request.user)

    def get_object(self):
        queryset = self.get_queryset()
        if not queryset.exists():
            raise NotFound("UserProfile not found.")
        return queryset.first()

class UserProfileUpdateView(generics.UpdateAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return UserProfile.objects.get(user=self.request.user)


class UserProfileDeleteView(generics.DestroyAPIView):
    queryset = UserProfile.objects.all()
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return UserProfile.objects.filter(user=self.request.user)
    


class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]


class CurrentUserView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({
            'id': user.id,
            'username': user.username,
            'is_superuser': user.is_superuser
        })
    
class GetAllUsers(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        users = User.objects.all()
        serialized_users = UserSerializer(users, many=True)  # Serialize the users
        return Response(serialized_users.data)  # Return the serialized data
    
class GetUserDetails(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, user_id):
        user = User.objects.filter(id=user_id).first()  # Use first() to get a single user or None
        if user is not None:
            serializer = UserSerializer(user)
            return Response(serializer.data)
        return Response({"detail": "User not found."}, status=404)

class UserNotifications(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        notifications = Notification.objects.filter(user=user).order_by('-created_at')  # Fetch the user's notifications
        serializer = NotificationSerializer(notifications, many=True)
        return Response(serializer.data)
    
    def post(self, request):
        user = request.user
        serializer = NotificationSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=user)  # Associate the notification with the user
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
