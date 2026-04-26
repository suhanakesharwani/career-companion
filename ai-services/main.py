from fastapi import FastAPI
from pydantic import BaseModel
from ai_utils import semantic_skill_match

app = FastAPI()


class MatchRequest(BaseModel):
    jd_skills: list[str]
    resume_skills: list[str]


@app.get("/")
def health():
    return {"status": "AI service running"}


@app.post("/match")
def match(req: MatchRequest):
    return semantic_skill_match(
        req.jd_skills,
        req.resume_skills
    )