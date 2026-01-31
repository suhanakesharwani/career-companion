from django.shortcuts import render,redirect
from common.utils import clean_text
from django.contrib.auth.decorators import login_required
# Create your views here.



@login_required
def upload_jd(request):
    if request.method=="POST":
        raw_text=request.te
        
        cleaned=clean_text(raw_text)


        return redirect("dashboard")
    
    return render(request,"resume/upload.html")




