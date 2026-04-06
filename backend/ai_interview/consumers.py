# import json
# from channels.generic.websocket import WebsocketConsumer
# from .services.ai_service import generate_question, evaluate_answer

# class InterviewConsumer(WebsocketConsumer):
#     def connect(self):
#         user=self.scope["user"]
#         if user.is_anonymous:
#             self.close()
#             return
#         self.accept()
#         self.role = None
#         self.level = None
#         self.current_question = None

#     def receive(self, text_data):
#         data = json.loads(text_data)
#         msg_type = data.get("type")

#         if msg_type == "start":
#             self.role = data.get("role")
#             self.level = data.get("level")
#             self.current_question = generate_question(self.role, self.level)
#             self.send(text_data=json.dumps({
#                 "type": "question",
#                 "question": self.current_question
#             }))

#         # elif msg_type == "answer":
#         #     user_answer = data.get("answer")
#         #     feedback = evaluate_answer(self.current_question, user_answer)
#         #     # generate next question
#         #     self.current_question = generate_question(self.role, self.level)
#         #     self.send(text_data=json.dumps({
#         #         "type": "feedback",
#         #         "feedback": feedback,
#         #         "next_question": self.current_question
#         #     }))

#         elif msg_type == "answer":
#             user_answer = data.get("answer")
            
#             # 1. Evaluate the OLD question first
#             feedback = evaluate_answer(self.current_question, user_answer)
            
#             # 2. THEN generate the NEW question
#             self.current_question = generate_question(self.role, self.level)
            
#             self.send(text_data=json.dumps({
#                 "type": "feedback",
#                 "feedback": feedback,
#                 "next_question": self.current_question
#             }))

#     def disconnect(self, close_code):
#         print("Disconnected:", close_code)

import json
import time
from channels.generic.websocket import WebsocketConsumer
from .services.ai_service import generate_question, evaluate_answer

MAX_MESSAGE_SIZE = 2000        # max incoming payload size
MIN_MESSAGE_INTERVAL = 1       # seconds between messages
MAX_MESSAGES_PER_MIN = 20      # spam protection


class InterviewConsumer(WebsocketConsumer):
    def connect(self):
        user = self.scope["user"]

        if user.is_anonymous:
            self.close()
            return

        self.accept()

        # session state
        self.role = None
        self.level = None
        self.current_question = None

        # rate limiting state
        self.last_message_time = 0
        self.message_count = 0
        self.window_start = time.time()

    # -------------------------
    # 🔐 Helper: Validate input
    # -------------------------
    def clean_text(self, text, max_len=1000):
        if not text:
            return ""
        text = str(text).strip()

        if len(text) > max_len:
            raise ValueError("Input too long")

        return text

    # -------------------------
    # 🔐 Helper: Rate limiting
    # -------------------------
    def is_rate_limited(self):
        current_time = time.time()

        # 1. Cooldown check
        if current_time - self.last_message_time < MIN_MESSAGE_INTERVAL:
            return True

        self.last_message_time = current_time

        # 2. Per-minute limit
        if current_time - self.window_start > 60:
            self.window_start = current_time
            self.message_count = 0

        self.message_count += 1

        if self.message_count > MAX_MESSAGES_PER_MIN:
            return True

        return False

    # -------------------------
    # 📩 Receive messages
    # -------------------------
    def receive(self, text_data):
        try:
            # 🚫 Payload size check
            if len(text_data) > MAX_MESSAGE_SIZE:
                self.close()
                return

            # 🚫 Rate limit check
            if self.is_rate_limited():
                self.send(text_data=json.dumps({
                    "type": "error",
                    "message": "Too many requests. Slow down."
                }))
                return

            data = json.loads(text_data)
            msg_type = data.get("type")

            # -------------------------
            # ▶️ START INTERVIEW
            # -------------------------
            if msg_type == "start":
                self.role = self.clean_text(data.get("role"), 100)
                self.level = self.clean_text(data.get("level"), 50)

                if not self.role or not self.level:
                    self.send(json.dumps({
                        "type": "error",
                        "message": "Invalid role or level"
                    }))
                    return

                self.current_question = generate_question(self.role, self.level)

                self.send(text_data=json.dumps({
                    "type": "question",
                    "question": self.current_question
                }))

            # -------------------------
            # 🧠 ANSWER HANDLING
            # -------------------------
            elif msg_type == "answer":
                if not self.current_question:
                    self.send(json.dumps({
                        "type": "error",
                        "message": "No active question"
                    }))
                    return

                user_answer = self.clean_text(data.get("answer"), 1000)

                if not user_answer:
                    self.send(json.dumps({
                        "type": "error",
                        "message": "Empty answer"
                    }))
                    return

                # 1. Evaluate current question
                feedback = evaluate_answer(self.current_question, user_answer)

                # 2. Generate next question
                self.current_question = generate_question(self.role, self.level)

                self.send(text_data=json.dumps({
                    "type": "feedback",
                    "feedback": feedback,
                    "next_question": self.current_question
                }))

            else:
                self.send(json.dumps({
                    "type": "error",
                    "message": "Invalid message type"
                }))

        except Exception:
            # ❌ Don't leak internal errors
            self.send(json.dumps({
                "type": "error",
                "message": "Something went wrong"
            }))

    def disconnect(self, close_code):
        # Optional: logging instead of print
        pass