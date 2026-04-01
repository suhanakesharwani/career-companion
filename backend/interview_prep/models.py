from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator
from django.utils import timezone


# ========================
# ROLE
# ========================
class Role(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name


# ========================
# TOPIC
# ========================
class Topic(models.Model):
    role = models.ForeignKey(
        Role,
        on_delete=models.CASCADE,
        related_name="topics"
    )
    name = models.CharField(max_length=200)
    category = models.CharField(max_length=100)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["role", "name"],
                name="unique_topic_per_role"
            )
        ]

    def __str__(self):
        return self.name


# ========================
# TODO
# ========================
class Todo(models.Model):
    topic = models.ForeignKey(
        Topic,
        on_delete=models.CASCADE,
        related_name="todos"
    )

    title = models.CharField(max_length=255)

    order_index = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0)]
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["topic", "title"],
                name="unique_todo_per_topic"
            )
        ]

    def __str__(self):
        return self.title


# ========================
# USER TODO PROGRESS
# ========================
class UserTodoProgress(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        db_index=True,
        related_name="todo_progress"
    )

    todo = models.ForeignKey(
        Todo,
        on_delete=models.CASCADE,
        related_name="user_progress"
    )

    completed = models.BooleanField(default=False)

    completed_at = models.DateTimeField(
        null=True,
        blank=True
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["user", "todo"],
                name="unique_user_todo_progress"
            )
        ]

    def save(self, *args, **kwargs):
        # Auto timestamp protection
        if self.completed and not self.completed_at:
            self.completed_at = timezone.now()

        if not self.completed:
            self.completed_at = None

        super().save(*args, **kwargs)


# ========================
# STUDY CALENDAR
# ========================
class StudyCalendar(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        db_index=True,
        related_name="study_calendar"
    )

    date = models.DateField()

    tasks_completed = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0)]
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["user", "date"],
                name="unique_user_date_entry"
            )
        ]

    def __str__(self):
        return f"{self.user.username} - {self.date}"