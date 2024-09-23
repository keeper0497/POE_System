from rest_framework import generics
from rest_framework.response import Response
from rest_framework import status
from .models import Project, Geofence, EmployeeLocation, Task
from django.contrib.auth.models import User
from .serializers import ProjectSerializer, GeofenceSerializer, TaskSerializer
from django.contrib.gis.db.models.functions import Transform
from django.contrib.gis.geos import Point, GEOSGeometry
from rest_framework.permissions import IsAdminUser
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied

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
            employee = User.objects.get(id=employee_id)
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
        # Get the current user
        user = self.request.user
        
        if user.is_superuser:
            # If the user is a superuser, return all tasks
            return Task.objects.all()
        else:
            # If the user is not a superuser, return tasks for projects where the user is the assigned employee
            return Task.objects.filter(project__assign_employee=user)

    def perform_create(self, serializer):
        project = serializer.validated_data.get('project')  # Get the project from the request data
        # Check if the current user is the one assigned to the project
        if project.assign_employee != self.request.user and not self.request.user.is_superuser:
            raise PermissionDenied("You are not allowed to add tasks to this project.")
        serializer.save()

class TaskRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer

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