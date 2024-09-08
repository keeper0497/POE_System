from django.urls import path
from .views import (
    ProjectListCreateAPIView, ProjectRetrieveUpdateDestroyAPIView,
    GeofenceListCreateAPIView, GeofenceRetrieveUpdateDestroyAPIView
)

urlpatterns = [
    path('projects/', ProjectListCreateAPIView.as_view(), name='project-list-create'),
    path('projects/<int:pk>/', ProjectRetrieveUpdateDestroyAPIView.as_view(), name='project-detail'),
    path('geofences/', GeofenceListCreateAPIView.as_view(), name='geofence-list-create'),
    path('geofences/<int:pk>/', GeofenceRetrieveUpdateDestroyAPIView.as_view(), name='geofence-detail'),
]
