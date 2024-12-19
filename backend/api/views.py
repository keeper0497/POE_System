from django.shortcuts import render
from django.contrib.auth.models import User
from rest_framework import generics
from .serializers import NotificationSerializer, MessageSerializer, UserSerializer, UserProfileSerializer, UserUpdateSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from .models import Notification, UserProfile, Message
from rest_framework.exceptions import NotFound
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from django.db.models import Q

# UserProfile CRUD Views
class UserProfileCreateView(generics.CreateAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        # Save the UserProfile and assign the current user to the project
        serializer.save(user=self.request.user)

        # Send a WebSocket notification to the project group
        # user = self.request.user
        # project_id = self.request.data.get('project_id')  # Assuming project_id is passed in the request data
        # channel_layer = get_channel_layer()

        # Notify all users in the project group about the assignment
        # async_to_sync(channel_layer.group_send)(
        #     f'project_{project_id}',
        #     {
        #         'type': 'send_notification',
        #         'notification': f"User {user.username} has been assigned to project {project_id}."
        #     }
        # )

class UserProfileDetailView(generics.RetrieveAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return UserProfile.objects.filter(user=self.request.user)

    def get_object(self):
        queryset = self.get_queryset()
        print("queryset", queryset)
        if not queryset.exists():
            raise NotFound("UserProfile not found.")
        return queryset.first()

class UserProfileUpdateView(generics.UpdateAPIView):
    serializer_class = UserUpdateSerializer
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

class DeleteUserView(generics.DestroyAPIView):
    queryset = User.objects.all()
    permission_classes = [IsAdminUser]  # Only admins can delete users

    def delete(self, request, *args, **kwargs):
        try:
            user = self.get_object()
            if user.is_superuser:
                return Response({"error": "Cannot delete an admin user"}, status=status.HTTP_400_BAD_REQUEST)
            self.perform_destroy(user)
            return Response({"message": "User deleted successfully"}, status=status.HTTP_200_OK)
        except NotFound:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
        

class UpdateUserView(generics.UpdateAPIView):
    queryset = User.objects.all()
    serializer_class = UserUpdateSerializer
    permission_classes = [IsAdminUser]  # Only admins can update users

    def patch(self, request, *args, **kwargs):
        user = self.get_object()
        serializer = self.get_serializer(user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)

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
        users = UserProfile.objects.all()
        serialized_users = UserProfileSerializer(users, many=True)  # Serialize the users
        return Response(serialized_users.data)  # Return the serialized data
    
class GetUserDetails(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, user_id):
        user = User.objects.filter(id=user_id).first()  # Use first() to get a single user or None
        if user is not None:
            serializer = UserSerializer(user)
            return Response(serializer.data)
        return Response({"detail": "User not found."}, status=404)
    
class GetUserProfileDetails(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, user_id):
        user = UserProfile.objects.filter(id=user_id).first()  # Use first() to get a single user or None
        if user is not None:
            serializer = UserProfileSerializer(user)
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
        serializer = NotificationSerializer(data=request.data)
        if serializer.is_valid():
            message = serializer.validated_data.get('message')

            # Notify the assigned user (current user)
            assigned_user = request.user
            Notification.objects.create(user=assigned_user, message=message)

            # Notify all admin users
            admin_users = User.objects.filter(is_superuser=True)
            for admin in admin_users:
                Notification.objects.create(user=admin, message=message)

            return Response({"message": "Notification sent to admins and assigned user."}, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

class MessageListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        admin = User.objects.filter(is_superuser=True).first()

        if not admin:
            return Response({"error": "No admin user found"}, status=status.HTTP_404_NOT_FOUND)

        # Check if the user is an admin
        if user.is_superuser:
            # If admin, fetch all messages
            messages = Message.objects.all().order_by("timestamp")
        else:
            # Fetch messages between the user and admin
            messages = Message.objects.filter(
                (Q(sender=user) & Q(receiver=admin)) |
                (Q(sender=admin) & Q(receiver=user))
            ).order_by("timestamp")

        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = MessageSerializer(data=request.data)
        if serializer.is_valid():
            message = serializer.save()

            # Broadcast the message to the WebSocket group
            channel_layer = get_channel_layer()
            group_name = f"user_{message.receiver.id}"
            async_to_sync(channel_layer.group_send)(
                group_name,
                {
                    'type': 'send_notification',
                    'message': {
                        'sender': message.sender.id,
                        'receiver': message.receiver.id,
                        'content': message.content,
                        'timestamp': message.timestamp.isoformat(),
                    }
                }
            )


            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AdminDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        admin = User.objects.filter(is_superuser=True).first()
        if not admin:
            return Response({"error": "No admin user found"}, status=status.HTTP_404_NOT_FOUND)
        return Response({"id": admin.id, "username": admin.username, "name": admin.get_full_name()})
    
