from django.shortcuts import render
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Project, Geofence
from django.contrib.gis.geos import Point
# from osgeo import gdal

# Create your views here.
@receiver(post_save, sender=Project)
def create_geofence(sender, instance, **kwargs):   
    # print(gdal.VersionInfo()) 
    if instance.location:
        geofence = instance.geofence or Geofence(project=instance)
        geofence.area = instance.create_geofence()
        geofence.save()


def is_within_geofence(point, project):
    return project.geofence.area.contains(point)