from django.db import models
from django.contrib.auth.models import User

# Create your models here.

class Resume(models.Model):
    user=models.ForeignKey(User,on_delete=models.CASCADE,related_name="resumes")
    file=models.FileField(upload_to='resumes/')
    parsed_text=models.TextField(blank=True,null=True) #null for db, blank for form
    cleaned_text=models.TextField(blank=True,null=True)
    skills=models.JSONField(blank=True,default=list)
    uploaded_at=models.DateTimeField(auto_now_add=True)



