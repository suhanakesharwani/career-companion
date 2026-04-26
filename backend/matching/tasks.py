# from celery import shared_task
# from .ai_utils import semantic_skill_match

# @shared_task
# def match_resume_task(jd_skills, resume_skills):
#     result = semantic_skill_match(jd_skills, resume_skills)
#     return result

from celery import shared_task
from .ai_client import get_skill_match


@shared_task
def match_resume_task(jd_skills, resume_skills):

    result = get_skill_match(
        jd_skills,
        resume_skills
    )

    return result