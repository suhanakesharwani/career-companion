from django.db import models
from django.contrib.auth.models import User
from django.core.validators import FileExtensionValidator
from django.core.exceptions import ValidationError
import uuid
import os


# ========================
# Secure File Path
# ========================
def get_file_path(instance, filename):
    ext = filename.split('.')[-1].lower()
    filename = f"{uuid.uuid4()}.{ext}"
    return os.path.join("resumes", filename)


# ========================
# File Size Validator
# ========================
def validate_file_size(file):
    max_size = 5 * 1024 * 1024  # 5MB

    if file.size > max_size:
        raise ValidationError("File too large (max 5MB)")


# ========================
# Resume Model
# ========================
class Resume(models.Model):

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="resumes",
        db_index=True
    )

    file = models.FileField(
        upload_to=get_file_path,
        validators=[
            FileExtensionValidator(
                allowed_extensions=["pdf", "docx"]
            ),
            validate_file_size
        ]
    )

    parsed_text = models.TextField(blank=True, null=True)
    cleaned_text = models.TextField(blank=True, null=True)

    skills = models.JSONField(
        blank=True,
        default=list
    )

    uploaded_at = models.DateTimeField(
        auto_now_add=True,
        db_index=True
    )

    # ========================
    # MODEL VALIDATION
    # ========================
    def clean(self):
        if self.skills and not isinstance(self.skills, list):
            raise ValidationError("Skills must be a list")

    # ========================
    # AUTO DELETE FILE
    # ========================
    def delete(self, *args, **kwargs):
        if self.file:
            storage = self.file.storage
            path = self.file.path
            super().delete(*args, **kwargs)

            if storage.exists(path):
                storage.delete(path)
        else:
            super().delete(*args, **kwargs)

    def __str__(self):
        return f"{self.user.username} Resume"