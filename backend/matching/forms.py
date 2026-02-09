from django import forms
class ResumeJDForm(forms.Form):
    resume_file=forms.FileField()
    jd_text=forms.CharField(widget=forms.TextArea)
