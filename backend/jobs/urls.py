# jobs/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import JobApplicationViewSet, JobListView

router = DefaultRouter()
router.register(r'job-application', JobApplicationViewSet, basename='job-application')


urlpatterns=[
    path('',include(router.urls))
]
# urlpatterns = [
#     # This is the URL you will actually visit in your browser
   
#     path(
#         "job-application/",
#         JobApplicationViewSet.as_view({"get": "list", "post": "create"}),
#     ),
    
#     # This is the internal API the JS will call
#     path('', include(router.urls)), 
# ]