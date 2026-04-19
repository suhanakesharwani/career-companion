import os
import django
from django.core.asgi import get_asgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "server.settings")
django.setup() # Initialize Django properly for ASGI

from channels.routing import ProtocolTypeRouter, URLRouter
from channels.security.websocket import AllowedHostsOriginValidator
from ai_interview.middleware import JWTAuthMiddleware 
import ai_interview.routing

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AllowedHostsOriginValidator( # Fixes potential 403 Forbidden on Render
        JWTAuthMiddleware(
            URLRouter(
                ai_interview.routing.websocket_urlpatterns
            )
        )
    ),
})