# import os
# from django.db import transaction
# from rest_framework.views import APIView
# from rest_framework.permissions import IsAuthenticated
# from rest_framework.parsers import MultiPartParser, FormParser
# from rest_framework.response import Response

# # Internal Imports (Ensure these paths match your folder names!)
# from matching.ai_client import get_skill_match
# from resumes.models import Resume
# from jobs.models import JobDescription
# from resumes.utils import extract_text_from_resume
# from common.utils import clean_text, get_skills

# class UploadAndMatchAPIView(APIView):
#     permission_classes = [IsAuthenticated]
#     parser_classes = [MultiPartParser, FormParser]

#     def post(self, request):
#         resume_file = request.FILES.get("resume")
#         jd_text = request.data.get("jd_text")

#         # 1. Validation
#         if not resume_file or not jd_text:
#             return Response({"error": "Resume and JD required"}, status=400)

#         ALLOWED_TYPES = [
#             "application/pdf",
#             "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
#         ]
#         if resume_file.content_type not in ALLOWED_TYPES:
#             return Response({"error": "Invalid file type"}, status=400)

#         # 2. Database Operations (Atomic Block)
#         # We wrap only the DB saving in atomic, NOT the AI call
#         with transaction.atomic():
#             resume = Resume.objects.create(
#                 user=request.user,
#                 file=resume_file
#             )
            
#             # Extract and Clean
#             raw_text = extract_text_from_resume(resume.file.path)
#             cleaned_resume = clean_text(raw_text)
#             resume_skills = get_skills(cleaned_resume)

#             resume.parsed_text = raw_text
#             resume.cleaned_text = cleaned_resume
#             resume.skills = resume_skills
#             resume.save()

#             cleaned_jd = clean_text(jd_text)
#             jd_skills = get_skills(cleaned_jd)

#             job = JobDescription.objects.create(
#                 user=request.user,
#                 jd_text=jd_text,
#                 cleaned_text=cleaned_jd,
#                 skills=jd_skills
#             )

#         # 3. AI Matching (OUTSIDE the atomic block)
#         # This prevents the DB from hanging while waiting for the AI response
#         try:
#             matching_result = get_skill_match(
#                 list(jd_skills),
#                 list(resume_skills)
#             )
#         except Exception as e:
#             # Fallback if the AI service is down/cold starting
         

#             return Response({
#                 "matching_result": {
#                     "matched_skills": [],
#                     "missing_skills": [],
#                     "score": 0
#                 },
#                 "error": "AI service is busy"   
#             }, status=503)
        


#         # 4. Final Response
#         return Response({
#             "resume_skills": resume_skills,
#             "jd_skills": jd_skills,
#             "matching_result": matching_result,
#             "resume_id": resume.id,
#             "job_id": job.id
#         })


import os
import logging
from django.db import transaction
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response

from matching.ai_client import get_skill_match
from resumes.models import Resume
from jobs.models import JobDescription
from resumes.utils import extract_text_from_resume
from common.utils import clean_text, get_skills

logger = logging.getLogger(__name__)

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

        # 2. Database Operations
        try:
            with transaction.atomic():
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

        except Exception as e:
            logger.error(f"[DB Error] {e}")
            return Response({"error": "Failed to process resume"}, status=500)

        # ── Debug log — check what skills were extracted ──────────────────
        logger.info(f"[Skills] JD: {jd_skills}")
        logger.info(f"[Skills] Resume: {resume_skills}")

        # 3. AI Matching
        try:
            matching_result = get_skill_match(
                list(jd_skills),
                list(resume_skills)
            )
            logger.info(f"[Matching Result] {matching_result}")

        except Exception as e:
            logger.error(f"[AI Error] {e}")
            # ✅ Return jd_skills as missing, not empty list
            return Response({
                "matching_result": {
                    "matched_skills": [],
                    "missing_skills": list(jd_skills),
                    "score": 0,
                    "insight": "AI service is unavailable. Please try again shortly."
                },
                "resume_skills": list(resume_skills),
                "jd_skills": list(jd_skills),
                "resume_id": resume.id,
                "job_id": job.id,
                "error": "AI service is busy"
            }, status=503)

        # 4. Validate matching_result structure
        if not matching_result or not isinstance(matching_result, dict):
            logger.error(f"[Matching] Invalid result: {matching_result}")
            return Response({
                "matching_result": {
                    "matched_skills": [],
                    "missing_skills": list(jd_skills),
                    "score": 0,
                    "insight": "Matching failed. Please try again."
                },
                "resume_skills": list(resume_skills),
                "jd_skills": list(jd_skills),
                "resume_id": resume.id,
                "job_id": job.id,
            }, status=200)

        # 5. Ensure all keys exist with fallbacks
        safe_result = {
            "matched_skills": matching_result.get("matched_skills", []),
            "missing_skills": matching_result.get("missing_skills", list(jd_skills)),
            "score": matching_result.get("score", 0),
            "insight": matching_result.get("insight", None),  # ✅ pass insight through
        }

        # 6. Final Response
        return Response({
            "resume_skills": list(resume_skills),
            "jd_skills": list(jd_skills),
            "matching_result": safe_result,
            "resume_id": resume.id,
            "job_id": job.id,
        })