"""Lightweight IP geolocation lookup.

Uses the free ip-api.com batch endpoint (no API key required for
non-commercial, low-volume use). Falls back to unknown values when the
lookup fails, the IP is private/local, or the service is unreachable —
click tracking should never fail just because geo lookup did.
"""

import ipaddress

import requests

PRIVATE_IP_RESULT = {"country": "Local", "city": "Local"}
UNKNOWN_RESULT = {"country": "Unknown", "city": "Unknown"}

_REQUEST_TIMEOUT_SECONDS = 2


def is_private_ip(ip_address: str) -> bool:
    try:
        return ipaddress.ip_address(ip_address).is_private
    except ValueError:
        return True


def lookup_geo(ip_address: str | None) -> dict:
    if not ip_address or is_private_ip(ip_address):
        return dict(PRIVATE_IP_RESULT)

    try:
        response = requests.get(
            f"http://ip-api.com/json/{ip_address}",
            params={"fields": "status,country,city"},
            timeout=_REQUEST_TIMEOUT_SECONDS,
        )
        data = response.json()
        if data.get("status") == "success":
            return {
                "country": data.get("country") or "Unknown",
                "city": data.get("city") or "Unknown",
            }
    except (requests.RequestException, ValueError):
        pass

    return dict(UNKNOWN_RESULT)
