from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from .models import Role,Topic,Todo,UserTodoProgress,StudyCalendar
from .serializers import RoleSerializer,TopicSerializer,TodoSerializer
from rest_framework.response import Response
from django.db.models import F

from accounts.authentication import CookieJWTAuthentication
from django.utils import timezone
from datetime import date

@api_view(["GET"])
@authentication_classes([CookieJWTAuthentication])
@permission_classes([IsAuthenticated])
def get_roles(request):
   
    roles = Role.objects.all()
    serializer = RoleSerializer(roles, many=True)
    return Response(serializer.data)


@api_view(["GET"])
@authentication_classes([CookieJWTAuthentication])
@permission_classes([IsAuthenticated])
def get_topics(request, role_id):
    topics = Topic.objects.filter(role_id=role_id)
    serializer = TopicSerializer(topics, many=True)
    return Response(serializer.data)


@api_view(["GET"])
@authentication_classes([CookieJWTAuthentication])
@permission_classes([IsAuthenticated])
def get_todos(request, topic_id):
    todos = Todo.objects.filter(topic_id=topic_id).order_by("order_index")
    serializer = TodoSerializer(todos, many=True)
    return Response(serializer.data)


@api_view(["POST"])
@authentication_classes([CookieJWTAuthentication])
@permission_classes([IsAuthenticated])
def complete_todo(request, todo_id):
    user = request.user
    progress, created = UserTodoProgress.objects.get_or_create(
        user=user,
        todo_id=todo_id
    )
    if not progress.completed:
        progress.completed = True
        progress.completed_at = timezone.now()
        progress.save()

        today = date.today()
        calendar_entry, _ = StudyCalendar.objects.get_or_create(
            user=user,
            date=today
        )
        calendar_entry.tasks_completed = F("tasks_completed") + 1
        calendar_entry.save()
        calendar_entry.refresh_from_db()

    return Response({"message": "todo completed"})


@api_view(["GET"])
@authentication_classes([CookieJWTAuthentication])
@permission_classes([IsAuthenticated])
def get_calendar(request):
    user = request.user
    calendar = StudyCalendar.objects.filter(user=user)

    data = [
        {
            "date": c.date.strftime("%Y-%m-%d"),
            "tasks_completed": c.tasks_completed
        }
        for c in calendar
    ]

    return Response(data)