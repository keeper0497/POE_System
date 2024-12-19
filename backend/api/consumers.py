# consumers.py

import json
from channels.generic.websocket import AsyncWebsocketConsumer

class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.employee_id = self.scope['url_route']['kwargs']['employee_id']
        self.group_name = f"user_{self.employee_id}"

        # Join user-specific group
        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        # Leave user-specific group
        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name
        )

    # Receive notification from group
    async def send_notification(self, event):
        notification = event['message']
        print(f"Sending WebSocket notification: {notification}")  # Debug log
        await self.send(text_data=json.dumps({
            'notification': notification
        }))

    # Method to broadcast messages to the group
    async def receive(self, text_data):
        data = json.loads(text_data)
        await self.channel_layer.group_send(
            self.group_name,
            {
                'type': 'send_notification',
                'message': data,
            }
        )