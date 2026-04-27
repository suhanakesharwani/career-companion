from fastapi import FastAPI
from pydantic import BaseModel
import requests
import os
import time

app = FastAPI()

HF_TOKEN = os.getenv("HF_TOKEN")
EMBEDDING_URL = "https://api-inference.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2"
INSIGHT_URL = "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3"
headers = {"Authorization": f"Bearer {HF_TOKEN}"}

ALIASES = {
    "nodejs": "node.js", "node": "node.js", "reactjs": "react",
    "react.js": "react", "vuejs": "vue", "vue.js": "vue",
    "postgres": "postgresql", "mongo": "mongodb", "nextjs": "next.js",
    "expressjs": "express", "sklearn": "scikit-learn", "k8s": "kubernetes",
    "js": "javascript", "ts": "typescript",
}

STACK_MAP = {
    "mern": ["mongodb", "express", "react", "node.js", "javascript"],
    "mean": ["mongodb", "express", "angular", "node.js", "javascript"],
    "lamp": ["linux", "apache", "mysql", "php"],
    "fullstack": ["react", "node.js", "javascript", "sql"],
    "full stack": ["react", "node.js", "javascript", "sql"],
}

class MatchRequest(BaseModel):
    jd_skills: list[str]
    resume_skills: list[str]


def normalize(skill: str) -> str:
    s = skill.lower().strip()
    s = s.replace("-", "").replace(".", "").replace(" ", "").replace("_", "")
    return ALIASES.get(s, s)


def build_resume_set(resume_skills: list[str]) -> set[str]:
    expanded = set()
    for skill in resume_skills:
        norm = normalize(skill)
        expanded.add(norm)
        if norm in STACK_MAP:
            for component in STACK_MAP[norm]:
                expanded.add(normalize(component))

    # Reverse stack: if resume has 3+ components of a stack, add the stack
    for stack, components in STACK_MAP.items():
        norm_components = [normalize(c) for c in components]
        if sum(1 for c in norm_components if c in expanded) >= 3:
            expanded.add(normalize(stack))

    return expanded


def call_hf_embeddings(source: str, sentences: list[str]) -> list[float] | None:
    """Get similarity scores from HF sentence-transformers."""
    payload = {"inputs": {"source_sentence": source, "sentences": sentences}}
    for attempt in range(3):
        try:
            res = requests.post(EMBEDDING_URL, headers=headers, json=payload, timeout=25)
            if res.status_code == 503:
                wait = min(res.json().get("estimated_time", 20), 20)
                print(f"[HF] Model loading, waiting {wait}s...")
                time.sleep(wait)
                continue
            res.raise_for_status()
            return res.json()
        except requests.exceptions.Timeout:
            print(f"[HF] Timeout attempt {attempt + 1}")
        except Exception as e:
            print(f"[HF] Error: {e}")
    return None


def get_ai_insights(matched: list[str], missing: list[str], score: float) -> str:
    """
    Use Mistral on HF to generate a human-readable insight about the match.
    Falls back to a default message if HF is unavailable.
    """
    if not missing and not matched:
        return "No skills data available for insights."

    prompt = f"""<s>[INST] You are a career advisor. A candidate's resume was matched against a job description.

Match Score: {round(score * 100)}%
Matched Skills: {', '.join(matched) if matched else 'None'}
Missing Skills: {', '.join(missing) if missing else 'None'}

Give 2-3 short, specific, actionable tips to improve this resume for this job. Be direct and concise. No bullet points, just plain sentences. Max 80 words. [/INST]"""

    payload = {"inputs": prompt, "parameters": {"max_new_tokens": 120, "temperature": 0.7}}

    try:
        res = requests.post(INSIGHT_URL, headers=headers, json=payload, timeout=30)
        if res.status_code == 503:
            return "AI insights unavailable right now — model is loading. Try again in 20 seconds."
        res.raise_for_status()
        data = res.json()

        if isinstance(data, list) and len(data) > 0:
            text = data[0].get("generated_text", "")
            # Strip the prompt from the response
            if "[/INST]" in text:
                text = text.split("[/INST]")[-1].strip()
            return text if text else "Could not generate insights."

    except Exception as e:
        print(f"[Insights] Error: {e}")

    return f"Focus on adding {', '.join(missing[:3])} to strengthen your resume for this role."


@app.get("/")
def health():
    return {"status": "AI service running"}


@app.post("/match")
def match(req: MatchRequest):
    if not req.jd_skills or not req.resume_skills:
        return {
            "matched_skills": [],
            "missing_skills": list(req.jd_skills),
            "score": 0.0,
            "insight": "Please provide both resume and job description."
        }

    resume_set = build_resume_set(req.resume_skills)
    matched = []
    missing = []
    semantic_candidates = []  # skills that didn't exact match — try semantic

    print(f"[match] JD: {req.jd_skills}")
    print(f"[match] Resume expanded: {resume_set}")

    # ── Phase 1: Exact + stack match ──────────────────────────────────────
    for jd_skill in req.jd_skills:
        jd_norm = normalize(jd_skill)
        if jd_norm in resume_set:
            matched.append(jd_skill)
        else:
            semantic_candidates.append(jd_skill)

    # ── Phase 2: Semantic match for remaining skills via HF ───────────────
    # Only call HF for skills that didn't exact-match
    if semantic_candidates and req.resume_skills:
        resume_list = list(req.resume_skills)
        for jd_skill in semantic_candidates:
            scores = call_hf_embeddings(jd_skill, resume_list)

            if scores and isinstance(scores, list):
                valid = [s for s in scores if isinstance(s, float)]
                best = max(valid) if valid else 0.0
                print(f"[semantic] '{jd_skill}' best_score={best:.3f}")

                # Higher threshold here since exact match already ran
                if best >= 0.60:
                    matched.append(jd_skill)
                else:
                    missing.append(jd_skill)
            else:
                # HF unavailable — mark as missing
                missing.append(jd_skill)

    score = round(len(matched) / max(len(req.jd_skills), 1), 2)

    # ── Phase 3: AI Insights via Mistral ──────────────────────────────────
    insight = get_ai_insights(matched, missing, score)

    print(f"[match] Score: {score} | Matched: {matched} | Missing: {missing}")

    return {
        "matched_skills": matched,
        "missing_skills": missing,
        "score": min(score, 1.0),
        "insight": insight
    }