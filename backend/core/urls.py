from django.urls import path
from .views import home,landing

urlpatterns=[
     path('', landing, name="landing"),     # Landing page first
    path('home/', home, name="home"),
]