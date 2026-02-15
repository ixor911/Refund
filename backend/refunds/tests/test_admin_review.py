from rest_framework import status
from . import ApiBaseTestCase


class RefundAdminStatusTests(ApiBaseTestCase):
    def test_admin_valid_status_flow(self):
        self.auth_as_user_1()
        create = self.create_refund()
        self.assertEqual(create.status_code, status.HTTP_201_CREATED)
        refund_id = create.data["id"]

        self.clear_auth()
        self.auth_as_admin_1()


        step1 = self.client.patch(
            f"/api/v1/refunds/{refund_id}/status/",
            {"to_status": "in_review"},
            format="json",
        )
        self.assertEqual(step1.status_code, status.HTTP_200_OK)
        self.assertEqual(step1.data["status"], "in_review")


        step2 = self.client.patch(
            f"/api/v1/refunds/{refund_id}/status/",
            {"to_status": "approved"},
            format="json",
        )
        self.assertEqual(step2.status_code, status.HTTP_200_OK)
        self.assertEqual(step2.data["status"], "approved")


    def test_admin_invalid_transitions(self):
        self.auth_as_user_1()
        create = self.create_refund()
        refund_id = create.data["id"]

        self.clear_auth()
        self.auth_as_admin_1()


        invalid1 = self.client.patch(
            f"/api/v1/refunds/{refund_id}/status/",
            {"to_status": "approved"},
            format="json",
        )
        self.assertEqual(invalid1.status_code, status.HTTP_409_CONFLICT)


        step1 = self.client.patch(
            f"/api/v1/refunds/{refund_id}/status/",
            {"to_status": "in_review"},
            format="json",
        )
        self.assertEqual(step1.status_code, status.HTTP_200_OK)


        step2 = self.client.patch(
            f"/api/v1/refunds/{refund_id}/status/",
            {"to_status": "approved"},
            format="json",
        )
        self.assertEqual(step2.status_code, status.HTTP_200_OK)


        invalid2 = self.client.patch(
            f"/api/v1/refunds/{refund_id}/status/",
            {"to_status": "rejected"},
            format="json",
        )
        self.assertEqual(invalid2.status_code, status.HTTP_409_CONFLICT)


    def test_admin_assignment_visible_in_detail(self):
        self.auth_as_user_1()
        create = self.create_refund()
        refund_id = create.data["id"]

        self.clear_auth()
        self.auth_as_admin_1()


        step = self.client.patch(
            f"/api/v1/refunds/{refund_id}/status/",
            {"to_status": "in_review"},
            format="json",
        )
        self.assertEqual(step.status_code, status.HTTP_200_OK)


        detail = self.client.get(f"/api/v1/refunds/{refund_id}/")
        self.assertEqual(detail.status_code, status.HTTP_200_OK)

        self.assertIn("assigned_admin", detail.data)
        self.assertIn("assigned_at", detail.data)

        self.assertIsNotNone(detail.data["assigned_admin"])
        self.assertEqual(
            detail.data["assigned_admin"]["username"],
            "admin1"
        )


    def test_second_admin_cannot_modify_taken_refund(self):
        self.auth_as_user_1()
        create = self.create_refund()
        refund_id = create.data["id"]


        self.clear_auth()
        self.auth_as_admin_1()

        step = self.client.patch(
            f"/api/v1/refunds/{refund_id}/status/",
            {"to_status": "in_review"},
            format="json",
        )
        self.assertEqual(step.status_code, status.HTTP_200_OK)


        self.clear_auth()
        self.auth_as_admin_2()

        forbidden = self.client.patch(
            f"/api/v1/refunds/{refund_id}/status/",
            {"to_status": "approved"},
            format="json",
        )

        self.assertEqual(forbidden.status_code, status.HTTP_409_CONFLICT)
