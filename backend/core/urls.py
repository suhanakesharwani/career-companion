from django.urls import path
from .views import HomeView,LandingView

urlpatterns=[
     path('', LandingView.as_view()),     # Landing page first
    path('home/', HomeView.as_view()),
]