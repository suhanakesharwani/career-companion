from django.db import transaction
import os
# DRF
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response

# Django
from django.db import transaction
from .ai_client import get_skill_match
# Python
import os

# Models
from resumes.models import Resume
from jobs.models import JobDescription

# Resume Processing
from resumes.utils import extract_text_from_resume

# Text Processing
from common.utils import clean_text, get_skills
# from accounts.authentication import CookieJWTAuthentication
# AI Matching
# from .ai_utils import semantic_skill_match
# class UploadAndMatchAPIView(APIView):

#     permission_classes = [IsAuthenticated]

#     # @authentication_classes([CookieJWTAuthentication])
#     parser_classes = [MultiPartParser, FormParser]

#     @transaction.atomic
#     def post(self, request):

#         resume_file = request.FILES.get("resume")
#         jd_text = request.data.get("jd_text")

#         if not resume_file or not jd_text:
#             return Response({"error": "Resume and JD required"}, status=400)

#         # -------- File validation --------
#         ALLOWED_TYPES = [
#             "application/pdf",
#             "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
#         ]

#         if resume_file.content_type not in ALLOWED_TYPES:
#             return Response({"error": "Invalid file type"}, status=400)

#         if resume_file.size > 5 * 1024 * 1024:
#             return Response({"error": "File too large"}, status=400)

#         resume_file.name = os.path.basename(resume_file.name)

#         # -------- JD validation --------
#         if len(jd_text) > 10000:
#             return Response({"error": "JD too large"}, status=400)

#         # -------- Save Resume --------
#         resume = Resume.objects.create(
#             user=request.user,
#             file=resume_file
#         )

#         raw_text = extract_text_from_resume(resume.file.path)
#         cleaned_resume = clean_text(raw_text)
#         resume_skills = get_skills(cleaned_resume)

#         resume.parsed_text = raw_text
#         resume.cleaned_text = cleaned_resume
#         resume.skills = resume_skills
#         resume.save()

#         # -------- Save JD --------
#         cleaned_jd = clean_text(jd_text)
#         jd_skills = get_skills(cleaned_jd)

#         job = JobDescription.objects.create(
#             user=request.user,
#             jd_text=jd_text,
#             cleaned_text=cleaned_jd,
#             skills=jd_skills
#         )

#         # -------- AI Matching --------
#         matching_result = semantic_skill_match(
#             jd_skills=list(jd_skills),
#             resume_skills=list(resume_skills)
#         )

#         return Response({
#             "resume_skills": resume_skills,
#             "jd_skills": jd_skills,
#             "matching_result": matching_result,
#             "resume_id": resume.id,
#             "job_id": job.id
#         })

class UploadAndMatchAPIView(APIView):

    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    @transaction.atomic
    def post(self, request):

        resume_file = request.FILES.get("resume")
        jd_text = request.data.get("jd_text")

        if not resume_file or not jd_text:
            return Response({"error": "Resume and JD required"}, status=400)

        ALLOWED_TYPES = [
            "application/pdf",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ]

        if resume_file.content_type not in ALLOWED_TYPES:
            return Response({"error": "Invalid file type"}, status=400)

        if resume_file.size > 5 * 1024 * 1024:
            return Response({"error": "File too large"}, status=400)

        resume = Resume.objects.create(
            user=request.user,
            file=resume_file
        )

        raw_text = extract_text_from_resume(resume.file.path)
        cleaned_resume = clean_text(raw_text)
        resume_skills = get_skills(cleaned_resume)

        resume.parsed_text = raw_text
        resume.cleaned_text = cleaned_resume
        resume.skills = resume_skills
        resume.save()

        cleaned_jd = clean_text(jd_text)
        jd_skills = get_skills(cleaned_jd)

        job = JobDescription.objects.create(
            user=request.user,
            jd_text=jd_text,
            cleaned_text=cleaned_jd,
            skills=jd_skills
        )

        # ✅ CALL AI SERVICE (NOT LOCAL MODEL)
        matching_result = get_skill_match(
            list(jd_skills),
            list(resume_skills)
        )

        return Response({
            "resume_skills": resume_skills,
            "jd_skills": jd_skills,
            "matching_result": matching_result,
            "resume_id": resume.id,
            "job_id": job.id
        })