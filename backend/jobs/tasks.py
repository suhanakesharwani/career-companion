from celery import shared_task
from django.utils import timezone
from datetime import timedelta
from django.core.mail import send_mail

from celery.utils.log import get_task_logger


from .models import JobApplication
from django.conf import settings  # To access EMAIL_HOST_USER
logger = get_task_logger(__name__)

@shared_task
def send_deadline_reminders():
    today = timezone.now().date()
    limit_date = today + timedelta(days=3)
    jobs = JobApplication.objects.filter(
        deadline__lte=limit_date,
        deadline__gte=today
    ).exclude(status="applied")

    logger.info(f"Found {jobs.count()} jobs to send reminders for.")

    for job in jobs:
        logger.info(f"Sending email to {job.user.email} for job {job.role}")
        send_mail(
            subject=f"Reminder: Apply for {job.role}",
            message=f"""
Hi {job.user.username},

You have not applied yet.

Company: {job.company}
Role: {job.role}
Deadline: {job.deadline}

Apply before deadline!
""",
            from_email=settings.EMAIL_HOST_USER,
            recipient_list=[job.user.email],
        )

    return f"{jobs.count()} reminder emails sent"

from .models import JobApplication


@shared_task
def send_deadline_reminders():

    today = timezone.now().date()
    limit_date = today + timedelta(days=3)

    jobs = JobApplication.objects.filter(
        deadline__lte=limit_date,
        deadline__gte=today
    ).exclude(status="applied")

    for job in jobs:

        send_mail(
            subject=f"Reminder: Apply for {job.role}",
            message=f"""
Hi {job.user.username},

You have not applied yet.

Company: {job.company}
Role: {job.role}
Deadline: {job.deadline}

Apply before deadline!
""",
            from_email=None,
            recipient_list=[job.user.email],
        )

    return f"{jobs.count()} reminder emails sent"