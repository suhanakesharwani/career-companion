from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .services.huggingface_service import generate_ai_response
from .prompts.interview_prompts import (
    interview_question_prompt,
    evaluate_answer_prompt
)


class GenerateQuestionAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        role = request.data.get("role")
        level = request.data.get("level")

        prompt = interview_question_prompt(role, level)

        question = generate_ai_response(prompt)

        return Response({"question": question})


class EvaluateAnswerAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        question = request.data.get("question")
        answer = request.data.get("answer")

        prompt = evaluate_answer_prompt(question, answer)

        feedback = generate_ai_response(prompt)

        return Response({"feedback": feedback})