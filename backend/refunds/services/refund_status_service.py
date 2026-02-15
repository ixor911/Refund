from dataclasses import dataclass

from django.db import transaction
from django.utils import timezone

from ..models import RefundRequest, RefundStatusHistory, RefundStatus


@dataclass(frozen=True)
class StatusTransitionError(Exception):
    message: str


ALLOWED_TRANSITIONS = {
    RefundStatus.PENDING: {RefundStatus.IN_REVIEW},
    RefundStatus.IN_REVIEW: {RefundStatus.PENDING, RefundStatus.REJECTED, RefundStatus.APPROVED},
    RefundStatus.APPROVED: set(),
    RefundStatus.REJECTED: set(),
}


def update_refund_status(*, refund: RefundRequest, to_status: str, changed_by) -> RefundRequest:
    with transaction.atomic():
        refund_locked = RefundRequest.objects.select_for_update().get(pk=refund.pk)
        current_locked = refund_locked.status

        if refund_locked.assigned_admin_id and refund_locked.assigned_admin_id != changed_by.id:
            raise StatusTransitionError("refund is taken by another admin")
        if to_status not in ALLOWED_TRANSITIONS.get(current_locked, set()):
            raise StatusTransitionError("invalid status transition")

        if to_status in RefundStatus.IN_REVIEW:
            refund_locked.assigned_admin = changed_by
            refund_locked.assigned_at = timezone.now()
        elif to_status in RefundStatus.PENDING:
            refund_locked.assigned_admin = None
            refund_locked.assigned_at = None

        refund_locked.status = to_status
        refund_locked.save(update_fields=["status", "updated_at", "assigned_admin", "assigned_at"])

        RefundStatusHistory.objects.create(
            refund_request=refund_locked,
            changed_by=changed_by,
            from_status=current_locked,
            to_status=to_status,
            changed_at=timezone.now(),
        )

    return refund_locked
