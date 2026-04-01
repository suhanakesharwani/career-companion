def interview_question_prompt(role, level):
    return f"""
You are an expert technical interviewer.

Generate ONE interview question.

Role: {role}
Experience Level: {level}

Rules:
- Ask only one question
- Make it realistic
- Do not give answer
"""


def evaluate_answer_prompt(question, answer):
    return f"""
You are a technical interviewer.

Question:
{question}

Candidate Answer:
{answer}

Evaluate:
1. Correctness
2. Strengths
3. Improvements
4. Score out of 10
"""