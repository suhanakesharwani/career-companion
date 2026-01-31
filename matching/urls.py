from django.urls import path
from .views import upload_and_match

urlpatterns=[
    path("", upload_and_match, name="upload_and_match"),
]
