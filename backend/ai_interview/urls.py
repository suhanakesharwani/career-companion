from django.urls import path
from .views import GenerateQuestionAPIView, EvaluateAnswerAPIView

urlpatterns = [
    path("question/", GenerateQuestionAPIView.as_view()),
    path("evaluate/", EvaluateAnswerAPIView.as_view()),
]