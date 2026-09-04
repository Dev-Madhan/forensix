import secrets
from typing import Optional
from fastapi import Header, HTTPException, Security, status
from app.core.config import get_settings
from app.core.logging import logger
from app.utils.errors import UnauthorizedException

settings = get_settings()


async def verify_service_secret(
    x_ai_secret: Optional[str] = Header(None, alias="X-AI-Secret"),
    authorization: Optional[str] = Header(None),
) -> bool:
    """
    Validates server-to-server authentication secret between Next.js and FastAPI.
    Supports either 'X-AI-Secret: <secret>' or 'Authorization: Bearer <secret>'.
    Uses constant-time comparison to protect against timing attacks.
    """
    configured_secret = settings.AI_SERVICE_SECRET

    # If in production and secret is not configured, deny access immediately
    if settings.is_production and not configured_secret:
        logger.error("AI_SERVICE_SECRET must be configured in production environment.")
        raise UnauthorizedException("Service security configuration error.")

    # In development, if secret is explicitly configured, enforce it strictly
    if configured_secret:
        provided_secret: Optional[str] = None

        if x_ai_secret:
            provided_secret = x_ai_secret.strip()
        elif authorization and authorization.startswith("Bearer "):
            provided_secret = authorization.split("Bearer ", 1)[1].strip()

        if not provided_secret:
            raise UnauthorizedException("Missing AI service authentication secret.")

        # Constant-time comparison
        if not secrets.compare_digest(provided_secret, configured_secret):
            raise UnauthorizedException("Invalid AI service authentication secret.")

    return True
