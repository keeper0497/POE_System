# api/routing.py

from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/notifications/(?P<employee_id>\d+)/$', consumers.NotificationConsumer.as_asgi()),
]
