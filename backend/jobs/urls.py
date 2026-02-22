# jobs/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import JobApplicationViewSet, job_list_page

router = DefaultRouter()
router.register(r'applications', JobApplicationViewSet, basename='job-application')

urlpatterns = [
    # This is the URL you will actually visit in your browser
    path('list/', job_list_page, name='job_list_page'), 
    
    # This is the internal API the JS will call
    path('api/', include(router.urls)), 
]