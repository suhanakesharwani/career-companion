
def calculate_matching_result(jd_skills,resume_skills):
    #calc score
    matched_skills=resume_skills & jd_skills
    missing_skills=jd_skills-resume_skills
    score=len(matched_skills) / max(len(jd_skills),1)


    return{
        "matched_skills":list(matched_skills),
        "missing_skills":list(missing_skills),
        "score":score
    }
    