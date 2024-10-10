from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from .views import (
    ProjectListCreateAPIView, ProjectRetrieveUpdateDestroyAPIView,
    GeofenceListCreateAPIView, GeofenceRetrieveUpdateDestroyAPIView, 
    UpdateLocationView, EmployeeLocationDetailView, TaskRetrieveUpdateDestroyAPIView,
    TaskListCreateAPIView,
)

urlpatterns = [
    path('projects/', ProjectListCreateAPIView.as_view(), name='project-list-create'),
    path('projects/<int:pk>/', ProjectRetrieveUpdateDestroyAPIView.as_view(), name='project-detail-update-delete'),
    path('geofences/', GeofenceListCreateAPIView.as_view(), name='geofence-list-create'),
    path('geofences/<int:pk>/', GeofenceRetrieveUpdateDestroyAPIView.as_view(), name='geofence-v'),
    path('update-location/', UpdateLocationView.as_view(), name='update-location'),
    path('employee-location/<int:employee_id>/', EmployeeLocationDetailView.as_view(), name='employee-location'),
    path('task/<int:pk>/', TaskRetrieveUpdateDestroyAPIView.as_view(), name='task-detail-update-delete'),
    path('projects/<int:project_id>/tasks/', TaskListCreateAPIView.as_view(), name='task-list-create'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
