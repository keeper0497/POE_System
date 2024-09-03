from rest_framework import serializers
from .models import Project, Geofence

class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = ['id', 'project_name', 'location', 'project_start', 'project_end', 'assign_employee']

class GeofenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Geofence
        fields = ['id', 'project', 'area']
