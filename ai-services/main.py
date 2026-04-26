# from fastapi import FastAPI
# from pydantic import BaseModel
# from ai_utils import semantic_skill_match
# from ai_utils import MODEL
# app = FastAPI()


# @app.on_event("startup")
# def warmup():
#     MODEL.encode(["warmup"]) 

# class MatchRequest(BaseModel):
#     jd_skills: list[str]
#     resume_skills: list[str]


# @app.get("/")
# def health():
#     return {"status": "AI service running"}


# @app.post("/match")
# def match(req: MatchRequest):
#     return semantic_skill_match(
#         req.jd_skills,
#         req.resume_skills
#     )

from fastapi import FastAPI
from pydantic import BaseModel
from ai_utils import semantic_skill_match, MODEL, warmup_model

app = FastAPI()


# ⚡ prevent cold start delay
@app.on_event("startup")
def startup_event():
    warmup_model()


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