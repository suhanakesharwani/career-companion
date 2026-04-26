# # from sentence_transformers import SentenceTransformer

# # MODEL = SentenceTransformer("paraphrase-MiniLM-L3-v2") 

# # # def get_model():
# # #     global MODEL
# # #     if MODEL is None:
# # #         MODEL = SentenceTransformer("paraphrase-MiniLM-L3-v2")
# # #     return MODEL


# # def semantic_skill_match(jd_skills, resume_skills, threshold=0.65):
# #     from sklearn.metrics.pairwise import cosine_similarity
# #     import numpy as np

# #     # model = get_model()   # 👈 HERE you use it

# #     if not jd_skills or not resume_skills:
# #         return {
# #             "matched_skills": [],
# #             "missing_skills": jd_skills,
# #             "score": 0.0
# #         }

# #     jd_embeddings = model.encode(jd_skills)
# #     resume_embeddings = model.encode(resume_skills)

# #     similarity_matrix = cosine_similarity(jd_embeddings, resume_embeddings)

# #     matched = []
# #     missing = []

# #     for i, jd_skill in enumerate(jd_skills):
# #         max_score = np.max(similarity_matrix[i])

# #         if max_score >= threshold:
# #             matched.append(jd_skill)
# #         else:
# #             missing.append(jd_skill)

# #     score = round(len(matched) / max(len(jd_skills), 1), 2)

# #     return {
# #         "matched_skills": matched,
# #         "missing_skills": missing,
# #         "score": score
# #     }

# from sentence_transformers import SentenceTransformer
# from sklearn.metrics.pairwise import cosine_similarity
# import numpy as np

# MODEL = SentenceTransformer("paraphrase-MiniLM-L3-v2")  # load once globally

# def semantic_skill_match(jd_skills, resume_skills, threshold=0.65):

#     if not jd_skills or not resume_skills:
#         return {
#             "matched_skills": [],
#             "missing_skills": jd_skills,
#             "score": 0.0
#         }

#     jd_embeddings = MODEL.encode(jd_skills, convert_to_numpy=True)
#     resume_embeddings = MODEL.encode(resume_skills, convert_to_numpy=True)

#     similarity_matrix = cosine_similarity(jd_embeddings, resume_embeddings)

#     matched = []
#     missing = []

#     for i, jd_skill in enumerate(jd_skills):
#         max_score = np.max(similarity_matrix[i])

#         if max_score >= threshold:
#             matched.append(jd_skill)
#         else:
#             missing.append(jd_skill)

#     score = round(len(matched) / max(len(jd_skills), 1), 2)

#     return {
#         "matched_skills": matched,
#         "missing_skills": missing,
#         "score": score
#     }
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
from functools import lru_cache
import numpy as np

# ⚡ Load model ONCE (CPU optimized)
MODEL = SentenceTransformer("all-MiniLM-L6-v2", device="cpu")
MODEL.max_seq_length = 64  # speed boost

# ⚡ Warmup helper (used in main.py)
def warmup_model():
    MODEL.encode(["python", "java", "ml"])

# ⚡ Cache embeddings per skill (VERY IMPORTANT)
@lru_cache(maxsize=1000)
def get_embedding(text):
    return MODEL.encode(text, convert_to_numpy=True)


def semantic_skill_match(jd_skills, resume_skills, threshold=0.65):

    if not jd_skills or not resume_skills:
        return {
            "matched_skills": [],
            "missing_skills": jd_skills,
            "score": 0.0
        }

    # ⚡ Fast embedding generation with cache
    jd_embeddings = np.array([get_embedding(s) for s in jd_skills])
    resume_embeddings = np.array([get_embedding(s) for s in resume_skills])

    # ⚡ similarity
    similarity_matrix = cosine_similarity(jd_embeddings, resume_embeddings)

    matched = []
    missing = []

    for i, jd_skill in enumerate(jd_skills):
        if np.max(similarity_matrix[i]) >= threshold:
            matched.append(jd_skill)
        else:
            missing.append(jd_skill)

    score = len(matched) / max(len(jd_skills), 1)

    return {
        "matched_skills": matched,
        "missing_skills": missing,
        "score": round(score, 2)
    }