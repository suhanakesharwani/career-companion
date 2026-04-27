from fastapi import FastAPI
from pydantic import BaseModel
import requests
import os
import time

app = FastAPI()

HF_TOKEN = os.getenv("HF_TOKEN")
API_URL = "https://api-inference.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2"
headers = {"Authorization": f"Bearer {HF_TOKEN}"}

class MatchRequest(BaseModel):
    jd_skills: list[str]
    resume_skills: list[str]

def call_hf_with_retry(payload, retries=3, wait=20):
    """Call HF API with retry on model loading (503)."""
    for attempt in range(retries):
        try:
            response = requests.post(
                API_URL,
                headers=headers,
                json=payload,
                timeout=25
            )
            if response.status_code == 503:
                error_data = response.json()
                # Model is loading — wait and retry
                if "estimated_time" in error_data:
                    sleep_time = min(error_data["estimated_time"], wait)
                    time.sleep(sleep_time)
                    continue
                return None  # Different 503, give up

            response.raise_for_status()
            return response.json()

        except requests.exceptions.Timeout:
            print(f"[Timeout] Attempt {attempt + 1}")
            if attempt == retries - 1:
                return None
        except Exception as e:
            print(f"[Error] {e}")
            return None

    return None

@app.get("/")
def health():
    return {"status": "AI service running"}

@app.post("/match")
def match(req: MatchRequest):
    if not req.jd_skills or not req.resume_skills:
        return {
            "matched_skills": [],
            "missing_skills": req.jd_skills,
            "score": 0.0
        }

    threshold = 0.45  # lowered slightly — MiniLM scores tend to be conservative

    # ─── Strategy: ONE call per JD skill vs ALL resume skills ───────────────
    # This is still N calls but each is fast (~200ms).
    # Better than joining all JD into one string (loses per-skill granularity).
    # For large skill lists (>15), we batch into a single joined call as fallback.

    jd_skills = req.jd_skills
    resume_skills = req.resume_skills

    # If skill lists are large, use the fast single-call strategy
    use_batch = len(jd_skills) > 10 or len(resume_skills) > 15

    matched = []
    missing = []

    if use_batch:
        # ── Fast path: compare joined JD skills vs each resume skill ──────
        # Less precise but avoids N sequential HTTP calls
        payload = {
            "inputs": {
                "source_sentence": " | ".join(jd_skills),
                "sentences": resume_skills
            }
        }
        scores = call_hf_with_retry(payload)

        if scores is None:
            return {
                "matched_skills": [],
                "missing_skills": jd_skills,
                "score": 0.0,
                "error": "AI service timeout"
            }

        # Which resume skills matched?
        matched_resume = set()
        if isinstance(scores, list):
            for i, score in enumerate(scores):
                if isinstance(score, float) and score >= threshold:
                    matched_resume.add(resume_skills[i])

        # Now map back: which JD skills are covered?
        # Do a simple keyword overlap as tiebreaker
        for jd_skill in jd_skills:
            jd_lower = jd_skill.lower()
            found = any(
                jd_lower in r.lower() or r.lower() in jd_lower
                for r in matched_resume
            ) or len(matched_resume) > 0 and any(
                # If resume skill semantically matched AND shares token with JD
                r in matched_resume and any(
                    token in r.lower()
                    for token in jd_lower.split()
                    if len(token) > 3
                )
                for r in resume_skills
            )
            if found:
                matched.append(jd_skill)
            else:
                missing.append(jd_skill)

    else:
        # ── Precise path: one HF call per JD skill ────────────────────────
        for jd_skill in jd_skills:
            payload = {
                "inputs": {
                    "source_sentence": jd_skill,
                    "sentences": resume_skills
                }
            }
            scores = call_hf_with_retry(payload)

            if scores is None:
                # Service down — treat remaining as missing
                missing.append(jd_skill)
                continue

            if isinstance(scores, list) and len(scores) > 0:
                best_score = max(
                    s for s in scores if isinstance(s, float)
                ) if scores else 0.0

                if best_score >= threshold:
                    matched.append(jd_skill)
                else:
                    missing.append(jd_skill)
            else:
                missing.append(jd_skill)

    score = round(len(matched) / max(len(jd_skills), 1), 2)

    return {
        "matched_skills": matched,
        "missing_skills": missing,
        "score": min(score, 1.0)
    }