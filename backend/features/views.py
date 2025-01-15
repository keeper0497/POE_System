from django.forms import ValidationError
from rest_framework import generics
from rest_framework.response import Response
from rest_framework import status
from api.models import Notification
from .models import Project, Geofence, EmployeeLocation, Task
from django.contrib.auth.models import User
from .serializers import ProjectSerializer, GeofenceSerializer, TaskSerializer
from django.contrib.gis.db.models.functions import Transform
from django.contrib.gis.geos import Point, GEOSGeometry
from rest_framework.permissions import IsAdminUser
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from api.models import Notification  # Make sure Notification model is imported

class ProjectListCreateAPIView(generics.ListCreateAPIView):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    
    def get_permissions(self):
        if self.request.method == 'POST':  # Only superusers can create
            self.permission_classes = [IsAdminUser]
        else:  # Allow authenticated users to view the list
            self.permission_classes = [IsAuthenticated]
        return super().get_permissions()

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            return Project.objects.all()  # Superusers can see all projects
        return Project.objects.filter(assign_employee=user)  # Regular users see only their assigned projects

    def perform_create(self, serializer):
        project = serializer.save()
        assign_employees = self.request.data.get('assign_employees', [])
        project.assign_employees.set(assign_employees)
        # Get the location data from the request
        location_data = self.request.data.get('location')
        if location_data:
            latitude = location_data.get('latitude')
            longitude = location_data.get('longitude')
            # Create a Point object for the location
            point = Point(x=longitude, y=latitude, srid=4326)

            # Transform to a local projection that uses meters (e.g., UTM Zone 51N for the Philippines)
            point.transform(32651)  # Example: UTM Zone 51N
            project = serializer.save(location=point)

            if project.location:
                # Create the geofence
                geofence_area = project.create_geofence()
                if geofence_area:
                    geofence = Geofence.objects.create(area=geofence_area)
                    geofence.project.add(project)
                    geofence.save()

            # Notify the assigned employee about the new project
            assigned_employee = project.assign_employee
            if assigned_employee:
                notification_message = f"You have been assigned to the project: {project.project_name}"

                # Save the notification in the database
                Notification.objects.create(user=assigned_employee, message=notification_message)

                # Send notification via WebSocket
                channel_layer = get_channel_layer()
                async_to_sync(channel_layer.group_send)(
                    f"user_{assigned_employee.id}",
                    {
                        "type": "send_notification",
                        "notification": notification_message,
                    }
                )


class ProjectRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer

    def get_permissions(self):
        if self.request.method in ['PUT', 'DELETE', 'PATCH']:  # Only superusers can update or delete
            self.permission_classes = [IsAdminUser]
        else:  # Ordinary users can view their own project
            self.permission_classes = [IsAuthenticated]
        return super().get_permissions()

    def get_object(self):
        project = super().get_object()
        if not self.request.user.is_superuser and project.assign_employee != self.request.user:
            raise PermissionDenied("You do not have permission to access this project.")
        return project

class GeofenceListCreateAPIView(generics.ListCreateAPIView):
    queryset = Geofence.objects.all()
    serializer_class = GeofenceSerializer

class GeofenceRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Geofence.objects.all()
    serializer_class = GeofenceSerializer


