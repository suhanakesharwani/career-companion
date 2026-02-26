
# Create your views here.

from django.shortcuts import render
from django.contrib.auth.decorators import login_required

from re import L

from django.shortcuts import render
from django.http import JsonResponse

from rest_framework.decorators import api_view,permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated,AllowAny
from rest_framework.views import APIView

# def landing(request):
#     return render(request, "core/landing.html")

class LandingView(APIView):
    permission_classes = [AllowAny]  # anyone can access

    def get(self, request):
        if request.user.is_authenticated:
            username = request.user.username
        else:
            username = "Guest"
        return Response({"message": f"This is the landing page, hi {username}"})
# @login_required
# def home(request):
#     print("Authenticated:", request.user.is_authenticated)
#     print("User:", request.user)
#     return render(request, "core/home.html")

class HomeView(APIView):
    permission_classes = [IsAuthenticated]  # anyone can access

    def get(self, request):
        if request.user.is_authenticated:
            username = request.user.username
        else:
             return Response({"message":"kindly login to access this page"})
        return Response({"message": f"This is the home page, hi {username}"})