from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.models import User
# Create your views here.




from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import RegisterSerializer

class RegisterView(APIView):
    permission_classes = []  # Allow unauthenticated users

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "User created"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# class RegisterView(APIView):
#     def post(self,request):
#         username=request.data.get("username")
#         password=request.data.get("password")

#         if not username or not password:
#             return Response(
#                 {"error":"enter both username and password correctly"},
#                 status=status.HTTP_400_BAD_REQUEST
#             )
        
#         if User.objects.filter(username=username).exists():
#             return Response(
#                 {"error":"user already exists"},
#                 status=status.HTTP_400_BAD_REQUEST
#             )
        
#         user=User.objects.create_user(
#             username=username,
#             password=password
#         )
#         return Response(
#             {"message":"user registered successfully"},
#             status=status.HTTP_200_CREATED
#         )