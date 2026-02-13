from django.conf import settings
from django.db import models


class RefundStatus(models.TextChoices):
    PENDING = "pending", "Pending"
    APPROVED = "approved", "Approved"
    REJECTED = "rejected", "Rejected"
    IN_REVIEW = "in_review", "In Review"


class RefundRequest(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="refund_requests",
        db_index=True,
    )

    iban = models.CharField(max_length=34)
    country = models.CharField(max_length=2)

    status = models.CharField(
        max_length=32,
        choices=RefundStatus.choices,
        default=RefundStatus.PENDING,
        db_index=True,
    )

    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    assigned_admin = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="assigned_refund_requests",
    )
    assigned_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        indexes = [
            models.Index(fields=["status"]),
            models.Index(fields=["created_at"]),
            models.Index(fields=["user", "created_at"]),
        ]
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"RefundRequest(id={self.id}, user_id={self.user_id}, status={self.status})"
