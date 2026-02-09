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

    filter_backends=[DjangoFilterBackend]
    filterset_fields=["status","company"]


    def get_queryset(self):
        if self.request.user.is_staff:
            return JobApplication.objects.all()
        return JobApplication.objects.filter(user=self.request.user)
        
    

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)



