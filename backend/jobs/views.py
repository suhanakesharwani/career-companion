from django.shortcuts import render,redirect
from common.utils import clean_text
from django.contrib.auth.decorators import login_required
# Create your views here.
from rest_framework import viewsets
from .models import JobApplication
from .serializer import JobApplicationSerializer
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated,BasePermission

from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import OrderingFilter,SearchFilter
from django.core.cache import cache

from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication


# @login_required(login_url='/accounts/login/')
# def job_list_page(request):
#     # This view doesn't need JWT because it just returns the empty HTML shell
#     return render(request, "jobs/list.html")

class JobListView(APIView):
    permission_classes=[IsAuthenticated]
    def get(self,request):
        jobs = JobApplication.objects.all().order_by('-posted_at')  # get all jobs
        serializer = JobApplicationSerializer(jobs, many=True)
        return Response(serializer.data)

def upload_jd(request):
    if request.method=="POST":
        raw_text=request.te
        
        cleaned=clean_text(raw_text)


        return redirect("dashboard")
    
    return render(request,"resume/upload.html")


class IsOwnerOrAdmin(BasePermission):
    def has_object_permission(self, request, view, obj):
        return request.user.is_staff or obj.user==request.user

class JobApplicationViewSet(viewsets.ModelViewSet): #automatically has get post put patch

    authentication_classes = [JWTAuthentication] 
    permission_classes=[IsAuthenticated]
    serializer_class=JobApplicationSerializer
    paginator = PageNumberPagination()
    paginator.page_size = 5

    filter_backends=[DjangoFilterBackend,SearchFilter,OrderingFilter]
    filterset_fields=["status","company"]

    ordering_fields=[
        'created_at',
        'company_name',
        'status'
    ]
    ordering = ['-created_at'] 

    search_fields=["company","status"]

    def get_queryset(self):
        user = self.request.user

        if user.is_staff:
            return JobApplication.objects.all()
        return JobApplication.objects.filter(user=user)

    # def get_queryset(self):
    #     user=self.request.user
    #     # cache_key=f"job_application_{user.id}"

    #     # queryset = cache.get(cache_key)
    #     if queryset is None:
    #         print("cache missed, query hit database")

    #         if  user.is_staff:
    #             queryset= JobApplication.objects.all()
    #         else:
    #             queryset= JobApplication.objects.filter(user=user)
        
    #         # cache.set(cache_key,queryset,timeout=300)
    #     else: 
    #         print("cache hit !")
    #     return queryset
            
    

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)



