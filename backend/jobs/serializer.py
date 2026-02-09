from rest_framework import serializers
from .models import JobApplication

class JobApplicationSerializer(serializers.ModelSerializer):
    deadline=serializers.DateField(
        required=False,
        allow_null=True
    )
    date_applied=serializers.DateField(
        required=False,
        allow_null=True
    )
    class Meta:
        model=JobApplication
        fields='__all__'
        read_only_fields=["user"]