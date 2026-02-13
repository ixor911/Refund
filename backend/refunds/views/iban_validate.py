from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from ..serializers import IbanValidateSerializer
from ..services import validate_iban_or_raise, ExternalIbanServiceError


class IbanValidateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = IbanValidateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        iban = serializer.validated_data["iban"]

        # Service isn't working, DELETE when deploy
        return Response({"iban": iban, "valid": True}, status=status.HTTP_200_OK)

        try:
            validate_iban_or_raise(iban)
        except ExternalIbanServiceError:
            return Response(
                {"detail": "IBAN validation service unavailable"},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
        except ValueError as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response({"iban": iban, "valid": True}, status=status.HTTP_200_OK)
