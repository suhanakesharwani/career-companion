from channels.auth import AuthMiddlewareStack
from ai_interview.middleware import JWTAuthMiddleware
from channels.routing import ProtocolTypeRouter, URLRouter
from django.core.asgi import get_asgi_application
import os
import ai_interview.routing
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'server.settings')

application = ProtocolTypeRouter({
    "http": get_asgi_application(),

    "websocket": JWTAuthMiddleware(
        URLRouter(
            ai_interview.routing.websocket_urlpatterns
        )
    ),
})