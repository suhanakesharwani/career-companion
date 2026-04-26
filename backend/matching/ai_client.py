import requests

AI_SERVICE_URL = "http://127.0.0.1:8001/match"


def get_skill_match(jd_skills, resume_skills):

    response = requests.post(
        AI_SERVICE_URL,
        json={
            "jd_skills": jd_skills,
            "resume_skills": resume_skills,
        },
        timeout=120
    )

    response.raise_for_status()

    return response.json()