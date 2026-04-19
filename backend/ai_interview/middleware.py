import jwt
from django.conf import settings
from urllib.parse import parse_qs
from django.contrib.auth.models import AnonymousUser
from django.contrib.auth import get_user_model

User = get_user_model()


class JWTAuthMiddleware:
    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        headers = dict(scope.get("headers", []))

        scope["user"] = AnonymousUser()

        try:
            cookies = {}
            if b"cookie" in headers:
                cookie_header = headers[b"cookie"].decode()
                cookies = dict(item.split("=") for item in cookie_header.split("; "))

            token = cookies.get("access_token")

            if token:
                payload = jwt.decode(
                    token,
                    settings.SECRET_KEY,
                    algorithms=["HS256"]
                )
                user_id = payload.get("user_id")

                user = await sync_to_async(User.objects.get)(id=user_id)
                scope["user"] = user

        except Exception:
            scope["user"] = AnonymousUser()

        return await self.app(scope, receive, send)