from django.utils.dateparse import parse_datetime, parse_date
from rest_framework import mixins, viewsets
from rest_framework.permissions import IsAuthenticated

from ..models import RefundRequest
from ..serializers import RefundCreateSerializer, RefundListSerializer
from ..serializers import RefundDetailAdminSerializer, RefundDetailUserSerializer
from ..permissions import IsAdminOrOwner


class RefundViewSet(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet,
):
    permission_classes = [IsAuthenticated, IsAdminOrOwner]

    def get_queryset(self):
        qs = (
            RefundRequest.objects
            .select_related("user", "assigned_admin")
            .prefetch_related("items", "status_history__changed_by")
        )

        user = self.request.user
        if not user.is_staff:
            qs = qs.filter(user=user)


        params = self.request.query_params

        status = params.get("status")
        if status:
            qs = qs.filter(status=status)

        country = params.get("country")
        if country:
            qs = qs.filter(country=country.strip().upper())

        created_from = params.get("created_from")
        if created_from:
            dt = parse_datetime(created_from) or parse_date(created_from)
            if dt:
                qs = qs.filter(created_at__gte=dt)

        created_to = params.get("created_to")
        if created_to:
            dt = parse_datetime(created_to) or parse_date(created_to)
            if dt:
                qs = qs.filter(created_at__lte=dt)

        return qs

    def get_serializer_class(self):
        if self.action == "create":
            return RefundCreateSerializer

        if self.action == "retrieve":
            if self.request.user.is_staff:
                return RefundDetailAdminSerializer
            return RefundDetailUserSerializer

        return RefundListSerializer
