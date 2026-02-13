from unittest.mock import patch

from rest_framework import status
from ..models import RefundRequest
from ..tests.base import ApiBaseTestCase


VALID_IBAN = "DE89370400440532013000"


def _mock_iban_valid(mock_get):
    mock_get.return_value.status_code = 200
    mock_get.return_value.json.return_value = {"valid": True}
    mock_get.return_value.raise_for_status.return_value = None


class RefundCreateAndReadTests(ApiBaseTestCase):
    @patch("refunds.services.iban_validation_service.requests.get")
    def test_create_refund_success(self, mock_get):
        _mock_iban_valid(mock_get)

        self.auth_as("user1", "user1")
        resp = self.client.post(
            "/api/v1/refunds/",
            {
                "iban": VALID_IBAN,
                "country": "PL",
                "items": [{"sku": "S1", "name": "X", "qty": 1, "price": "1.00"}],
            },
            format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED, resp.data)
        self.assertEqual(resp.data["status"], "pending")

    @patch("refunds.services.iban_validation_service.requests.get")
    def test_create_refund_without_items_returns_400(self, mock_get):
        _mock_iban_valid(mock_get)

        self.auth_as("user1", "user1")
        resp = self.client.post(
            "/api/v1/refunds/",
            {"iban": VALID_IBAN, "country": "PL", "items": []},
            format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    @patch("refunds.services.iban_validation_service.requests.get")
    def test_create_refund_missing_fields_returns_400(self, mock_get):
        _mock_iban_valid(mock_get)

        self.auth_as("user1", "user1")
        resp = self.client.post(
            "/api/v1/refunds/",
            {"iban": VALID_IBAN},
            format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_refund_without_auth_returns_401(self):
        self.clear_auth()
        resp = self.client.post(
            "/api/v1/refunds/",
            {
                "iban": VALID_IBAN,
                "country": "PL",
                "items": [{"sku": "S1", "name": "X", "qty": 1, "price": "1.00"}],
            },
            format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)

    @patch("refunds.services.iban_validation_service.requests.get")
    def test_list_refunds_admin_sees_all(self, mock_get):
        _mock_iban_valid(mock_get)

        self.auth_as("user1", "user1")
        self.client.post(
            "/api/v1/refunds/",
            {"iban": VALID_IBAN, "country": "PL", "items": [{"sku": "S1", "name": "X", "qty": 1}]},
            format="json",
        )
        self.clear_auth()
        self.auth_as("user2", "user2")
        self.client.post(
            "/api/v1/refunds/",
            {"iban": VALID_IBAN, "country": "PL", "items": [{"sku": "S2", "name": "Y", "qty": 1}]},
            format="json",
        )

        self.clear_auth()
        self.auth_as("admin1", "admin1")
        resp = self.client.get("/api/v1/refunds/")
        self.assertEqual(resp.status_code, 200)
        self.assertGreaterEqual(len(resp.data), 2)

    @patch("refunds.services.iban_validation_service.requests.get")
    def test_list_refunds_user_sees_only_own(self, mock_get):
        _mock_iban_valid(mock_get)

        self.auth_as("user1", "user1")
        self.client.post(
            "/api/v1/refunds/",
            {"iban": VALID_IBAN, "country": "PL", "items": [{"sku": "S1", "name": "X", "qty": 1}]},
            format="json",
        )

        self.clear_auth()
        self.auth_as("user2", "user2")
        self.client.post(
            "/api/v1/refunds/",
            {"iban": VALID_IBAN, "country": "PL", "items": [{"sku": "S2", "name": "Y", "qty": 1}]},
            format="json",
        )

        self.clear_auth()
        self.auth_as("user1", "user1")
        resp = self.client.get("/api/v1/refunds/")
        self.assertEqual(resp.status_code, 200)
        for row in resp.data:
            rr = RefundRequest.objects.get(pk=row["id"])
            self.assertEqual(rr.user_id, self.user1.id)

    def test_list_refunds_without_auth_returns_401(self):
        self.clear_auth()
        resp = self.client.get("/api/v1/refunds/")
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)

    @patch("refunds.services.iban_validation_service.requests.get")
    def test_detail_refund_admin_can_view(self, mock_get):
        _mock_iban_valid(mock_get)

        self.auth_as("user1", "user1")
        create = self.client.post(
            "/api/v1/refunds/",
            {"iban": VALID_IBAN, "country": "PL", "items": [{"sku": "S1", "name": "X", "qty": 1}]},
            format="json",
        )
        refund_id = create.data["id"]

        self.clear_auth()
        self.auth_as("admin1", "admin1")
        detail = self.client.get(f"/api/v1/refunds/{refund_id}/")
        self.assertEqual(detail.status_code, 200)

    @patch("refunds.services.iban_validation_service.requests.get")
    def test_detail_refund_user_can_view_own(self, mock_get):
        _mock_iban_valid(mock_get)

        self.auth_as("user1", "user1")
        create = self.client.post(
            "/api/v1/refunds/",
            {"iban": VALID_IBAN, "country": "PL", "items": [{"sku": "S1", "name": "X", "qty": 1}]},
            format="json",
        )
        refund_id = create.data["id"]

        detail = self.client.get(f"/api/v1/refunds/{refund_id}/")
        self.assertEqual(detail.status_code, 200)

    @patch("refunds.services.iban_validation_service.requests.get")
    def test_detail_refund_user_cannot_view_foreign(self, mock_get):
        _mock_iban_valid(mock_get)

        self.auth_as("user2", "user2")
        create = self.client.post(
            "/api/v1/refunds/",
            {"iban": VALID_IBAN, "country": "PL", "items": [{"sku": "S2", "name": "Y", "qty": 1}]},
            format="json",
        )
        refund_id = create.data["id"]

        self.clear_auth()
        self.auth_as("user1", "user1")
        detail = self.client.get(f"/api/v1/refunds/{refund_id}/")
        self.assertEqual(detail.status_code, status.HTTP_404_NOT_FOUND)

    def test_detail_refund_without_auth_returns_401(self):
        self.clear_auth()
        detail = self.client.get("/api/v1/refunds/1/")
        self.assertEqual(detail.status_code, status.HTTP_401_UNAUTHORIZED)
