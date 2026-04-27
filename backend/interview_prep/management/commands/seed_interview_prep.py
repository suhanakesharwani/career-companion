from django.core.management.base import BaseCommand
from interview_prep.models import Role, Topic, Todo

class Command(BaseCommand):
    help = "Seed interview prep data"

    def handle(self, *args, **kwargs):

        # -------------------
        # ROLES
        # -------------------
        roles = {
            "Software Engineer": "DSA + system design + backend/frontend",
            "Data Scientist": "ML, stats, Python, SQL",
            "Frontend Developer": "React, JS, UI systems",
        }

        role_objs = {}

        for name, desc in roles.items():
            role, _ = Role.objects.get_or_create(
                name=name,
                defaults={"description": desc}
            )
            role_objs[name] = role

        # -------------------
        # TOPICS + TODOS
        # -------------------
        data = {
            "Software Engineer": {
                "Arrays": ["Two Sum", "Kadane Algorithm", "Sliding Window"],
                "Graphs": ["BFS", "DFS", "Dijkstra"],
            },
            "Data Scientist": {
                "Machine Learning": ["Linear Regression", "Logistic Regression"],
                "Python": ["NumPy", "Pandas basics"],
            },
            "Frontend Developer": {
                "React": ["Components", "Hooks", "State management"],
            }
        }

        for role_name, topics in data.items():
            role = role_objs[role_name]

            for topic_name, todos in topics.items():
                topic, _ = Topic.objects.get_or_create(
                    role=role,
                    name=topic_name,
                    defaults={"category": topic_name}
                )

                for i, todo_title in enumerate(todos):
                    Todo.objects.get_or_create(
                        topic=topic,
                        title=todo_title,
                        defaults={"order_index": i}
                    )

        self.stdout.write(self.style.SUCCESS("Seed completed successfully"))