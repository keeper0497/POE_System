from django.urls import path
from .views import (
    ProjectListCreateAPIView, ProjectRetrieveUpdateDestroyAPIView,
    GeofenceListCreateAPIView, GeofenceRetrieveUpdateDestroyAPIView
)

urlpatterns = [
    path('api/projects/', ProjectListCreateAPIView.as_view(), name='project-list-create'),
    path('api/projects/<int:pk>/', ProjectRetrieveUpdateDestroyAPIView.as_view(), name='project-detail'),
    path('api/geofences/', GeofenceListCreateAPIView.as_view(), name='geofence-list-create'),
    path('api/geofences/<int:pk>/', GeofenceRetrieveUpdateDestroyAPIView.as_view(), name='geofence-detail'),
]
