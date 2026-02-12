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

@login_required
def upload_jd(request):
    if request.method=="POST":
        raw_text=request.te
        
        cleaned=clean_text(raw_text)


        return redirect("dashboard")
    
    return render(request,"resume/upload.html")


class IsOwnerOrAdmin(BasePermission):
    def has_object_permission(self, request, view, obj):
        return request.user.is_staff or obj.user==request.user

class JobApplicationViewSet(viewsets.ModelViewSet):


    permission_classes=[IsAuthenticated]
    serializer_class=JobApplicationSerializer
    paginator = PageNumberPagination()
    paginator.page_size = 5

    filter_backends=[DjangoFilterBackend,SearchFilter,OrderingFilter]
    filterset_fields=["status","company"]

    ordering_fields=[
        'created_at',
        'company_name',
        'job_title',
        'status'
    ]
    ordering = ['-created_at'] 

    search_fields=["company","staus","job_title"]


    def get_queryset(self):
        user=self.request.user
        cache_key=f"job_application_{user.id}"

        queryset = cache.get(cache_key)
        if queryset is None:
            print("cache missed, query hit database")

            if  user.is_staff:
                queryset= JobApplication.objects.all()
            else:
                queryset= JobApplication.objects.filter(user=user)
        
            cache.set(cache_key,queryset,timeout=300)
        else: 
            print("cache hit !")
        return queryset
            
    

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)



