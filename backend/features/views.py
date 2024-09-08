from rest_framework import generics
from rest_framework.response import Response
from rest_framework import status
from .models import Project, Geofence
from .serializers import ProjectSerializer, GeofenceSerializer
from django.contrib.gis.db.models.functions import Transform
from django.contrib.gis.geos import Point, GEOSGeometry
from rest_framework.permissions import IsAdminUser

class ProjectListCreateAPIView(generics.ListCreateAPIView):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    

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

class GeofenceListCreateAPIView(generics.ListCreateAPIView):
    queryset = Geofence.objects.all()
    serializer_class = GeofenceSerializer

class GeofenceRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Geofence.objects.all()
    serializer_class = GeofenceSerializer
