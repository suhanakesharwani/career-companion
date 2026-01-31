from django.db import models
from django.contrib.auth.models import User
# Create your models here.

class JobDescription(models.Model):
    user=models.ForeignKey(User,on_delete=models.CASCADE)
    jd_text=models.TextField()
    cleaned_text = models.TextField(blank=True) 
    skills=models.JSONField(blank=True,default=list)
    created_at=models.DateTimeField(auto_now_add=True)
 

class JobApplication(models.Model):
    user=models.ForeignKey(User,on_delete=models.CASCADE)
    company=models.CharField(max_length=200)
    role=models.CharField(max_length=100)
    job_link=models.URLField(blank=True)

    class Status(models.TextChoices):
        NOT_APPLIED='not applied','Not Applied'
        APPLIED = "applied", "Applied"
        INTERVIEW = "interview", "Interview"
        OFFER = "offer", "Offer"
        REJECTED = "rejected", "Rejected"

    status=models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.NOT_APPLIED
    )

    date_applied=models.DateField(blank=True,null=True)
    deadline=models.DateField(blank=True,null=True)

    notes = models.TextField(blank=True)
    created_at=models.DateTimeField(auto_now_add=True)

