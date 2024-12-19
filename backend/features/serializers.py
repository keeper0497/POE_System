from rest_framework import serializers
from .models import Project, Geofence, Task
from django.contrib.gis.geos import Point

class ProjectSerializer(serializers.ModelSerializer):
    location = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = ['id', 'project_name', 'location', 'project_start', 'project_end', 'assign_employee', 'status', 'time_in', 'time_out', 'address']

    def get_location(self, obj):
        if isinstance(obj.location, Point):
            return {
                "latitude": obj.location.y,
                "longitude": obj.location.x
            }
        return None
    
    def update(self, instance, validated_data):
        # Update the location
        location_data = self.context['request'].data.get('location', None)  # Get location from request data
        if location_data and 'latitude' in location_data and 'longitude' in location_data:
            instance.location = Point(float(location_data['longitude']), float(location_data['latitude']))  # Create a new Point object
        
        # Update other fields
        instance.project_name = validated_data.get('project_name', instance.project_name)
        instance.project_start = validated_data.get('project_start', instance.project_start)
        instance.project_end = validated_data.get('project_end', instance.project_end)
        instance.assign_employee = validated_data.get('assign_employee', instance.assign_employee)
        instance.status = validated_data.get('status', instance.status)
        instance.address = validated_data.get('address', instance.address)

        instance.save()
        return instance
        
class GeofenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Geofence
        fields = ['id', 'project', 'area']

class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = '__all__'
