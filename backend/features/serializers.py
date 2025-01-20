from rest_framework import serializers
from .models import Project, Geofence, Task, User
from django.contrib.gis.geos import Point
from datetime import datetime, date

class ProjectSerializer(serializers.ModelSerializer):
    location = serializers.SerializerMethodField()
    # assign_employees = serializers.PrimaryKeyRelatedField(
    #     many=True,
    #     queryset=User.objects.all()
    # )

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

         # Handle time_in and time_out
        if 'time_in' in validated_data:
            time_in = validated_data['time_in']
            if isinstance(time_in, str):  # Assuming time_in is in "HH:MM" format
                time_in = datetime.combine(date.today(), datetime.strptime(time_in, "%H:%M").time())
            instance.time_in = time_in

        if 'time_out' in validated_data:
            time_out = validated_data['time_out']
            if isinstance(time_out, str):  # Assuming time_out is in "HH:MM" format
                time_out = datetime.combine(date.today(), datetime.strptime(time_out, "%H:%M").time())
            instance.time_out = time_out

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
