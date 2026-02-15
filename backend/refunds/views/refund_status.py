from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404

from ..models import RefundRequest
from ..permissions import IsAdmin
from ..serializers import RefundStatusUpdateSerializer, RefundDetailAdminSerializer
from ..services import update_refund_status, StatusTransitionError


class RefundStatusUpdateView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def patch(self, request, id: int):
        serializer = RefundStatusUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        refund = get_object_or_404(RefundRequest, pk=id)

        try:
            refund = update_refund_status(
                refund=refund,
                to_status=serializer.validated_data["to_status"],
                changed_by=request.user,
            )
        except StatusTransitionError as e:
            return Response({"detail": e.message}, status=status.HTTP_409_CONFLICT)

        return Response(RefundDetailAdminSerializer(refund).data, status=status.HTTP_200_OK)
