from dataclasses import dataclass

from rest_framework import serializers
from rest_framework.exceptions import APIException

from ..models import RefundRequest, RefundRequestItem
from ..services import validate_iban_or_raise, ExternalIbanServiceError



class ServiceUnavailable(APIException):
    status_code = 503
    default_detail = "IBAN validation service unavailable"
    default_code = "service_unavailable"


class RefundRequestItemCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = RefundRequestItem
        fields = ("sku", "name", "qty", "price")


class RefundCreateSerializer(serializers.ModelSerializer):
    items = RefundRequestItemCreateSerializer(many=True)

    class Meta:
        model = RefundRequest
        fields = ("id", "iban", "country", "items", "status", "created_at", "updated_at")
        read_only_fields = ("id", "status", "created_at", "updated_at")

    def validate_country(self, value: str) -> str:
        value = (value or "").strip().upper()
        if len(value) != 2:
            raise serializers.ValidationError("country must be 2-letter code (e.g. PL, UA)")
        return value

    def validate_iban(self, value: str) -> str:
        value = (value or "").strip().replace(" ", "")
        if not value:
            raise serializers.ValidationError("iban is required")
        if len(value) > 34:
            raise serializers.ValidationError("iban is too long")

        try:
            validate_iban_or_raise(value)
        except ExternalIbanServiceError:
            raise ServiceUnavailable()
        except ValueError as e:
            raise serializers.ValidationError(str(e))

        return value

    def validate_items(self, items):
        if not items:
            raise serializers.ValidationError("items must not be empty")
        return items

    def create(self, validated_data):
        request = self.context["request"]
        items_data = validated_data.pop("items")

        refund = RefundRequest.objects.create(
            user=request.user,
            **validated_data,
        )

        RefundRequestItem.objects.bulk_create(
            [RefundRequestItem(refund_request=refund, **item) for item in items_data]
        )
        return refund
