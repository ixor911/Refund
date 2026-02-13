import logging
from dataclasses import dataclass

import requests
from django.core.cache import cache

logger = logging.getLogger(__name__)


@dataclass(frozen=True)
class ExternalIbanServiceError(Exception):
    message: str = "IBAN validation service unavailable"


IBAN_CACHE_TTL_SECONDS = 24 * 60 * 60  # 24h
IBAN_API_TIMEOUT_SECONDS = 5
IBAN_API_URL_TEMPLATE = "https://matavi.eu/iban/validate/{iban}"


def _cache_key(iban: str) -> str:
    return f"iban_validation:v1:{iban}"


def validate_iban_or_raise(iban: str) -> None:
    iban = (iban or "").strip().replace(" ", "")
    if not iban:
        raise ValueError("IBAN is required")

    key = _cache_key(iban)
    cached = cache.get(key)
    if cached is not None:
        if cached is True:
            return
        raise ValueError("IBAN is invalid")

    cache.set(key, True, 1)
    return # Iban service unavailable, DELETE when deploy

    url = IBAN_API_URL_TEMPLATE.format(iban=iban)

    try:
        resp = requests.get(url, timeout=IBAN_API_TIMEOUT_SECONDS)
        resp.raise_for_status()
        data = resp.json()
    except (requests.RequestException, ValueError) as e:
        logger.error("External IBAN API failure: %s", str(e), exc_info=True)
        raise ExternalIbanServiceError()

    is_valid = bool(data.get("valid"))
    cache.set(key, is_valid, IBAN_CACHE_TTL_SECONDS)

    if not is_valid:
        raise ValueError("IBAN is invalid")
