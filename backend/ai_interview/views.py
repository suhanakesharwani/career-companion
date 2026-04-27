from rest_framework.decorators import api_view
from rest_framework.response import Response
from .services.ai_service import generate_question, evaluate_answer
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes
from django_ratelimit.decorators import ratelimit


@api_view(['GET'])
@permission_classes([IsAuthenticated])
@ratelimit(key='user',rate='10/m',block=True)
def get_ai_question(request):

    role = request.GET.get("role")
    level = request.GET.get("level")
    question_text = generate_question(role, level)
    return Response({"question": question_text})



def clean_text(text):
    if not text:
        return ""

    text=text.strip()
    if len(text)>1000:
        raise ValueError("Too Long")
    return text


@api_view(['POST'])
@permission_classes([IsAuthenticated])

@ratelimit(key='user',rate='10/m',block=True)
def evaluate_ai_answer(request):
    #validate the answer and question 
    question = clean_text(request.data.get("question"))
    answer = clean_text(request.data.get("answer"))
    feedback = evaluate_answer(question, answer)
    return Response({"feedback": feedback})