import logging
import json
import sys
import contextvars
from datetime import datetime, timezone
from typing import Any, Dict

# Context variable to hold the current request ID across async tasks
request_id_ctx: contextvars.ContextVar[str | None] = contextvars.ContextVar("request_id_ctx", default=None)

SENSITIVE_KEYS = {
    "password", "secret", "token", "authorization", "x-ai-secret",
    "api_key", "access_key", "secret_key", "better_auth_secret", "cookie"
}


def mask_sensitive_data(data: Any) -> Any:
    """Recursively mask sensitive values in dictionaries."""
    if isinstance(data, dict):
        masked = {}
        for k, v in data.items():
            if any(sensitive in k.lower() for sensitive in SENSITIVE_KEYS):
                masked[k] = "******"
            elif isinstance(v, (dict, list)):
                masked[k] = mask_sensitive_data(v)
            else:
                masked[k] = v
        return masked
    elif isinstance(data, list):
        return [mask_sensitive_data(item) for item in data]
    return data


class StructuredJsonFormatter(logging.Formatter):
    """Formats log records as structured JSON without exposing secrets."""

    def format(self, record: logging.LogRecord) -> str:
        current_req_id = getattr(record, "request_id", None) or request_id_ctx.get()

        log_data: Dict[str, Any] = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level": record.levelname,
            "message": record.getMessage(),
            "name": record.name,
            "request_id": current_req_id,
        }

        # Include structured attributes if present on record
        for attr in ("endpoint", "status_code", "processing_time_ms", "error_code", "method"):
            if hasattr(record, attr):
                log_data[attr] = getattr(record, attr)

        # Include extra payload if present
        if hasattr(record, "payload") and isinstance(record.payload, (dict, list)):
            log_data["payload"] = mask_sensitive_data(record.payload)

        if record.exc_info and not record.exc_text:
            # Format exception if present for internal server logs (never exposed over HTTP)
            log_data["exception"] = self.formatException(record.exc_info)

        return json.dumps(log_data)


def setup_logger(name: str = "criminal-eye-ai") -> logging.Logger:
    """Configures and returns the application logger."""
    logger = logging.getLogger(name)
    logger.setLevel(logging.INFO)

    if not logger.handlers:
        handler = logging.StreamHandler(sys.stdout)
        handler.setFormatter(StructuredJsonFormatter())
        logger.addHandler(handler)

    logger.propagate = False
    return logger


logger = setup_logger()
