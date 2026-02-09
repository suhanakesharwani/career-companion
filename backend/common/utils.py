import re
#cleaning is common to both texts 

def clean_text(text):
    if not text:
        return ""
    
    text=text.lower()
    text=re.sub(r'\n+','',text)
    text=re.sub(r'[^a-z0-9\s]','',text)
    text=re.sub(r'\s+',' ',text)

    return text.strip()


def get_skills(text):
    SKILL_SET = {
    # Programming & Core
    "python", "c", "c++", "data structures", "algorithms",

    # Backend & Web
    "django", "django rest framework", "flask",
    "rest apis", "authentication", "authorization",

    # Frontend
    "html", "css", "javascript", "react",
    "redux", "responsive design",

    # Databases
    "sql", "postgresql", "mysql", "sqlite",
    "database design", "orm",

    # Machine Learning
    "machine learning", "supervised learning", "unsupervised learning",
    "model evaluation", "feature engineering",

    # Deep Learning & NLP
    "nlp", "deep learning",
    "tensorflow", "pytorch",
    "transformers", "sentiment analysis",

    # Data & Visualization
    "numpy", "pandas", "matplotlib",
    "exploratory data analysis",

    # DevOps & Deployment
    "git", "github",
    "docker", "ci/cd",
    "render", "heroku", "cloud deployment",

    # Tools & Practices
    "linux basics", "virtual environments",
    "pipenv", "debugging", "api testing"
}

    found=set()

    for skill in SKILL_SET:
        if skill in text:
            found.add(skill)
    return list(found)
