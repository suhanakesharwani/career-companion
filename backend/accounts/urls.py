
from django.urls import path

from .views import RegisterView, LoginView,RefreshView,LogoutView,UserDetailView,ForgotPasswordView,ResetPasswordView

urlpatterns = [
    path('register/', RegisterView.as_view()),
    path('login/', LoginView.as_view()),
    path('refresh/', RefreshView.as_view()),
    path('logout/', LogoutView.as_view()),
    path('me/', UserDetailView.as_view()),
    path("forgot-password/", ForgotPasswordView.as_view()),
     path("reset-password/<str:uid>/<str:token>/", ResetPasswordView.as_view()),
]

