from django.db import models
from django.contrib.auth.models import User
# Create your models here.

class JobDescription(models.Model):
    user=models.ForeignKey(User,on_delete=models.CASCADE)
    jd_text=models.TextField()
    cleaned_text = models.TextField(blank=True) 
    skills=models.JSONField(blank=True,default=list)
    created_at=models.DateTimeField(auto_now_add=True)