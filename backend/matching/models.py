from django.db import models

# Create your models here.
from resumes.models import Resume
from jobs.models import JobDescription

class MatchResult(models.Model):
    resume = models.ForeignKey(Resume, on_delete=models.CASCADE)
    job_description = models.ForeignKey(JobDescription, on_delete=models.CASCADE)
    skill_match_percent = models.FloatField()
    missing_keywords = models.JSONField()
    role_score = models.FloatField()