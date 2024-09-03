from django.db import models
from django.contrib.gis.db import models as gis_models
from django.contrib.auth.models import User

# Create your models here.

class Project(models.Model):
    project_name = models.CharField(max_length=100)
    location = gis_models.PointField(geography=True, blank=True, null=True)
    project_start = models.DateField()
    project_end = models.DateField()
    assign_employee = models.ForeignKey(User, on_delete=models.CASCADE)


    def __str__(self):
        return self.project_name

    def create_geofence(self):
        # Create a 10km radius geofence around the project location
        if self.location:
            geofence_radius = 10000  # in meters
            return self.location.buffer(geofence_radius)
        return None
    
class Geofence(models.Model):
    project = models.ManyToManyField(Project, related_name='geofence')
    area = gis_models.PolygonField(geography=True, blank=True, null=True)

    def __str__(self):
        return f"Geofence for {self.project.project_name}"