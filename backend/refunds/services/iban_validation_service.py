import hashlib
from dataclasses import dataclass
import re
import requests
from django.core.cache import cache


IBAN_CACHE_TTL_SECONDS = 24 * 60 * 60  # 24h
IBAN_API_TIMEOUT_SECONDS = 5
IBAN_API_URL_TEMPLATE = "https://matavi.eu/iban/validate/{iban}"
IBAN_REGEX = re.compile(r"^[A-Z]{2}[0-9]{2}[A-Z0-9]{11,30}$")


@dataclass(frozen=True)
class ExternalIbanServiceError(Exception):
    message: str = "IBAN validation service unavailable"


def _cache_key_v2(iban: str) -> str:
    iban_clean = (iban or "").strip().replace(" ", "").upper().encode("utf-8")
    digest = hashlib.sha256(iban_clean).hexdigest()
    return f"iban_validation:v2:{digest}"

def _cache_key(iban: str) -> str:
    return f"iban_validation:v1:{iban}"


def validate_iban_or_raise(iban):
    return validate_iban_or_raise_fake(iban)


def validate_iban_or_raise_fake(iban):
    iban_clean = (iban or "").strip().replace(" ", "").upper()
    if not iban_clean:
        raise ValueError("IBAN is required")

    key = _cache_key_v2(iban_clean)
    cached = cache.get(key)
    if cached is not None:
        if cached is True:
            return
        raise ValueError("IBAN is invalid")

    is_valid = (15 <= len(iban_clean) <= 34) and bool(IBAN_REGEX.match(iban_clean))

    cache.set(key, is_valid, IBAN_CACHE_TTL_SECONDS)

    if not is_valid:
        raise ValueError("IBAN is invalid")


def validate_iban_or_raise_main(iban: str) -> None:
    iban = (iban or "").strip().replace(" ", "")
    if not iban:
        raise ValueError("IBAN is required")

    key = _cache_key(iban)
    cached = cache.get(key)
    if cached is not None:
        if cached is True:
            return
        raise ValueError("IBAN is invalid")

    url = IBAN_API_URL_TEMPLATE.format(iban=iban)

    try:
        resp = requests.get(url, timeout=IBAN_API_TIMEOUT_SECONDS)
        resp.raise_for_status()
        data = resp.json()
    except (requests.RequestException, ValueError) as e:
        raise ExternalIbanServiceError()

    is_valid = bool(data.get("valid"))
    cache.set(key, is_valid, IBAN_CACHE_TTL_SECONDS)

    if not is_valid:
        raise ValueError("IBAN is invalid")
