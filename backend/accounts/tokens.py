
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.utils import timezone

class CustomTokenGenerator(PasswordResetTokenGenerator):
    def _make_hash_value(self, user, timestamp):
        return str(user.pk) + str(timestamp)

token_generator = CustomTokenGenerator()