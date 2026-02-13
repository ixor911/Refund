from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import RefundStatusUpdateView, RefundViewSet, IbanValidateView



router = DefaultRouter()
router.register(r"refunds", RefundViewSet, basename="refunds")

urlpatterns = [
    path("iban/validate/", IbanValidateView.as_view(), name="iban-validate"),
    path("refunds/<int:id>/status/", RefundStatusUpdateView.as_view(), name="refund-status"),
]

urlpatterns += router.urls