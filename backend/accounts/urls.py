
from django.urls import path
from .views import RegisterView,login_page
urlpatterns=[
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", login_page, name="login"),
    
]

