from sentence_transformers import SentenceTransformer

MODEL = None

def get_model():
    global MODEL
    if MODEL is None:
        MODEL = SentenceTransformer("paraphrase-MiniLM-L3-v2")
    return MODEL


def semantic_skill_match(jd_skills, resume_skills, threshold=0.65):
    from sklearn.metrics.pairwise import cosine_similarity
    import numpy as np

    model = get_model()   # 👈 HERE you use it

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

    for i, jd_skill in enumerate(jd_skills):
        max_score = np.max(similarity_matrix[i])

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