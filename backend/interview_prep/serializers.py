from rest_framework import serializers
from .models import Role, Topic, Todo


class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model=Role
        fields="__all__"

class TopicSerializer(serializers.ModelSerializer):
    class Meta:
        model=Topic
        fields="__all__"

class TodoSerializer(serializers.ModelSerializer):
    class Meta:
        model=Todo
        fields="__all__"