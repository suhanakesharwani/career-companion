# from django.shortcuts import render,redirect
# from django.http import HttpResponse
# from .models import Resume
# from django.contrib.auth.decorators import login_required
# from .utils import extract_text_from_resume
# from common.utils import clean_text
# # Create your views here.

# # contains upload input and output operations only

# @login_required
# def upload_resume(request):
#     if request.method=="POST":
#         resume_file=request.FILES["resume"]

#         resume=Resume.objects.create(
#             user=request.user,
#             file=resume_file
#         )

#         raw_text=extract_text_from_resume(file)
#         cleaned=clean_text(raw_text)

#         resume.parsed_text=raw_text
#         resume.cleaned_text=cleaned
        

#         resume.save()

#         return redirect("dashboard")
    
#     return render(request,"resume/upload.html")




