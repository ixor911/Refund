from rest_framework import serializers
from ..models import RefundStatus


class RefundStatusUpdateSerializer(serializers.Serializer):
    to_status = serializers.ChoiceField(choices=RefundStatus.choices)

    def validate_to_status(self, value: str) -> str:
        return (value or "").strip().lower()
