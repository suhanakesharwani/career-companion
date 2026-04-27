# common/utils.py
import re

KNOWN_SKILLS = {
    # Languages
    "python", "javascript", "typescript", "java", "c++", "c#", "c", "go",
    "rust", "ruby", "php", "swift", "kotlin", "scala", "r", "bash", "shell",

    # Frontend
    "react", "reactjs", "vue", "vuejs", "angular", "html", "css", "sass",
    "tailwind", "bootstrap", "next.js", "nextjs", "redux", "webpack", "vite",

    # Backend
    "node.js", "nodejs", "express", "django", "flask", "fastapi", "spring",
    "laravel", "graphql", "rest", "restful",

    # Databases
    "sql", "mysql", "postgresql", "postgres", "mongodb", "redis", "sqlite",
    "firebase", "dynamodb", "elasticsearch",

    # DevOps / Cloud
    "aws", "azure", "gcp", "docker", "kubernetes", "git", "github", "gitlab",
    "linux", "nginx", "ci/cd", "terraform", "jenkins",

    # ML / Data
    "machine learning", "deep learning", "nlp", "pandas", "numpy",
    "scikit-learn", "tensorflow", "pytorch", "data analysis", "data science",

    # Stacks / Concepts
    "mern", "mean", "full stack", "fullstack", "microservices", "agile",
    "scrum", "oop", "system design", "websockets", "jwt", "oauth",
    "web design", "figma", "photoshop",
}

def get_skills(text: str) -> list:
    if not text:
        return []

    text_lower = text.lower()
    found = set()

    # Sort longest first so "node.js" matches before "node"
    for skill in sorted(KNOWN_SKILLS, key=len, reverse=True):
        pattern = r'\b' + re.escape(skill) + r'\b'
        if re.search(pattern, text_lower):
            found.add(skill)

    return list(found)


def clean_text(text: str) -> str:
    if not text:
        return ""
    text = text.lower()
    # Keep . + # for c#, c++, node.js
    text = re.sub(r'[^\w\s\.\+\#]', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text