import secrets
import string

ALPHABET = string.ascii_letters + string.digits


def generate_short_code(length: int = 7) -> str:
    """Generate a random base62 short code."""
    return "".join(secrets.choice(ALPHABET) for _ in range(length))
