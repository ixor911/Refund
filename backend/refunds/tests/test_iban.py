from rest_framework import status
from . import ApiBaseTestCase


class IbanValidationTests(ApiBaseTestCase):
    def test_create_refund_with_empty_iban(self):
        self.auth_as_user_1()

        payload = self.refund_payload
        payload["iban"] = ""

        resp = self.create_refund(payload=payload)

        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("iban", resp.data)


    def test_create_refund_with_invalid_iban(self):
        self.auth_as_user_1()

        payload = self.refund_payload
        payload["iban"] = "123"

        resp = self.create_refund(payload=payload)

        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("iban", resp.data)
