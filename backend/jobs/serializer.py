from rest_framework import serializers
from .models import JobApplication


class JobApplicationSerializer(serializers.ModelSerializer):

    deadline = serializers.DateField(required=False, allow_null=True)
    date_applied = serializers.DateField(required=False, allow_null=True)

    class Meta:
        model = JobApplication

        # ✅ Explicit fields only
        fields = [
            "id",
            "company",
            "role",
            "job_link",
            "status",
            "date_applied",
            "deadline",
            "notes",
            "created_at",
        ]

        read_only_fields = ["id", "created_at"]

    # -------------------
    # FIELD VALIDATION
    # -------------------
    def validate_company(self, value):
        if len(value.strip()) < 2:
            raise serializers.ValidationError(
                "Company name too short."
            )
        return value

    def validate_role(self, value):
        if len(value.strip()) < 2:
            raise serializers.ValidationError(
                "Role name too short."
            )
        return value

    # -------------------
    # OBJECT VALIDATION
    # -------------------
    def validate(self, data):
        deadline = data.get("deadline")
        date_applied = data.get("date_applied")

        if deadline and date_applied:
            if deadline < date_applied:
                raise serializers.ValidationError(
                    "Deadline cannot be before application date."
                )

        return data

    # -------------------
    # SECURE USER ASSIGNMENT
    # -------------------
    def create(self, validated_data):
        return JobApplication.objects.create(**validated_data)

    def update(self, instance, validated_data):
        # prevent user change
        validated_data.pop("user", None)
        return super().update(instance, validated_data)