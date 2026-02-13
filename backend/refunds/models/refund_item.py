from django.db import models
from .refund_request import RefundRequest


class RefundRequestItem(models.Model):
    refund_request = models.ForeignKey(
        RefundRequest,
        on_delete=models.CASCADE,
        related_name="items",
    )

    sku = models.CharField(max_length=64)
    name = models.CharField(max_length=255)
    qty = models.PositiveIntegerField()
    price = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)

    class Meta:
        indexes = [
            models.Index(fields=["refund_request"]),
            models.Index(fields=["sku"]),
        ]

    def __str__(self) -> str:
        return f"Item(id={self.id}, sku={self.sku}, qty={self.qty})"
