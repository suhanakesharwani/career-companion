from django.db import models
from django.contrib.auth.models import User
from django.core.validators import FileExtensionValidator
# Create your models here.
import uuid
import os


def get_file_path(instance, filename):
    ext = filename.split('.')[-1]
    filename = f"{uuid.uuid4()}.{ext}"
    return os.path.join('resumes/', filename)


class Resume(models.Model):
    user=models.ForeignKey(User,on_delete=models.CASCADE,related_name="resumes")
    file = models.FileField(upload_to=get_file_path)
    parsed_text=models.TextField(blank=True,null=True) #null for db, blank for form
    cleaned_text=models.TextField(blank=True,null=True)
    skills=models.JSONField(blank=True,default=list)
    uploaded_at=models.DateTimeField(auto_now_add=True)



