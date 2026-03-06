from rest_framework.authentication import SessionAuthentication
    
from rest_framework_simplejwt.authentication import JWTAuthentication


class CsrfExemptSessionAuthentication(SessionAuthentication):
    def enforce_csrf(self, request):
        return


# class CookieJWTAuthentication(JWTAuthentication):
#     def authenticate(self, request):
#         header = self.get_header(request)
#         if header is None:
#             # Try cookie
#             raw_token = request.COOKIES.get("access_token")
#             if raw_token is None:
#                 return None
#             validated_token = self.get_validated_token(raw_token)
#             return self.get_user(validated_token), validated_token
#         return super().authenticate(request)