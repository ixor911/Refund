from rest_framework import status
from ..models import RefundRequest
from . import ApiBaseTestCase


class RefundReadCreateTests(ApiBaseTestCase):
    def test_user_create_and_see_own_refund(self):
        self.auth_as_user_1()

        create = self.create_refund()
        self.assertEqual(create.status_code, status.HTTP_201_CREATED)

        refund_id = create.data["id"]

        list_resp = self.client.get("/api/v1/refunds/")
        self.assertEqual(list_resp.status_code, status.HTTP_200_OK)
        self.assertEqual(len(list_resp.data), 1)


        detail = self.client.get(f"/api/v1/refunds/{refund_id}/")
        self.assertEqual(detail.status_code, status.HTTP_200_OK)
        self.assertEqual(detail.data["id"], refund_id)


    def test_admin_create_and_see_refund(self):
        self.auth_as_admin_1()

        create = self.create_refund()
        self.assertEqual(create.status_code, status.HTTP_201_CREATED)

        refund_id = create.data["id"]

        list_resp = self.client.get("/api/v1/refunds/")
        self.assertEqual(list_resp.status_code, status.HTTP_200_OK)
        self.assertEqual(len(list_resp.data), 1)


        detail = self.client.get(f"/api/v1/refunds/{refund_id}/")
        self.assertEqual(detail.status_code, status.HTTP_200_OK)
        self.assertEqual(detail.data["id"], refund_id)


    def test_two_users_isolation_and_admin_visibility(self):
        self.auth_as_user_1()
        r1 = self.create_refund()
        self.assertEqual(r1.status_code, status.HTTP_201_CREATED)
        id1 = r1.data["id"]

        self.clear_auth()

        self.auth_as_user_2()
        r2 = self.create_refund()
        self.assertEqual(r2.status_code, status.HTTP_201_CREATED)
        id2 = r2.data["id"]


        list_user2 = self.client.get("/api/v1/refunds/")
        self.assertEqual(len(list_user2.data), 1)
        self.assertEqual(list_user2.data[0]["id"], id2)


        detail_forbidden = self.client.get(f"/api/v1/refunds/{id1}/")
        self.assertEqual(detail_forbidden.status_code, status.HTTP_404_NOT_FOUND)

        self.clear_auth()

        self.auth_as_admin_1()
        list_admin = self.client.get("/api/v1/refunds/")
        self.assertEqual(list_admin.status_code, status.HTTP_200_OK)
        self.assertEqual(len(list_admin.data), 2)


    def test_user_cannot_see_history_admin_can(self):
        self.auth_as_user_1()
        create = self.create_refund()
        self.assertEqual(create.status_code, status.HTTP_201_CREATED)
        refund_id = create.data["id"]


        detail_user = self.client.get(f"/api/v1/refunds/{refund_id}/")
        self.assertEqual(detail_user.status_code, status.HTTP_200_OK)


        self.assertNotIn("status_history", detail_user.data)
        self.assertNotIn("assigned_admin", detail_user.data)
        self.assertNotIn("assigned_at", detail_user.data)

        self.clear_auth()

        self.auth_as_admin_1()
        detail_admin = self.client.get(f"/api/v1/refunds/{refund_id}/")
        self.assertEqual(detail_admin.status_code, status.HTTP_200_OK)


        self.assertIn("status_history", detail_admin.data)
        self.assertIn("assigned_admin", detail_admin.data)
        self.assertIn("assigned_at", detail_admin.data)
