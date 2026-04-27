from fastapi import FastAPI
from pydantic import BaseModel
import requests
import os
import time

app = FastAPI()

HF_TOKEN = os.getenv("HF_TOKEN")
API_URL = "https://api-inference.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2"
headers = {"Authorization": f"Bearer {HF_TOKEN}"}

# Skills that are part of a larger stack
STACK_MAP = {
    "mern": ["mongodb", "express", "react", "node.js", "nodejs"],
    "mean": ["mongodb", "express", "angular", "node.js", "nodejs"],
    "lamp": ["linux", "apache", "mysql", "php"],
    "full stack": ["frontend", "backend", "api"],
}

class MatchRequest(BaseModel):
    jd_skills: list[str]
    resume_skills: list[str]



def normalize(skill: str) -> str:
    return skill.lower().strip().replace("-", "").replace(".", "").replace(" ", "")

def exact_or_fuzzy_match(jd_skill: str, resume_skills: list[str]) -> bool:
    """Check for exact match, substring match, or stack expansion."""
    jd_norm = normalize(jd_skill)
    resume_norms = [normalize(r) for r in resume_skills]

    # 1. Exact match after normalization
    if jd_norm in resume_norms:
        return True

    # 2. Substring match (e.g. "nodejs" in "node.js backend")
    for r_norm in resume_norms:
        if jd_norm in r_norm or r_norm in jd_norm:
            return True

    # 3. Stack expansion (e.g. JD asks "mern", resume has "react" + "node.js")
    if jd_norm in STACK_MAP:
        stack_components = [normalize(s) for s in STACK_MAP[jd_norm]]
        matches = sum(1 for comp in stack_components if comp in resume_norms)
        # If resume has 2+ components of the stack, count as matched
        if matches >= 2:
            return True

    # 4. Reverse stack check (resume has "mern", JD asks for "react")
    for stack, components in STACK_MAP.items():
        if stack in resume_norms:
            if jd_norm in [normalize(c) for c in components]:
                return True

    return False


def call_hf(source: str, sentences: list[str]) -> list[float] | None:
    """Single HF API call with retry on cold start."""
    payload = {
        "inputs": {
            "source_sentence": source,
            "sentences": sentences
        }
    }
    for attempt in range(3):
        try:
            response = requests.post(
                API_URL, headers=headers, json=payload, timeout=25
            )
            if response.status_code == 503:
                data = response.json()
                wait = min(data.get("estimated_time", 20), 20)
                print(f"[HF] Model loading, waiting {wait}s...")
                time.sleep(wait)
                continue
            response.raise_for_status()
            return response.json()
        except requests.exceptions.Timeout:
            print(f"[HF] Timeout on attempt {attempt + 1}")
        except Exception as e:
            print(f"[HF] Error: {e}")
    return None


@app.get("/")
def health():
    return {"status": "AI service running"}


@app.post("/match")
def match(req: MatchRequest):
    if not req.jd_skills or not req.resume_skills:
        return {
            "matched_skills": [],
            "missing_skills": list(req.jd_skills),
            "score": 0.0
        }

    jd_skills = req.jd_skills
    resume_skills = req.resume_skills
    matched = []
    missing = []

    # Lower threshold for short skills — single words like "react", "python"
    # score lower on sentence transformers
    SHORT_SKILL_THRESHOLD = 0.35
    LONG_SKILL_THRESHOLD = 0.50

    for jd_skill in jd_skills:

        # ── Step 1: Exact / fuzzy / stack match first (no AI needed) ──────
        if exact_or_fuzzy_match(jd_skill, resume_skills):
            matched.append(jd_skill)
            continue

        # ── Step 2: Semantic match via HF for non-exact skills ────────────
        scores = call_hf(jd_skill, resume_skills)

        if scores is None:
            # HF down — fallback to exact only, mark as missing
            missing.append(jd_skill)
            continue

        if isinstance(scores, list) and len(scores) > 0:
            valid_scores = [s for s in scores if isinstance(s, float)]
            if not valid_scores:
                missing.append(jd_skill)
                continue

            best_score = max(valid_scores)

            # Use lower threshold for short single-word skills
            threshold = SHORT_SKILL_THRESHOLD if len(jd_skill.split()) == 1 else LONG_SKILL_THRESHOLD

            print(f"[match] '{jd_skill}' best_score={best_score:.3f} threshold={threshold}")

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

