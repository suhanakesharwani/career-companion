# from django.shortcuts import render

# # Create your views here.
# import whisper
# import librosa
# import numpy as np
# from rest_framework.decorators import api_view
# from rest_framework.response import Response
# import tempfile
# import openai

# model = whisper.load_model("base")

# @api_view(["POST"])
# def voice_interview(request):
#     audio_file = request.FILES.get("audio")

#     # Save temp file
#     with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as temp:
#         for chunk in audio_file.chunks():
#             temp.write(chunk)
#         temp_path = temp.name

#     # 🎧 STEP 1: Speech → Text
#     result = model.transcribe(temp_path)
#     text = result["text"]

#     # 🎵 STEP 2: Tone Analysis
#     y, sr = librosa.load(temp_path)

#     duration = librosa.get_duration(y=y, sr=sr)
#     tempo = librosa.beat.tempo(y=y, sr=sr)[0]

#     energy = np.mean(librosa.feature.rms(y=y))

#     # Simple heuristics
#     tone = "Confident"
#     if energy < 0.02:
#         tone = "Low energy / nervous"
#     elif tempo < 60:
#         tone = "Too slow"
#     elif tempo > 140:
#         tone = "Too fast"

#     # 🤖 STEP 3: AI Evaluation
#     prompt = f"""
#     Evaluate this interview answer:

#     "{text}"

#     Give:
#     - score (1-10)
#     - strengths
#     - weaknesses
#     - improved answer
#     """

#     response = openai.ChatCompletion.create(
#         model="gpt-4o-mini",
#         messages=[{"role": "user", "content": prompt}]
#     )

#     ai_feedback = response.choices[0].message["content"]

#     return Response({
#         "transcript": text,
#         "tone": tone,
#         "duration": round(duration, 2),
#         "tempo": round(float(tempo), 2),
#         "energy": float(energy),
#         "ai_feedback": ai_feedback
#     })