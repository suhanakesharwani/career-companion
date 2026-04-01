import os
from openai import OpenAI
from django.conf import settings


# Initialize HuggingFace Router Client
client = OpenAI(
    base_url="https://router.huggingface.co/v1",
    api_key=settings.HF_API_KEY,
)


def generate_ai_response(prompt: str) -> str:
    """
    Sends prompt to HuggingFace LLM
    and returns generated text.
    """

    try:
        completion = client.chat.completions.create(
            model="mistralai/Mistral-7B-Instruct-v0.2:featherless-ai",
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.7,
            max_tokens=300,
        )

        return completion.choices[0].message.content.strip()

    except Exception as e:
        print("AI ERROR:", str(e))
        return "AI Response failed"