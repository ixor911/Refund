from rest_framework import serializers


class IbanValidateSerializer(serializers.Serializer):
    iban = serializers.CharField()