class UpdateLocationView(APIView):
    def post(self, request):
        employee_id = request.data.get('employee_id')
        latitude = request.data.get('latitude')
        longitude = request.data.get('longitude')

        try:
            # Fetch the employee and the assigned ongoing project
            employee = User.objects.get(id=employee_id)
            employee_location = Point(x=longitude, y=latitude, srid=4326)

            project = Project.objects.filter(assign_employee=employee, status="ongoing").first()
            if not project:
                return Response({'status': 'No ongoing project found for this employee'}, status=404)

            geofence = Geofence.objects.filter(project=project).first()
            if not geofence:
                return Response({'status': 'No geofence found for this project'}, status=404)

            # Check if the employee is outside the geofence
            if not geofence.area.contains(employee_location):
                notification_message = f"User {employee.username} has moved outside the geofence for project {project.project_name}."

                # Initialize channel layer for WebSocket notifications
                channel_layer = get_channel_layer()

                # Send notifications asynchronously to assigned employee
                try:
                    async_to_sync(channel_layer.group_send)(
                        f"user_{employee.id}",
                        {"type": "send_notification", "notification": notification_message},
                    )

                    # Notify all admins and save the notifications
                    admins = User.objects.filter(is_superuser=True)
                    notifications = [Notification(user=admin, message=notification_message) for admin in admins]
                    notifications.append(Notification(user=employee, message=notification_message))  # For the assigned user

                    Notification.objects.bulk_create(notifications)

                    # Send WebSocket notifications to all superusers (admins)
                    for admin in admins:
                        async_to_sync(channel_layer.group_send)(
                            f"user_{admin.id}",
                            {"type": "send_notification", "notification": notification_message},
                        )

                except Exception as e:
                    print(f"Error sending WebSocket notification: {e}")

            # Save the employee's location in the database
            EmployeeLocation.objects.create(employee=employee, latitude=latitude, longitude=longitude)

            return Response({'status': 'Location updated'}, status=200)

        except User.DoesNotExist:
            return Response({'status': 'Employee not found'}, status=404)


class EmployeeLocationDetailView(APIView):
    def get(self, request, employee_id):
        try:
            # Get the most recent location for the employee
            employee_location = EmployeeLocation.objects.filter(employee_id=employee_id).latest('timestamp')
            data = {
                'latitude': employee_location.latitude,
                'longitude': employee_location.longitude,
                'timestamp': employee_location.timestamp,
            }
            return Response(data, status=200)
        except EmployeeLocation.DoesNotExist:
            return Response({'status': 'Location not found'}, status=404)
        
class TaskListCreateAPIView(generics.ListCreateAPIView):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]  # Only authenticated users can access

    def get_queryset(self):
        # Get the current user and project_id
        user = self.request.user
        project_id = self.kwargs.get('project_id')  # Get the project ID from the URL

        if user.is_superuser:
            # If the user is a superuser, return all tasks for the project
            return Task.objects.filter(project_id=project_id)
        else:
            # If the user is not a superuser, return tasks for projects where the user is the assigned employee
            return Task.objects.filter(project_id=project_id, project__assign_employee=user)

    def perform_create(self, serializer):
        project = serializer.validated_data.get('project')
        if not project:
            raise ValidationError("A valid project must be provided.")

        # Check if the current user is the assigned employee or a superuser
        if project.assign_employee != self.request.user and not self.request.user.is_superuser:
            raise PermissionDenied("You are not allowed to add tasks to this project.")
        
        serializer.save()

        # # Create a notification for the assigned employee
        # assigned_employee = project.assign_employee
        # notification_message = f"You have been assigned to the project: {project.project_name}."

        # # Save the notification in the database
        # Notification.objects.create(user=assigned_employee, message=notification_message)

        # # Send the notification to the WebSocket
        # channel_layer = get_channel_layer()
        # async_to_sync(channel_layer.group_send)(
        #     f"user_{assigned_employee.id}",
        #     {
        #         "type": "send_notification",
        #         "message": notification_message,
        #     }
        # )


class TaskRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]  # Only authenticated users can access

    def get_permissions(self):
        """
        Allow only the assigned employee to update or delete tasks.
        Any authenticated user can view the task if they are assigned to the project.
        """
        # By default, authenticated users can view (GET method)
        return [IsAuthenticated()]

    def get_object(self):
        task = super().get_object()  # Retrieve the task object

        # Ensure that only the assigned employee can update or delete the task
        if self.request.method in ['PUT', 'DELETE', 'PATCH']:
            if task.project.assign_employee != self.request.user:
                raise PermissionDenied("You do not have permission to modify this task.")

        # For GET (viewing the task), ensure the user is the assigned employee
        if not self.request.user.is_superuser and task.project.assign_employee != self.request.user:
            raise PermissionDenied("You do not have permission to view this task.")

        return task