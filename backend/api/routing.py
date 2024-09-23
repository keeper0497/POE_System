from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/location/(?P<employee_id>\d+)/$', consumers.LocationConsumer.as_asgi()),
]