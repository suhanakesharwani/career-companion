import os
from django.db import transaction
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response

# Internal Imports (Ensure these paths match your folder names!)
from matching.ai_client import get_skill_match
from resumes.models import Resume
from jobs.models import JobDescription
from resumes.utils import extract_text_from_resume
from common.utils import clean_text, get_skills

class UploadAndMatchAPIView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        resume_file = request.FILES.get("resume")
        jd_text = request.data.get("jd_text")

        # 1. Validation
        if not resume_file or not jd_text:
            return Response({"error": "Resume and JD required"}, status=400)

        ALLOWED_TYPES = [
            "application/pdf",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ]
        if resume_file.content_type not in ALLOWED_TYPES:
            return Response({"error": "Invalid file type"}, status=400)

        # 2. Database Operations (Atomic Block)
        # We wrap only the DB saving in atomic, NOT the AI call
        with transaction.atomic():
            resume = Resume.objects.create(
                user=request.user,
                file=resume_file
            )
            
            # Extract and Clean
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

        # 3. AI Matching (OUTSIDE the atomic block)
        # This prevents the DB from hanging while waiting for the AI response
        try:
            matching_result = get_skill_match(
                list(jd_skills),
                list(resume_skills)
            )
        except Exception as e:
            # Fallback if the AI service is down/cold starting
            return Response({
                "error": "AI service is currently busy. Data saved.",
                "resume_id": resume.id,
                "job_id": job.id
            }, status=503)

        # 4. Final Response
        return Response({
            "resume_skills": resume_skills,
            "jd_skills": jd_skills,
            "matching_result": matching_result,
            "resume_id": resume.id,
            "job_id": job.id
        })