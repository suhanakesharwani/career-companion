import json
import time
import asyncio
from channels.generic.websocket import AsyncWebsocketConsumer
from .services.ai_service import generate_question_async, evaluate_answer_async

MAX_MESSAGE_SIZE = 2000
MIN_MESSAGE_INTERVAL = 1.0

class InterviewConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        self.user = self.scope.get("user")

        if not self.user or self.user.is_anonymous:
            await self.close()
            return

        self.role = None
        self.level = None
        self.current_question = None
        self.last_message_time = 0

        await self.accept()

    async def receive(self, text_data):

        # Security checks
        if len(text_data) > MAX_MESSAGE_SIZE:
            await self.close()
            return

        now = time.time()
        if now - self.last_message_time < MIN_MESSAGE_INTERVAL:
            await self.send(json.dumps({
                "type": "error",
                "message": "Slow down!"
            }))
            return

        self.last_message_time = now

        try:
            data = json.loads(text_data)
            msg_type = data.get("type")

            # START INTERVIEW
            if msg_type == "start":
                self.role = str(data.get("role", ""))[:100]
                self.level = str(data.get("level", ""))[:50]

                self.current_question = await generate_question_async(
                    self.role,
                    self.level
                )

                await self.send(json.dumps({
                    "type": "question",
                    "question": self.current_question
                }))

            # USER ANSWER
            elif msg_type == "answer":

                if not self.current_question:
                    await self.send(json.dumps({
                        "type": "error",
                        "message": "Start interview first"
                    }))
                    return

                user_answer = str(data.get("answer", ""))[:1000]

                # Run both tasks concurrently
                feedback, next_question = await asyncio.gather(
                    evaluate_answer_async(self.current_question, user_answer),
                    generate_question_async(self.role, self.level)
                )

                self.current_question = next_question

                await self.send(json.dumps({
                    "type": "feedback",
                    "feedback": feedback,
                    "next_question": next_question
                }))

        except Exception as e:
            await self.send(json.dumps({
                "type": "error",
                "message": "Processing error"
            }))

    async def disconnect(self, close_code):
        pass