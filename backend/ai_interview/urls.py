from django.urls import path
from . import views

urlpatterns = [
    path('question/', views.get_ai_question),
    path('evaluate/', views.evaluate_ai_answer),
]