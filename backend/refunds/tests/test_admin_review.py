from unittest.mock import patch
from rest_framework import status
from .base import ApiBaseTestCase


VALID_IBAN = "PL61109010140000071219812874"


def _mock_iban_valid(mock_get):
    mock_get.return_value.status_code = 200
    mock_get.return_value.json.return_value = {"valid": True}
    mock_get.return_value.raise_for_status.return_value = None


class RefundStatusLockTests(ApiBaseTestCase):
    @patch("refunds.services.iban_validation_service.requests.get")
    def test_second_admin_cannot_update_taken_refund(self, mock_get):
        _mock_iban_valid(mock_get)

        self.auth_as("user1", "user1")
        create = self.client.post(
            "/api/v1/refunds/",
            {"iban": VALID_IBAN, "country": "PL", "items": [{"sku": "S1", "name": "X", "qty": 1}]},
            format="json",
        )
        refund_id = create.data["id"]

        self.clear_auth()
        self.auth_as("admin2", "admin2")
        r1 = self.client.patch(
            f"/api/v1/refunds/{refund_id}/status/",
            {"to_status": "in review"},
            format="json",
        )
        self.assertEqual(r1.status_code, 200)

        self.clear_auth()
        access2, _ = self.auth_as("admin2", "admin2")
        r2 = self.client.patch(
            f"/api/v1/refunds/{refund_id}/status/",
            {"to_status": "rejected"},
            format="json",
        )
        self.assertEqual(r2.status_code, status.HTTP_409_CONFLICT)
