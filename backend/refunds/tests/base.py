from django.contrib.auth import get_user_model
from django.core.cache import cache
from rest_framework.test import APITestCase

User = get_user_model()


class ApiBaseTestCase(APITestCase):
    def setUp(self):
        cache.clear()
        try:
            self.admin1 = User.objects.create_user(username="admin1", password="admin2", is_staff=True)
            self.admin2 = User.objects.create_user(username="admin1", password="admin2", is_staff=True)
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

    def clear_auth(self):
        self.client.credentials()

    def logout(self, access: str, refresh: str):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")
        return self.client.post(
            "/api/v1/auth/logout/",
            {"refresh": refresh},
            format="json",
        )
