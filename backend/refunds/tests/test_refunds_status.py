from unittest.mock import patch

from rest_framework import status
from ..models import RefundStatusHistory
from .base import ApiBaseTestCase


VALID_IBAN = "PL61109010140000071219812874"


def _mock_iban_valid(mock_get):
    mock_get.return_value.status_code = 200
    mock_get.return_value.json.return_value = {"valid": True}
    mock_get.return_value.raise_for_status.return_value = None


class RefundStatusTests(ApiBaseTestCase):
    @patch("refunds.services.iban_validation_service.requests.get")
    def test_patch_status_admin_success(self, mock_get):
        _mock_iban_valid(mock_get)

        self.auth_as("user1", "user1")
        create = self.client.post(
            "/api/v1/refunds/",
            {"iban": VALID_IBAN, "country": "PL", "items": [{"sku": "S1", "name": "X", "qty": 1}]},
            format="json",
        )
        refund_id = create.data["id"]

        self.clear_auth()
        access_admin, _ = self.auth_as("admin1", "admin1")
        resp = self.client.patch(
            f"/api/v1/refunds/{refund_id}/status/",
            {"to_status": "approved"},
            format="json",
        )
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.data["status"], "approved")
        self.assertTrue(
            RefundStatusHistory.objects.filter(
                refund_request_id=refund_id,
                from_status="pending",
                to_status="approved",
                changed_by=self.admin,
            ).exists()
        )

    @patch("refunds.services.iban_validation_service.requests.get")
    def test_patch_status_user_forbidden(self, mock_get):
        _mock_iban_valid(mock_get)

        self.auth_as("user1", "user1")
        create = self.client.post(
            "/api/v1/refunds/",
            {"iban": VALID_IBAN, "country": "PL", "items": [{"sku": "S1", "name": "X", "qty": 1}]},
            format="json",
        )
        refund_id = create.data["id"]

        resp = self.client.patch(
            f"/api/v1/refunds/{refund_id}/status/",
            {"to_status": "approved"},
            format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)

    def test_patch_status_without_auth_returns_401(self):
        self.clear_auth()
        resp = self.client.patch(
            "/api/v1/refunds/1/status/",
            {"to_status": "approved"},
            format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)

    @patch("refunds.services.iban_validation_service.requests.get")
    def test_admin_cannot_patch_after_logout(self, mock_get):
        _mock_iban_valid(mock_get)

        self.auth_as("user1", "user1")
        create = self.client.post(
            "/api/v1/refunds/",
            {"iban": VALID_IBAN, "country": "PL", "items": [{"sku": "S1", "name": "X", "qty": 1}]},
            format="json",
        )
        refund_id = create.data["id"]

        self.clear_auth()
        access, refresh = self.auth_as("admin", "adminpass")
        out = self.logout(access, refresh)
        self.assertEqual(out.status_code, status.HTTP_204_NO_CONTENT)

        self.clear_auth()

        resp = self.client.patch(
            f"/api/v1/refunds/{refund_id}/status/",
            {"to_status": "approved"},
            format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)

    @patch("refunds.services.iban_validation_service.requests.get")
    def test_user_cannot_list_after_logout(self, mock_get):
        _mock_iban_valid(mock_get)

        access, refresh = self.auth_as("user1", "user1")
        out = self.logout(access, refresh)
        self.assertEqual(out.status_code, status.HTTP_204_NO_CONTENT)

        self.clear_auth()

        resp = self.client.get("/api/v1/refunds/")
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)
