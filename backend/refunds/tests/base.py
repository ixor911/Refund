from django.contrib.auth import get_user_model
from django.core.cache import cache
from rest_framework.test import APITestCase

User = get_user_model()


class ApiBaseTestCase(APITestCase):
    def setUp(self):
        cache.clear()
        try:
            self.admin1 = User.objects.create_user(username="admin1", password="admin1", is_staff=True)
            self.admin2 = User.objects.create_user(username="admin2", password="admin2", is_staff=True)
            self.user1 = User.objects.create_user(username="user1", password="user1")
            self.user2 = User.objects.create_user(username="user2", password="user2")
        except:
            pass

    def obtain_tokens(self, username: str, password: str):
        resp = self.client.post(
            "/api/v1/auth/token/",
            {"username": username, "password": password},
            format="json",
        )
        return resp

    def auth_as(self, username: str, password: str):
        resp = self.obtain_tokens(username, password)
        self.assertEqual(resp.status_code, 200, resp.data)
        access = resp.data["access"]
        refresh = resp.data["refresh"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")
        return access, refresh

    def auth_as_admin_1(self):
        return self.auth_as("admin1", "admin1")
    def auth_as_admin_2(self):
        return self.auth_as("admin2", "admin2")
    def auth_as_user_1(self):
        return self.auth_as("user1", "user1")
    def auth_as_user_2(self):
        return self.auth_as("user2", "user2")

    def clear_auth(self):
        self.client.credentials()

    def logout(self, access: str, refresh: str):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")
        return self.client.post(
            "/api/v1/auth/logout/",
            {"refresh": refresh},
            format="json",
        )

    def create_refund(self, payload:dict=None):
        return self.client.post(
            "/api/v1/refunds/",
            (payload or self.refund_payload),
            format="json",
        )

    @property
    def refund_payload(self):
        return {
            "iban": "PL61109010140000071219812874",
            "country": "PL",
            "items": [
                {
                    "sku": "SKU-1",
                    "name": "T-shirt",
                    "qty": 1,
                    "price": "19.99",
                },
                {
                    "sku": "SKU-2",
                    "name": "Shoes",
                    "qty": 2,
                    "price": "49.00",
                },
            ],
        }
