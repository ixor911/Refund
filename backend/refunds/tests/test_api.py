from django.core.cache import cache
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from unittest.mock import patch

from ..models import RefundRequest, RefundStatusHistory


User = get_user_model()


class RefundApiTests(APITestCase):
    # def setUp(self):
    #     cache.clear()
    #     self.admin = User.objects.create_user(username="admin1", password="admin1", is_staff=True)
    #     self.user1 = User.objects.create_user(username="user1", password="user1")
    #     self.user2 = User.objects.create_user(username="user2", password="user2")

    def auth(self, username, password):
        resp = self.client.post(
            "/api/v1/auth/token/",
            {"username": username, "password": password},
            format="json",
        )
        self.assertEqual(resp.status_code, 200)
        return resp.data["access"]

    @patch("refunds.services.iban_validation_service.requests.get")
    def test_invalid_iban_returns_400(self, mock_get):
        mock_get.return_value.status_code = 200
        mock_get.return_value.json.return_value = {"valid": False}
        mock_get.return_value.raise_for_status.return_value = None

        access = self.auth("user1", "user1")
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")

        resp = self.client.post(
            "/api/v1/refunds/",
            {
                "iban": "INVALID",
                "country": "PL",
                "items": [{"sku": "S1", "name": "X", "qty": 1, "price": "1.00"}],
            },
            format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    @patch("refunds.services.iban_validation_service.requests.get")
    def test_external_iban_api_failure_returns_503(self, mock_get):
        import requests
        mock_get.side_effect = requests.RequestException("boom")

        access = self.auth("user1", "user1")
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")

        resp = self.client.post(
            "/api/v1/refunds/",
            {
                "iban": "DE89370400440532013000",
                "country": "PL",
                "items": [{"sku": "S1", "name": "X", "qty": 1, "price": "1.00"}],
            },
            format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_503_SERVICE_UNAVAILABLE)

    @patch("refunds.services.iban_validation_service.requests.get")
    def test_external_iban_api_failure_returns_503(self, mock_get):
        import requests
        mock_get.side_effect = requests.RequestException("boom")

        access = self.auth("user1", "user1")
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")

        resp = self.client.post(
            "/api/v1/refunds/",
            {
                "iban": "DE89370400440532013000",
                "country": "PL",
                "items": [{"sku": "S1", "name": "X", "qty": 1, "price": "1.00"}],
            },
            format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_503_SERVICE_UNAVAILABLE)

    @patch("refunds.services.iban_validation_service.requests.get")
    def test_user_cannot_access_foreign_refund(self, mock_get):
        mock_get.return_value.status_code = 200
        mock_get.return_value.json.return_value = {"valid": True}
        mock_get.return_value.raise_for_status.return_value = None

        access2 = self.auth("user2", "user2")
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access2}")

        create = self.client.post(
            "/api/v1/refunds/",
            {
                "iban": "DE89370400440532013000",
                "country": "PL",
                "items": [{"sku": "S1", "name": "X", "qty": 1, "price": "1.00"}],
            },
            format="json",
        )
        self.assertEqual(create.status_code, 201)
        refund_id = create.data["id"]

        access1 = self.auth("user1", "user1")
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access1}")

        detail = self.client.get(f"/api/v1/refunds/{refund_id}/")
        self.assertEqual(detail.status_code, 404)

    @patch("refunds.services.iban_validation_service.requests.get")
    def test_admin_updates_status_creates_history(self, mock_get):
        mock_get.return_value.status_code = 200
        mock_get.return_value.json.return_value = {"valid": True}
        mock_get.return_value.raise_for_status.return_value = None

        access_user = self.auth("user1", "user1")
        print(access_user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access_user}")

        create = self.client.post(
            "/api/v1/refunds/",
            {
                "iban": "DE89370400440532013000",
                "country": "PL",
                "items": [{"sku": "S1", "name": "X", "qty": 1, "price": "1.00"}],
            },
            format="json",
        )
        self.assertEqual(create.status_code, 201)
        refund_id = create.data["id"]

        access_admin = self.auth("admin1", "admin1")
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access_admin}")

        patch_resp = self.client.patch(
            f"/api/v1/refunds/{refund_id}/status/",
            {"to_status": "approved"},
            format="json",
        )
        self.assertEqual(patch_resp.status_code, 200)

        self.assertTrue(
            RefundStatusHistory.objects.filter(
                refund_request_id=refund_id,
                from_status="pending",
                to_status="approved",
                changed_by=self.admin,
            ).exists()
        )
