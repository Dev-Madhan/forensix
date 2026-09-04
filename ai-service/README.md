# Criminal Eye — AI Backend Microservice (`ai-service`)

> **Phase 6 Implementation**: Dedicated FastAPI AI microservice providing the API contracts, request validation, security boundaries, observability, testing, and integration foundation for Forensix (Criminal Eye).

---

## 1. Overview & Architecture

The `ai-service` is an independently deployable FastAPI microservice that processes forensic intelligence requests on behalf of the Next.js application.

```text
Browser
   |
   v
Next.js Application (Better Auth / Prisma / UI)
   |  authenticated server-to-server HTTP request (X-AI-Secret, X-Request-ID)
   v
FastAPI AI Service (/api/v1)
   |
   +-- Witness Service       --> LLM Provider Adapter (extract facial attributes)
   +-- Sketch Service        --> Sketch Provider Adapter (generate forensic composite)
   +-- Recognition Service   --> Face Provider Adapter (facial similarity search)
```

### Strict Phase Boundaries

- **Phase 6 (This Service)**: Production-grade FastAPI service, Pydantic V2 validation schemas, API versioning (`/api/v1`), constant-time server-to-server authentication, structured JSON logging, standard error envelopes, file & path security, automated test suite, and Next.js client integration.
- **Phase 7 (Pending)**: Real LLM facial-attribute extraction model, real diffusion sketch generation model, InsightFace embeddings, pgvector database similarity search, and ranked suspect matching. The provider adapters in this service are cleanly mocked and marked with `"Phase 7 implementation pending"`.

---

## 2. API Endpoints Contract

All endpoints are versioned under `/api/v1`.

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/health` | Liveness probe (returns 200 `{"status": "ok"}`) | No |
| `GET` | `/api/v1/health/ready` | Readiness probe (verifies service and dependencies) | No |
| `POST` | `/api/v1/witness/process` | Parses natural language description into facial attributes | Yes |
| `POST` | `/api/v1/sketch/generate` | Synthesizes forensic sketch from attributes | Yes |
| `POST` | `/api/v1/recognition/search` | Searches candidate suspects matching image reference | Yes |

### Interactive Documentation

When running locally, interactive API documentation is available at:
- **Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)
- **OpenAPI JSON**: [http://localhost:8000/openapi.json](http://localhost:8000/openapi.json)

---

## 3. Standard Request & Response Schemas

### Witness Statement Processing
**`POST /api/v1/witness/process`**

Request:
```json
{
  "case_id": "case-01JABCDEF1234567",
  "witness_id": "wit-01JABCDEF1234567",
  "description": "Male in his late 30s, sharp jawline, dark brown curly hair, slight scar above left eyebrow."
}
```

Response:
```json
{
  "request_id": "req_01JABC1234",
  "status": "completed",
  "case_id": "case-01JABCDEF1234567",
  "witness_id": "wit-01JABCDEF1234567",
  "attributes": {
    "_phase_status": "Phase 7 implementation pending",
    "extracted": true,
    "attributes": {
      "gender": "undetermined",
      "estimated_age_range": "25-45",
      "face_shape": "oval"
    }
  },
  "processing_time_ms": 14.5
}
```

### Forensic Sketch Generation
**`POST /api/v1/sketch/generate`**

Request:
```json
{
  "case_id": "case-01JABCDEF1234567",
  "witness_id": "wit-01JABCDEF1234567",
  "attributes": {
    "gender": "male",
    "hair": "curly dark brown",
    "jaw": "sharp"
  }
}
```

Response:
```json
{
  "request_id": "req_01JABC1234",
  "status": "completed",
  "case_id": "case-01JABCDEF1234567",
  "witness_id": "wit-01JABCDEF1234567",
  "image": {
    "url": "/storage/cases/case-01JABCDEF1234567/sketches/wit-01JABCDEF1234567_composite.png",
    "content_type": "image/png"
  },
  "processing_time_ms": 28.1
}
```

### Face Recognition Search
**`POST /api/v1/recognition/search`**

Request:
```json
{
  "case_id": "case-01JABCDEF1234567",
  "image_reference": "cases/case-01JABCDEF1234567/sketches/composite.png",
  "limit": 10
}
```

Response:
```json
{
  "request_id": "req_01JABC1234",
  "status": "completed",
  "case_id": "case-01JABCDEF1234567",
  "matches": [
    {
      "criminal_id": "crim_mock_placeholder_1",
      "confidence_score": 0.88,
      "metadata": {
        "_phase_status": "Phase 7 implementation pending"
      }
    }
  ],
  "processing_time_ms": 19.3
}
```

---

## 4. Standard Error Contract

All error responses strictly conform to:

```json
{
  "error": {
    "code": "INVALID_REQUEST",
    "message": "Witness description must be at least 10 characters.",
    "request_id": "req_01JABC1234"
  }
}
```

### Error Codes
- `INVALID_REQUEST` (400)
- `UNAUTHORIZED` (401)
- `FORBIDDEN` (403)
- `NOT_FOUND` (404)
- `FILE_TOO_LARGE` (413)
- `UNSUPPORTED_FILE` (415)
- `PROCESSING_ERROR` (500)
- `PROVIDER_ERROR` (502)
- `SERVICE_UNAVAILABLE` (503)
- `TIMEOUT` (504)
- `INTERNAL_ERROR` (500)

---

## 5. Security & Isolation

1. **Server-to-Server Authentication**: Protected routes require an `X-AI-Secret` or `Authorization: Bearer <secret>` header. Verification is performed using constant-time string comparison (`secrets.compare_digest`) to prevent timing attacks.
2. **CORS Policy**: Configured explicitly via `ALLOWED_ORIGINS` (defaults to Next.js frontend origin, no wildcard `*` allowed in production).
3. **Information Disclosure Prevention**: Production error handlers intercept unhandled exceptions and sanitize details, completely preventing stack trace or internal path leakage.
4. **File & Storage Safety**: Storage reference parameters are checked against path traversal (`../`, absolute paths, illegal characters). Image uploads are inspected for size, MIME type, and raster integrity using Pillow.
5. **Masked Structured Logging**: Sensitive values (`secret`, `password`, `token`, `authorization`, `cookie`) are recursively masked in logs.

---

## 6. Local Setup & Running

### Requirements
- Python 3.12+ (Python 3.14 supported)

### 1. Create Virtual Environment & Install Dependencies
```bash
python -m venv .venv
# On Windows PowerShell:
.\.venv\Scripts\pip install -r requirements.txt
# On Linux/macOS:
source .venv/bin/activate && pip install -r requirements.txt
```

### 2. Configure Environment
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

### 3. Run Development Server
```bash
.\.venv\Scripts\uvicorn app.main:app --reload --port 8000
```

The service will start on `http://localhost:8000`.

### 4. Run Automated Tests
```bash
.\.venv\Scripts\pytest tests -v
```

---

## 7. Next.js Integration Layer

The Next.js application interacts with `ai-service` via a typed, server-only client located at:
`src/services/ai/`:
- `types.ts` — Shared TypeScript interfaces
- `client.ts` — Server-side HTTP client with request ID propagation and error wrapping
- `witness.ts` — `processWitnessStatement()`
- `sketch.ts` — `generateForensicSketch()`
- `recognition.ts` — `searchSuspectRecognition()`
