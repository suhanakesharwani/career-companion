
# Create your views here.

from django.shortcuts import render
from django.contrib.auth.decorators import login_required

def landing(request):
    return render(request, "core/landing.html")

def home(request):
    return render(request, "core/home.html")
