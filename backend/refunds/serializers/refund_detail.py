from rest_framework import serializers
from ..models import RefundRequest, RefundRequestItem, RefundStatusHistory


class RefundRequestItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = RefundRequestItem
        fields = ("id", "sku", "name", "qty", "price")


class RefundStatusHistorySerializer(serializers.ModelSerializer):
    changed_by = serializers.SerializerMethodField()

    class Meta:
        model = RefundStatusHistory
        fields = ("id", "changed_by", "from_status", "to_status", "changed_at")

    def get_changed_by(self, obj):
        return {"id": obj.changed_by_id, "username": getattr(obj.changed_by, "username", None)}


class RefundDetailSerializer(serializers.ModelSerializer):
    assigned_admin = serializers.SerializerMethodField()
    items = RefundRequestItemSerializer(many=True, read_only=True)
    status_history = RefundStatusHistorySerializer(many=True, read_only=True)

    class Meta:
        model = RefundRequest
        fields = (
            "id",
            "iban",
            "country",
            "status",
            "created_at",
            "updated_at",
            "items",
            "assigned_admin",
            "assigned_at",
            "status_history",
        )

    def get_assigned_admin(self, obj):
        if not obj.assigned_admin_id:
            return None
        u = obj.assigned_admin
        return {"id": u.id, "username": getattr(u, "username", None)}
