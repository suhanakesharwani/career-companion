# from django.shortcuts import render,redirect
# from django.http import HttpResponse
# from .models import Resume
# from django.contrib.auth.decorators import login_required
# from .utils import extract_text_from_resume
# from common.utils import clean_text
# # Create your views here.

# # contains upload input and output operations only

# @login_required
# def upload_resume(request):
#     if request.method=="POST":
#         resume_file=request.FILES["resume"]

#         resume=Resume.objects.create(
#             user=request.user,
#             file=resume_file
#         )

#         raw_text=extract_text_from_resume(file)
#         cleaned=clean_text(raw_text)

#         resume.parsed_text=raw_text
#         resume.cleaned_text=cleaned
        

#         resume.save()

#         return redirect("dashboard")
    
#     return render(request,"resume/upload.html")





# resumes/views.py

# @login_required(login_url='/accounts/login/')
# def serve_resume(request, resume_id):
#     resume = get_object_or_404(Resume, id=resume_id, user=request.user)
#     # This ensures ONLY the owner can download it
#     return FileResponse(open(resume.file.path, 'rb'), content_type='application/pdf')

from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.http import FileResponse, Http404
from .models import Resume
import os

class ServeResumeAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, resume_id, format=None):
        try:
            # Ensure user owns the resume
            resume = Resume.objects.get(id=resume_id, user=request.user)
        except Resume.DoesNotExist:
            raise Http404("Resume not found or you don't have access.")

        file_path = resume.file.path
        if not os.path.exists(file_path):
            raise Http404("File does not exist.")

        # Serve the file
        return FileResponse(open(file_path, 'rb'), content_type='application/pdf')