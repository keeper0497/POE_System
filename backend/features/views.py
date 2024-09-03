from rest_framework import generics
from rest_framework.response import Response
from rest_framework import status
from .models import Project, Geofence
from .serializers import ProjectSerializer, GeofenceSerializer

class ProjectListCreateAPIView(generics.ListCreateAPIView):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer

    def perform_create(self, serializer):
        project = serializer.save()
        if project.location:
            geofence_radius = 10000  # in meters
            Geofence.objects.create(
                project=project,
                area=project.location.buffer(geofence_radius)
            )

class ProjectRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer

class GeofenceListCreateAPIView(generics.ListCreateAPIView):
    queryset = Geofence.objects.all()
    serializer_class = GeofenceSerializer

class GeofenceRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Geofence.objects.all()
    serializer_class = GeofenceSerializer
