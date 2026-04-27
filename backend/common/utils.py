# common/utils.py

import re

# Curated tech skill keywords — expand this list as needed
KNOWN_SKILLS = {
    # Languages
    "python", "javascript", "typescript", "java", "c++", "c#", "c", "go", "rust",
    "ruby", "php", "swift", "kotlin", "scala", "r", "matlab", "bash", "shell",

    # Frontend
    "react", "reactjs", "react.js", "vue", "vuejs", "angular", "html", "css",
    "sass", "tailwind", "bootstrap", "next.js", "nextjs", "redux", "webpack",

    # Backend
    "node.js", "nodejs", "express", "django", "flask", "fastapi", "spring",
    "laravel", "rails", "graphql", "rest", "restful", "api",

    # Databases
    "sql", "mysql", "postgresql", "postgres", "mongodb", "redis", "sqlite",
    "firebase", "supabase", "dynamodb", "oracle", "elasticsearch",

    # DevOps / Cloud
    "aws", "azure", "gcp", "docker", "kubernetes", "ci/cd", "github actions",
    "jenkins", "terraform", "linux", "nginx", "git", "github", "gitlab",

    # ML / Data
    "machine learning", "deep learning", "nlp", "computer vision", "pandas",
    "numpy", "scikit-learn", "tensorflow", "pytorch", "keras", "opencv",
    "data analysis", "data science", "tableau", "power bi",

    # Stacks / Misc
    "mern", "mean", "full stack", "fullstack", "microservices", "agile",
    "scrum", "jira", "figma", "photoshop", "web design", "oop", "solid",
    "system design", "websockets", "oauth", "jwt",
}

def get_skills(text: str) -> list:
    """
    Extract known tech skills from cleaned text.
    Matches multi-word skills (e.g. 'machine learning') and single words.
    Returns a deduplicated list.
    """
    if not text:
        return []

    text_lower = text.lower()
    found = set()

    # Sort by length descending so multi-word skills match before their parts
    for skill in sorted(KNOWN_SKILLS, key=len, reverse=True):
        # Use word boundary matching to avoid partial matches
        pattern = r'\b' + re.escape(skill) + r'\b'
        if re.search(pattern, text_lower):
            found.add(skill)

    return list(found)


def clean_text(text: str) -> str:
    """
    Lowercase, remove special chars, normalize whitespace.
    """
    if not text:
        return ""
    text = text.lower()
    text = re.sub(r'[^\w\s\.\+\#]', ' ', text)  # keep . + # for c#, c++, node.js
    text = re.sub(r'\s+', ' ', text).strip()
    return text