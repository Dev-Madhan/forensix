import time
import uuid
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.api.router import api_v1_router
from app.core.config import get_settings
from app.core.logging import logger, request_id_ctx
from app.utils.errors import AppException, format_error_response

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup logging
    logger.info(
        f"Starting {settings.APP_NAME} in '{settings.APP_ENV}' mode",
        extra={"endpoint": "startup", "status_code": 200},
    )
    yield
    # Shutdown logging
    logger.info(
        f"Shutting down {settings.APP_NAME}",
        extra={"endpoint": "shutdown", "status_code": 200},
    )


app = FastAPI(
    title="Criminal Eye - AI Backend Service",
    description="Dedicated FastAPI AI service for Forensix (Criminal Eye). Exposes APIs for witness statement processing, forensic sketch generation, and face recognition candidate search.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan,
)

# --- CORS Middleware ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["X-Request-ID", "Content-Type"],
)


# --- Request ID & Observability Middleware ---
@app.middleware("http")
async def request_context_middleware(request: Request, call_next):
    # Retrieve incoming X-Request-ID or generate new one
    req_id = request.headers.get("X-Request-ID")
    if not req_id or not req_id.strip():
        req_id = f"req_{uuid.uuid4().hex[:16]}"
    else:
        # Sanitize incoming request ID to prevent header injection
        req_id = req_id.strip()[:64]

    # Store in request state and contextvar
    request.state.request_id = req_id
    token = request_id_ctx.set(req_id)

    start_time = time.perf_counter()

    try:
        response = await call_next(request)
        elapsed_ms = round((time.perf_counter() - start_time) * 1000, 2)

        # Attach X-Request-ID to response header
        response.headers["X-Request-ID"] = req_id

        # Log request completion
        logger.info(
            f"{request.method} {request.url.path} completed with {response.status_code} in {elapsed_ms}ms",
            extra={
                "method": request.method,
                "endpoint": request.url.path,
                "status_code": response.status_code,
                "processing_time_ms": elapsed_ms,
                "request_id": req_id,
            },
        )
        return response
    except Exception as exc:
        elapsed_ms = round((time.perf_counter() - start_time) * 1000, 2)
        logger.error(
            f"Unhandled error during {request.method} {request.url.path} after {elapsed_ms}ms: {str(exc)}",
            extra={
                "method": request.method,
                "endpoint": request.url.path,
                "status_code": 500,
                "processing_time_ms": elapsed_ms,
                "request_id": req_id,
                "error_code": "INTERNAL_ERROR",
            },
            exc_info=True,
        )
        # Re-raise for the exception handler to format into standard JSON envelope
        raise exc
    finally:
        request_id_ctx.reset(token)


# --- Exception Handlers for Standard Error Envelope ---
@app.exception_handler(AppException)
async def handle_app_exception(request: Request, exc: AppException):
    req_id = getattr(request.state, "request_id", "req_unknown")
    return JSONResponse(
        status_code=exc.status_code,
        content=format_error_response(
            code=exc.code,
            message=exc.message,
            request_id=req_id,
            details=exc.details or None,
        ),
        headers={"X-Request-ID": req_id},
    )


@app.exception_handler(RequestValidationError)
async def handle_validation_error(request: Request, exc: RequestValidationError):
    req_id = getattr(request.state, "request_id", "req_unknown")
    # Simplify and sanitize Pydantic errors
    errors = exc.errors()
    first_error = errors[0] if errors else {}
    loc = ".".join(str(l) for l in first_error.get("loc", []) if l != "body")
    msg = first_error.get("msg", "Invalid request body.")
    detailed_msg = f"{loc}: {msg}" if loc else msg

    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content=format_error_response(
            code="INVALID_REQUEST",
            message=detailed_msg,
            request_id=req_id,
            details={"field_errors": [{"field": loc, "issue": msg}]},
        ),
        headers={"X-Request-ID": req_id},
    )


@app.exception_handler(StarletteHTTPException)
async def handle_http_exception(request: Request, exc: StarletteHTTPException):
    req_id = getattr(request.state, "request_id", "req_unknown")
    code_map = {
        400: "INVALID_REQUEST",
        401: "UNAUTHORIZED",
        403: "FORBIDDEN",
        404: "NOT_FOUND",
        405: "METHOD_NOT_ALLOWED",
        413: "FILE_TOO_LARGE",
        415: "UNSUPPORTED_FILE",
        502: "PROVIDER_ERROR",
        503: "SERVICE_UNAVAILABLE",
        504: "TIMEOUT",
    }
    code = code_map.get(exc.status_code, "INTERNAL_ERROR")
    return JSONResponse(
        status_code=exc.status_code,
        content=format_error_response(
            code=code,
            message=str(exc.detail),
            request_id=req_id,
        ),
        headers={"X-Request-ID": req_id},
    )


@app.exception_handler(Exception)
async def handle_unhandled_exception(request: Request, exc: Exception):
    req_id = getattr(request.state, "request_id", "req_unknown")
    # Strictly sanitize in production: never leak python stack traces, paths, or secrets
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=format_error_response(
            code="INTERNAL_ERROR",
            message="An unexpected internal error occurred while processing the request.",
            request_id=req_id,
        ),
        headers={"X-Request-ID": req_id},
    )


# --- Mount API v1 Routers ---
app.include_router(api_v1_router, prefix=settings.API_V1_PREFIX)


# --- Root Endpoint ---
@app.get("/", include_in_schema=False)
async def root():
    return {
        "service": settings.APP_NAME,
        "version": "1.0.0",
        "docs": "/docs",
        "health": f"{settings.API_V1_PREFIX}/health",
    }
