from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

print("Loading embedding model...")

MODEL = SentenceTransformer("all-MiniLM-L6-v2")

MODEL.encode(["warmup"])

print("Model ready.")


def semantic_skill_match(jd_skills, resume_skills, threshold=0.65):

    if not jd_skills or not resume_skills:
        return {
            "matched_skills": [],
            "missing_skills": jd_skills,
            "score": 0.0
        }

    jd_embeddings = MODEL.encode(jd_skills)
    resume_embeddings = MODEL.encode(resume_skills)

    similarity_matrix = cosine_similarity(
        jd_embeddings,
        resume_embeddings
    )

    matched, missing = [], []

    for i, skill in enumerate(jd_skills):
        if np.max(similarity_matrix[i]) >= threshold:
            matched.append(skill)
        else:
            missing.append(skill)

    score = round(len(matched) / max(len(jd_skills), 1), 2)

    return {
        "matched_skills": matched,
        "missing_skills": missing,
        "score": score
    }