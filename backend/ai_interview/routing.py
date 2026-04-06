from django.urls import re_path
from ai_interview import consumers

websocket_urlpatterns = [
    re_path(r'ws/interview/$', consumers.InterviewConsumer.as_asgi()),
]