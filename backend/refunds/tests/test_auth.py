from rest_framework import status
from ..tests.base import ApiBaseTestCase


class AuthTests(ApiBaseTestCase):
    def test_login_admin_success(self):
        resp = self.obtain_tokens("admin1", "admin1")
        self.assertEqual(resp.status_code, 200)
        self.assertIn("access", resp.data)
        self.assertIn("refresh", resp.data)

    def test_login_user_success(self):
        resp = self.obtain_tokens("user1", "user1")
        self.assertEqual(resp.status_code, 200)
        self.assertIn("access", resp.data)
        self.assertIn("refresh", resp.data)

    def test_login_wrong_password(self):
        resp = self.obtain_tokens("user1", "123")
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_login_wrong_username(self):
        resp = self.obtain_tokens("123", "user1")
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_logout_invalidates_refresh(self):
        access, refresh = self.auth_as("user1", "user1")

        out = self.logout(access, refresh)
        self.assertEqual(out.status_code, status.HTTP_204_NO_CONTENT)

        self.clear_auth()
        resp = self.client.post(
            "/api/v1/auth/token/refresh/",
            {"refresh": refresh},
            format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)
