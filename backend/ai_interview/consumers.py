import json
import time
from channels.generic.websocket import AsyncWebsocketConsumer
from .services.ai_service import generate_question_async, evaluate_answer_async

MAX_MESSAGE_SIZE = 2000
MIN_MESSAGE_INTERVAL = 1.0 

class InterviewConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope.get("user")
        
        # Check if user is authenticated via your JWT Middleware
        if not self.user or self.user.is_anonymous:
            await self.close()
            return

        await self.accept()

        # Session state
        self.role = None
        self.level = None
        self.current_question = None
        self.last_message_time = 0

    async def receive(self, text_data):
        # 1. Basic Security Checks
        if len(text_data) > MAX_MESSAGE_SIZE:
            await self.close()
            return

        current_time = time.time()
        if current_time - self.last_message_time < MIN_MESSAGE_INTERVAL:
            await self.send(text_data=json.dumps({
                "type": "error", "message": "Slow down! One message per second max."
            }))
            return
        self.last_message_time = current_time

        try:
            data = json.loads(text_data)
            msg_type = data.get("type")

            # --- Handle Start ---
            if msg_type == "start":
                self.role = str(data.get("role", ""))[:100]
                self.level = str(data.get("level", ""))[:50]
                
                # Fetch first question asynchronously
                self.current_question = await generate_question_async(self.role, self.level)
                await self.send(text_data=json.dumps({
                    "type": "question",
                    "question": self.current_question
                }))

            # --- Handle Answer ---
            elif msg_type == "answer":
                user_answer = str(data.get("answer", ""))[:1000]
                
                if not self.current_question:
                    await self.send(text_data=json.dumps({"type": "error", "message": "Start the interview first."}))
                    return

                # Evaluate and Generate Next Question concurrently to save time
                # We use asyncio.gather so the user doesn't wait twice as long
                feedback_task = evaluate_answer_async(self.current_question, user_answer)
                next_q_task = generate_question_async(self.role, self.level)
                
                feedback, next_question = await asyncio.gather(feedback_task, next_q_task)
                
                self.current_question = next_question
                await self.send(text_data=json.dumps({
                    "type": "feedback",
                    "feedback": feedback,
                    "next_question": self.current_question
                }))

        except Exception as e:
            await self.send(text_data=json.dumps({"type": "error", "message": "Processing error."}))

    async def disconnect(self, close_code):
        # Clean up if necessary
        pass