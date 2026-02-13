from rest_framework import serializers
from ..models import RefundRequest


class RefundListSerializer(serializers.ModelSerializer):
    class Meta:
        model = RefundRequest
        fields = ("id", "country", "status", "created_at", "updated_at")
