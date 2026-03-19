from django.db import models
from django.contrib.auth.models import User
# Create your models here.

class Role(models.Model):
    name=models.CharField(max_length=100)
    description=models.TextField()

    def __str__(self):
        return self.name

class Topic(models.Model):
    role = models.ForeignKey(Role, on_delete=models.CASCADE)
    name = models.CharField(max_length=200)
    category = models.CharField(max_length=100)

    def __str__(self):
        return self.name
    
class Todo(models.Model):
    topic = models.ForeignKey(Topic, on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    order_index = models.IntegerField(default=0)

    def __str__(self):
        return self.title
    

class UserTodoProgress(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    todo = models.ForeignKey(Todo, on_delete=models.CASCADE)
    completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)


class StudyCalendar(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    date = models.DateField()
    tasks_completed = models.IntegerField(default=0)