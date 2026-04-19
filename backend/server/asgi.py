from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
from django.core.asgi import get_asgi_application

import os
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "server.settings")

django_asgi_app = get_asgi_application()

import ai_interview.routing

application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": AuthMiddlewareStack(
        URLRouter(
            ai_interview.routing.websocket_urlpatterns
        )
    ),
})