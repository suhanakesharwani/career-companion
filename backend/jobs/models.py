from django.db import models
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError


# -----------------------------
# Job Description Model
# -----------------------------
class JobDescription(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, db_index=True)

    jd_text = models.TextField()
    cleaned_text = models.TextField(blank=True)

    skills = models.JSONField(blank=True, default=list)

    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    # ---------- VALIDATIONS ----------
    def clean(self):

        # JD length validation
        if self.jd_text and len(self.jd_text) > 10000:
            raise ValidationError({
                "jd_text": "Job description too large (max 10,000 characters)."
            })

        # cleaned text limit
        if self.cleaned_text and len(self.cleaned_text) > 15000:
            raise ValidationError({
                "cleaned_text": "Cleaned text too large."
            })

        # Skills must be list
        if not isinstance(self.skills, list):
            raise ValidationError({
                "skills": "Skills must be a list."
            })

        # Limit skills count
        if len(self.skills) > 50:
            raise ValidationError({
                "skills": "Maximum 50 skills allowed."
            })

        # Validate skill items
        for skill in self.skills:
            if not isinstance(skill, str):
                raise ValidationError({
                    "skills": "Each skill must be a string."
                })

    # ensures validation runs automatically
    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"JD - {self.user.username}"


# -----------------------------
# Job Application Model
# -----------------------------
class JobApplication(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, db_index=True)

    company = models.CharField(max_length=200)
    role = models.CharField(max_length=100)
    job_link = models.URLField(blank=True)

    class Status(models.TextChoices):
        NOT_APPLIED = "not applied", "Not Applied"
        APPLIED = "applied", "Applied"
        INTERVIEW = "interview", "Interview"
        OFFER = "offer", "Offer"
        REJECTED = "rejected", "Rejected"

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.NOT_APPLIED,
    )

    date_applied = models.DateField(blank=True, null=True)
    deadline = models.DateField(blank=True, null=True)

    notes = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    # ---------- VALIDATIONS ----------
    def clean(self):

        # Company validation
        if self.company and len(self.company.strip()) < 2:
            raise ValidationError({
                "company": "Company name too short."
            })

        # Role validation
        if self.role and len(self.role.strip()) < 2:
            raise ValidationError({
                "role": "Role name too short."
            })

        # Notes size limit
        if self.notes and len(self.notes) > 5000:
            raise ValidationError({
                "notes": "Notes too large (max 5000 characters)."
            })

        # Date logic validation
        if self.deadline and self.date_applied:
            if self.deadline < self.date_applied:
                raise ValidationError({
                    "deadline": "Deadline cannot be before application date."
                })

    # automatic validation
    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    class Meta:
        unique_together = ["user", "company", "role"]
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.company} - {self.role}"