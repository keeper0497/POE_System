# api/consumers.py

import json
from channels.generic.websocket import AsyncWebsocketConsumer
from django.contrib.auth.models import User
from .models import EmployeeLocation, Geofence
from django.contrib.gis.geos import Point

class LocationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.employee_id = self.scope['url_route']['kwargs']['employee_id']
        self.room_group_name = f'location_{self.employee_id}'

        # Join the room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        # Leave the room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        data = json.loads(text_data)
        latitude = data.get('latitude')
        longitude = data.get('longitude')

        if latitude is not None and longitude is not None:
            user_location = Point(float(longitude), float(latitude), srid=4326)
            geofences = Geofence.objects.all()
            outside_geofence = True
            
            for geofence in geofences:
                if geofence.area.contains(user_location):
                    outside_geofence = False
                    break

            if outside_geofence:
                # Notify the user and admin
                self.notify_user()
                self.notify_admin()

            # Broadcast the location data
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'location_update',
                    'latitude': latitude,
                    'longitude': longitude,
                    'outside_geofence': outside_geofence
                }
            )

    async def location_update(self, event):
        latitude = event['latitude']
        longitude = event['longitude']
        outside_geofence = event['outside_geofence']

        # Send the location data to WebSocket
        await self.send(text_data=json.dumps({
            'latitude': latitude,
            'longitude': longitude,
            'outside_geofence': outside_geofence
        }))

    def notify_user(self):
        # Implement your notification logic here
        pass

    def notify_admin(self):
        # Implement your notification logic here
        pass
