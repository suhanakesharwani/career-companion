from fastapi import FastAPI
from pydantic import BaseModel
import requests
import os

app = FastAPI()

# 🔑 Use the token we created in Hugging Face
HF_TOKEN = os.getenv("HF_TOKEN")
# Standard Hugging Face Inference URL for this specific model
API_URL = "https://api-inference.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2"
headers = {"Authorization": f"Bearer {HF_TOKEN}"}

class MatchRequest(BaseModel):
    jd_skills: list[str]
    resume_skills: list[str]

@app.get("/")
def health():
    return {"status": "AI service running"}

@app.post("/match")
def match(req: MatchRequest):
    if not req.jd_skills or not req.resume_skills:
        return {"matched_skills": [], "score": 0.0}

    # We ask Hugging Face to compare one 'source' (JD) against many 'sentences' (Resume)
    payload = {
        "inputs": {
            "source_sentence": ", ".join(req.jd_skills),
            "sentences": req.resume_skills
        }
    }

    try:
        response = requests.post(API_URL, headers=headers, json=payload, timeout=10)
        # The API returns a list of float scores [0.85, 0.45, 0.92...]
        scores = response.json()
        
        matched = []
        threshold = 0.55 # Adjust this: 1.0 is exact match, 0.0 is nothing alike
        
        if isinstance(scores, list):
            for i, score in enumerate(scores):
                if score >= threshold:
                    matched.append(req.resume_skills[i])

        final_score = len(matched) / max(len(req.jd_skills), 1)
        
        return {
            "matched_skills": list(set(matched)),
            "score": round(min(final_score, 1.0), 2)
        }
    except Exception as e:
        return {"error": str(e), "score": 0.0}