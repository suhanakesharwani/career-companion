from rest_framework.authentication import SessionAuthentication
    
from rest_framework_simplejwt.authentication import JWTAuthentication


class CsrfExemptSessionAuthentication(SessionAuthentication):
    def enforce_csrf(self, request):
        return


# accounts/authentication.py
# accounts/authentication.py
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError

class CookieJWTAuthentication(JWTAuthentication):
    def authenticate(self, request):
        header = self.get_header(request)
        
        # 1. Check if token is in the header first (standard way)
        if header is not None:
            return super().authenticate(request)


        # 2. If no header, check the cookie
        raw_token = request.COOKIES.get("access_token")
        if raw_token is None:
            return None

        try:
            # Validate the token string from the cookie
            validated_token = self.get_validated_token(raw_token)
            # Return the (user, token) tuple required by DRF
            return self.get_user(validated_token), validated_token
        except (InvalidToken, TokenError):
            return None