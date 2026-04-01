import os
import mimetypes
from django.http import FileResponse, Http404
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from .models import Resume


class ServeResumeAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request, resume_id):

        try:
            resume = Resume.objects.get(
                id=resume_id,
                user=request.user
            )
        except Resume.DoesNotExist:
            raise Http404("Not found")

        if not resume.file:
            raise Http404("Not found")

        file_path = resume.file.path

        if not os.path.exists(file_path):
            raise Http404("Not found")

        content_type, _ = mimetypes.guess_type(file_path)

        response = FileResponse(
            resume.file.open("rb"),
            content_type=content_type or "application/octet-stream"
        )

        response["Content-Disposition"] = (
            f'attachment; filename="{os.path.basename(file_path)}"'
        )

        return response