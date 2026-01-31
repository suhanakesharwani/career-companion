from django.shortcuts import render,redirect
from django.http import HttpResponse
from django.contrib.auth.decorators import login_required

from resumes.models import Resume
from jobs.models import JobDescription
from resumes.utils import extract_text_from_resume
from common.utils import clean_text,get_skills

from .utils import calculate_matching_result

# Create your views here.

# contains upload input and output operations only

@login_required
def upload_and_match(request):
    if request.method=="POST":

        resume_file=request.FILES["resume"]
        jd_text=request.POST.get("jd_text")

        resume=Resume.objects.create(
            user=request.user,
            file=resume_file
        )

        raw_text=extract_text_from_resume(resume.file.path)
        cleaned=clean_text(raw_text)
        resume_skills=get_skills(cleaned)

        resume.parsed_text=raw_text
        resume.cleaned_text=cleaned
        resume.skills=resume_skills


        # resume_skills=set(resume.skills)

        resume.save()

        #save jd

        cleaned_jd_text = clean_text(jd_text)
        jd_skills = get_skills(cleaned_jd_text)


        job=JobDescription.objects.create(
            user=request.user,
            jd_text=jd_text,
            cleaned_text=cleaned_jd_text,
            skills=jd_skills
        )

        matching_result=calculate_matching_result(set(jd_skills),set(resume_skills))

        print("RESUME SKILLS:", resume_skills)
        print("JD SKILLS:", jd_skills)
        print("MATCHING RESULT:", matching_result)


        
        return render(request,"matching/result.html",{
            "resume":resume,
            "job":job,
            "result":matching_result
        })
    
    return render(request,"matching/upload.html")





