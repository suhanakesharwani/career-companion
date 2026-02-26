from django.urls import path
from .views import UploadAndMatchAPIView

urlpatterns=[
    path("",UploadAndMatchAPIView.as_view()),
]
