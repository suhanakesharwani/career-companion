from rest_framework.routers import DefaultRouter
from .views import JobApplicationViewSet

router=DefaultRouter()
router.register(r'JobApplication',JobApplicationViewSet,basename='JobApplication')


urlpatterns=router.urls