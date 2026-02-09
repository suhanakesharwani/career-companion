
import os
import re
import pdfplumber
import docx

def extract_text_from_resume(file_path):

    extension=os.path.splitext(file_path)[1].lower()

    if extension==".pdf":
        return extract_text_from_pdf(file_path)
    elif extension in [".docx",".doc"]:
        return extract_text_from_doc(file_path) 
    return ""
    

def extract_text_from_pdf(file_path):
    text=""

    with pdfplumber.open(file_path) as pdf:
        for page in pdf.pages:
            page_text=page.extract_text()

            if page_text:
                text+=page_text
    return text.strip()

def extract_text_from_doc(file_path):
    document=docx.Document(file_path)
    paragraphs=[para.text for para in document.paragraphs]
    return "\n".join(paragraphs).strip()


    
