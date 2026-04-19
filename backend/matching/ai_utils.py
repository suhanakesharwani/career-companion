# matching/ai_utils.py

import re




import numpy as np


_model = None

def get_model():
    global _model
    if _model is None:
        try:
            from sentence_transformers import SentenceTransformer
            _model = SentenceTransformer("all-MiniLM-L6-v2")
        except Exception:
            _model = None
    return _model

def semantic_skill_match(jd_skills, resume_skills, threshold=0.65):
    from sklearn.metrics.pairwise import cosine_similarity

    model=get_model()
    """
    jd_skills: list[str]
    resume_skills: list[str]
    """

    if not jd_skills or not resume_skills:
        return {
            "matched_skills": [],
            "missing_skills": jd_skills,
            "score": 0.0
        }

    jd_embeddings = model.encode(jd_skills)
    resume_embeddings = model.encode(resume_skills)

    similarity_matrix = cosine_similarity(jd_embeddings, resume_embeddings)

    matched = []
    missing = []

    for idx, jd_skill in enumerate(jd_skills):
        max_score = np.max(similarity_matrix[idx])

        if max_score >= threshold:
            matched.append(jd_skill)
        else:
            missing.append(jd_skill)

    score = round(len(matched) / max(len(jd_skills), 1), 2)

    return {
        "matched_skills": matched,
        "missing_skills": missing,
        "score": score
    }