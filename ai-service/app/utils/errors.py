from typing import Any, Dict, Optional
from fastapi import status


class AppException(Exception):
    """Base application exception supporting standard error envelope."""

    def __init__(
        self,
        code: str,
        message: str,
        status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR,
        details: Optional[Dict[str, Any]] = None,
    ):
        super().__init__(message)
        self.code = code
        self.message = message
        self.status_code = status_code
        self.details = details or {}


class InvalidRequestException(AppException):
    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        super().__init__(
            code="INVALID_REQUEST",
            message=message,
            status_code=status.HTTP_400_BAD_REQUEST,
            details=details,
        )


class UnauthorizedException(AppException):
    def __init__(self, message: str = "Unauthorized: Invalid or missing authentication credentials."):
        super().__init__(
            code="UNAUTHORIZED",
            message=message,
            status_code=status.HTTP_401_UNAUTHORIZED,
        )


class ForbiddenException(AppException):
    def __init__(self, message: str = "Forbidden: Access is denied."):
        super().__init__(
            code="FORBIDDEN",
            message=message,
            status_code=status.HTTP_403_FORBIDDEN,
        )


class NotFoundException(AppException):
    def __init__(self, message: str = "Requested resource not found."):
        super().__init__(
            code="NOT_FOUND",
            message=message,
            status_code=status.HTTP_404_NOT_FOUND,
        )


class UnsupportedFileException(AppException):
    def __init__(self, message: str = "Unsupported file type."):
        super().__init__(
            code="UNSUPPORTED_FILE",
            message=message,
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
        )


class FileTooLargeException(AppException):
    def __init__(self, message: str = "File size exceeds the allowed limit."):
        super().__init__(
            code="FILE_TOO_LARGE",
            message=message,
            status_code=getattr(status, "HTTP_413_CONTENT_TOO_LARGE", 413),
        )



class ProcessingException(AppException):
    def __init__(self, message: str = "An error occurred while processing the request."):
        super().__init__(
            code="PROCESSING_ERROR",
            message=message,
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


class ProviderException(AppException):
    def __init__(self, message: str = "External AI provider error occurred."):
        super().__init__(
            code="PROVIDER_ERROR",
            message=message,
            status_code=status.HTTP_502_BAD_GATEWAY,
        )


class TimeoutException(AppException):
    def __init__(self, message: str = "AI processing timed out."):
        super().__init__(
            code="TIMEOUT",
            message=message,
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
        )


class ServiceUnavailableException(AppException):
    def __init__(self, message: str = "AI service is temporarily unavailable."):
        super().__init__(
            code="SERVICE_UNAVAILABLE",
            message=message,
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        )


def format_error_response(
    code: str,
    message: str,
    request_id: Optional[str] = None,
    details: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """Formats standardized API error response per Phase 6 specification."""
    error_payload: Dict[str, Any] = {
        "code": code,
        "message": message,
        "request_id": request_id or "unknown",
    }
    if details:
        error_payload["details"] = details
    return {"error": error_payload}
