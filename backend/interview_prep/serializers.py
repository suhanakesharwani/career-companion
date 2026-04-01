from rest_framework import serializers
from .models import Role, Topic, Todo


class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model=Role
        fields=["id", "name", "description"]

class TopicSerializer(serializers.ModelSerializer):
    class Meta:
        model=Topic
        fields=["id", "name", "category", "role"]

class TodoSerializer(serializers.ModelSerializer):
    class Meta:
        model=Todo
        fields=["id", "title", "order_index", "topic"]