from rest_framework.routers import DefaultRouter
from .views import JobApplicationViewSet

router=DefaultRouter()
router.register(r'job-application',JobApplicationViewSet,basename='job-application')


urlpatterns=router.urls