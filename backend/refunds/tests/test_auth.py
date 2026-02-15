# refunds/tests/test_auth.py

from rest_framework import status
from . import ApiBaseTestCase


class AuthTests(ApiBaseTestCase):
    def test_login_admin_success(self):
        resp = self.obtain_tokens("admin1", "admin1")
        self.assertEqual(resp.status_code, status.HTTP_200_OK, getattr(resp, "data", None))
        self.assertIn("access", resp.data)
        self.assertIn("refresh", resp.data)

    def test_login_user_success(self):
        resp = self.obtain_tokens("user1", "user1")
        self.assertEqual(resp.status_code, status.HTTP_200_OK, getattr(resp, "data", None))
        self.assertIn("access", resp.data)
        self.assertIn("refresh", resp.data)

    def test_login_wrong_password(self):
        resp = self.obtain_tokens("user1", "error")
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_login_wrong_username(self):
        resp = self.obtain_tokens("error", "user1")
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_refresh_token_success(self):
        access, refresh = self.auth_as_user_1()
        self.clear_auth()

        resp = self.client.post(
            "/api/v1/auth/token/refresh/",
            {"refresh": refresh},
            format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_200_OK, getattr(resp, "data", None))
        self.assertIn("access", resp.data)
        self.assertTrue(isinstance(resp.data["access"], str) and len(resp.data["access"]) > 10)

    def test_logout_success_and_refresh_invalidated(self):
        access, refresh = self.auth_as_user_1()

        out = self.logout(access, refresh)
        self.assertEqual(out.status_code, status.HTTP_204_NO_CONTENT)

        self.clear_auth()
        resp = self.client.post(
            "/api/v1/auth/token/refresh/",
            {"refresh": refresh},
            format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)
