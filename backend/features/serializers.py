from rest_framework import serializers
from .models import Project, Geofence, Task
from django.contrib.gis.geos import Point

class ProjectSerializer(serializers.ModelSerializer):
    location = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = ['id', 'project_name', 'location', 'project_start', 'project_end', 'assign_employee', 'status']

    def get_location(self, obj):
        if isinstance(obj.location, Point):
            return {
                "latitude": obj.location.y,
                "longitude": obj.location.x
            }
        return None
        
class GeofenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Geofence
        fields = ['id', 'project', 'area']

class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = '__all__'
