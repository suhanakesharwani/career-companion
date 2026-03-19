from django.contrib import admin

# Register your models here.
from django.contrib import admin
from .models import Role, Topic, Todo, UserTodoProgress, StudyCalendar

# Register Role
@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'description')
    search_fields = ('name',)

# Register Topic
@admin.register(Topic)
class TopicAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'role', 'category')
    list_filter = ('role', 'category')
    search_fields = ('name',)

# Register Todo
@admin.register(Todo)
class TodoAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'topic', 'order_index')
    list_filter = ('topic',)
    search_fields = ('title',)

# Optional: Progress tables
@admin.register(UserTodoProgress)
class UserTodoProgressAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'todo', 'completed', 'completed_at')
    list_filter = ('completed', 'todo', 'user')

@admin.register(StudyCalendar)
class StudyCalendarAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'date', 'tasks_completed')
    list_filter = ('date', 'user')