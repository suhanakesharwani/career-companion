from django.urls import path
from . import views

urlpatterns = [

    path("roles/", views.get_roles),

    path("roles/<int:role_id>/topics/", views.get_topics),

    path("topics/<int:topic_id>/todos/", views.get_todos),

    path("todos/<int:todo_id>/complete/", views.complete_todo),

    path("calendar/", views.get_calendar),
]