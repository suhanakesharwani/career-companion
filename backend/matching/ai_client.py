# import requests

# AI_SERVICE_URL = "https://career-companion-ai-v1rj.onrender.com/match"


# def get_skill_match(jd_skills, resume_skills):

#     response = requests.post(
#         AI_SERVICE_URL,
#         json={
#             "jd_skills": jd_skills,
#             "resume_skills": resume_skills,
#         },
#         timeout=120
#     )

#     response.raise_for_status()

#     return response.json()

import requests

AI_SERVICE_URL = "https://career-companion-ai-v1rj.onrender.com/match"

# ⚡ reuse HTTP connection (faster)
session = requests.Session()


def get_skill_match(jd_skills, resume_skills):

    response = session.post(
        AI_SERVICE_URL,
        json={
            "jd_skills": jd_skills,
            "resume_skills": resume_skills,
        },
        timeout=60
    )

    response.raise_for_status()
    return response.json()