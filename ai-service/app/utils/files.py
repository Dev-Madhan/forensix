import io
import re
from typing import Tuple
from PIL import Image
from app.core.config import get_settings
from app.utils.errors import (
    InvalidRequestException,
    UnsupportedFileException,
    FileTooLargeException,
)

settings = get_settings()

ALLOWED_MIME_TYPES = {
    "image/jpeg": [".jpg", ".jpeg"],
    "image/png": [".png"],
    "image/webp": [".webp"],
}

# Strict regex for storage references / object keys:
# e.g., "cases/case-123/evidence/abc/photo.png"
SAFE_STORAGE_KEY_REGEX = re.compile(r"^[a-zA-Z0-9_\-\.\/]+$")


def validate_storage_reference(storage_key: str) -> str:
    """
    Validates that a storage key / reference is safe and does not attempt
    path traversal (../), directory escapes, or protocol injection.
    """
    if not storage_key or not isinstance(storage_key, str):
        raise InvalidRequestException("Storage image reference is required.")

    cleaned = storage_key.strip()
    if not cleaned:
        raise InvalidRequestException("Storage image reference cannot be empty.")

    # Prevent path traversal
    if ".." in cleaned or "\\" in cleaned or "\0" in cleaned:
        raise InvalidRequestException("Invalid storage reference: Path traversal detected.")

    if cleaned.startswith("/"):
        raise InvalidRequestException("Invalid storage reference: Absolute path detected.")

    if not SAFE_STORAGE_KEY_REGEX.match(cleaned):
        raise InvalidRequestException("Invalid storage reference: Illegal characters detected.")

    return cleaned


def validate_image_bytes(
    content: bytes,
    content_type: str | None = None,
    max_size: int | None = None,
) -> Tuple[int, int, str]:
    """
    Validates image bytes for size, MIME type, and structural integrity using Pillow.
    Returns (width, height, format_name).
    """
    max_allowed = max_size or settings.MAX_IMAGE_SIZE_BYTES
    if len(content) > max_allowed:
        raise FileTooLargeException(
            f"Image size ({len(content)} bytes) exceeds the maximum allowed limit of {max_allowed} bytes."
        )

    if content_type and content_type.lower() not in ALLOWED_MIME_TYPES:
        raise UnsupportedFileException(
            f"Unsupported content type '{content_type}'. Allowed types: {', '.join(ALLOWED_MIME_TYPES.keys())}"
        )

    try:
        # Pillow verify checks file headers and block structure without loading all raster pixels
        image_stream = io.BytesIO(content)
        with Image.open(image_stream) as img:
            img.verify()
            format_name = (img.format or "UNKNOWN").upper()
            width, height = img.size

        if width < 32 or height < 32:
            raise InvalidRequestException(f"Image resolution too low ({width}x{height}). Minimum is 32x32.")

        if width > 8192 or height > 8192:
            raise InvalidRequestException(f"Image resolution too high ({width}x{height}). Maximum is 8192x8192.")

        return width, height, format_name
    except (InvalidRequestException, FileTooLargeException, UnsupportedFileException):
        raise
    except Exception as e:
        raise InvalidRequestException(f"Invalid image file: Failed integrity check ({str(e)}).")
