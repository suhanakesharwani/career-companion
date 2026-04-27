import httpx
import os
import asyncio
from asgiref.sync import async_to_sync


API_URL = "https://api.groq.com/openai/v1/chat/completions"
API_KEY = os.getenv("GROQ_API_KEY")
MODEL_NAME = "llama-3.1-8b-instant"

HEADERS = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json",
}

async def query_ai(prompt, system_prompt="You are a professional interviewer."):
    """Core async function to handle AI requests."""
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.post(
                API_URL,
                headers=HEADERS,
                json={
                    "model": MODEL_NAME,
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": prompt},
                    ],
                    "max_tokens": 200,
                },
                timeout=60.0,
            )
            if resp.status_code != 200:
                return "AI unavailable"
            
            data = resp.json()
            return data["choices"][0]["message"]["content"]
    except Exception:
        return "AI unavailable"

# --- Async Methods for WebSockets ---

async def generate_question_async(role, level):
    system = "Give ONLY the question. No intro. Max 2 sentences. Theory only."
    prompt = f"Ask one theory-based interview question for a {level} {role}."
    return await query_ai(prompt, system)

async def evaluate_answer_async(question, answer):
    system = """
        You are an expert interview evaluator.

        Evaluate the answer on:
        - Technical Accuracy (0-10)
        - Clarity (0-10)
        - Depth (0-10)

        STRICT FORMAT:

        TECHNICAL ACCURACY: X/10 - <1 short reason>
        CLARITY: X/10 - <1 short reason>
        DEPTH: X/10 - <1 short reason>

        OVERALL FEEDBACK:
        - 2–3 specific suggestions to improve clarity and structure.
        - Be constructive and concise.
        """
    prompt = f"Question: {question}\nUser Answer: {answer}"
    return await query_ai(prompt, system)


def generate_question(role, level):
    """Sync wrapper for HTTP views."""
    return async_to_sync(generate_question_async)(role, level)

def evaluate_answer(question, answer):
    """Sync wrapper for HTTP views."""
    return async_to_sync(evaluate_answer_async)(question, answer)