from django.conf import settings
from django.db import models
from .refund_request import RefundRequest, RefundStatus


class RefundStatusHistory(models.Model):
    refund_request = models.ForeignKey(
        RefundRequest,
        on_delete=models.CASCADE,
        related_name="status_history",
    )
    changed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="refund_status_changes",
    )
    from_status = models.CharField(
        max_length=16,
        choices=RefundStatus.choices,
    )
    to_status = models.CharField(
        max_length=16,
        choices=RefundStatus.choices,
    )

    changed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=["refund_request", "changed_at"]),
        ]
        ordering = ["-changed_at"]

    def __str__(self) -> str:
        return f"History(id={self.id}, {self.from_status}->{self.to_status})"
