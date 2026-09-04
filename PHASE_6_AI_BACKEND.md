# Criminal Eye --- Phase 6: AI Backend

> **Status:** Implementation Specification\
> **Project:** Criminal Eye\
> **Phase:** 6 --- AI Backend\
> **Previous phases:** Phase 1--5 complete\
> **Next phase:** Phase 7 --- AI Features

------------------------------------------------------------------------

## 1. Purpose

Phase 6 establishes the **dedicated FastAPI AI backend** for Criminal
Eye.

The project roadmap requires Phase 6 to:

1.  Create a separate FastAPI service.
2.  Expose REST APIs for:
    -   Witness processing
    -   Sketch generation
    -   Face recognition

The actual AI capabilities---LLM facial-attribute extraction, diffusion
sketch generation, InsightFace embeddings, pgvector similarity search,
and ranked suspect matching---belong to **Phase 7**.

Therefore, Phase 6 must establish the **production-quality AI service
architecture, API contracts, validation, security boundaries, error
handling, observability, testing, and integration foundation** without
prematurely implementing Phase 7's AI logic.

------------------------------------------------------------------------

# 2. Phase Goal

At the end of Phase 6, Criminal Eye must have a standalone FastAPI
service that can run independently from Next.js.

Target architecture:

``` text
Browser
   |
   v
Next.js Application
   |  authenticated server-to-server request
   v
FastAPI AI Service
   |
   +-- Witness Service
   +-- Sketch Service
   +-- Recognition Service
   |
   +-- Provider Adapters
       +-- LLM
       +-- Sketch Model
       +-- Face Model
```

The FastAPI service must remain independently deployable.

------------------------------------------------------------------------

# 3. Strict Phase Boundary

## Phase 6 includes

-   FastAPI project
-   Python environment
-   REST API architecture
-   API versioning
-   Request/response schemas
-   Input validation
-   Server-to-server authentication
-   CORS configuration
-   Centralized configuration
-   Error handling
-   Health/readiness endpoints
-   Service layer
-   Provider abstraction
-   Secure file/input handling
-   Structured logging
-   Request IDs
-   Timeouts
-   Automated API tests
-   OpenAPI documentation
-   Next.js → FastAPI integration foundation

## Phase 6 does NOT include

Do not treat these as Phase 6 completion requirements:

-   Actual LLM facial-attribute extraction
-   Actual diffusion sketch generation
-   Actual InsightFace embedding generation
-   Actual pgvector similarity search
-   Final suspect-ranking algorithm
-   AI accuracy benchmarking
-   Production model optimization

These belong to **Phase 7**.

Phase 6 should make the architecture ready for those capabilities.

------------------------------------------------------------------------

# 4. Technology

## Backend

**FastAPI**

## Python

Use a currently supported Python version compatible with the future
AI/model dependencies.

Prefer:

``` text
Python 3.12+
```

if compatible with the selected Phase 7 models.

## Server

**Uvicorn**

## Validation

**Pydantic / Pydantic Settings**

## HTTP

Use an async-capable HTTP client such as `httpx` where external
providers are required.

## Testing

Use:

``` text
pytest
pytest-asyncio
httpx
```

Use the project's chosen Python dependency workflow consistently.

------------------------------------------------------------------------

# 5. Repository Structure

Keep the AI backend separate from the Next.js application.

Recommended:

``` text
criminal-eye/
├── app/                         # Next.js
├── components/
├── features/
├── hooks/
├── lib/
├── actions/
├── services/
├── schemas/
├── types/
├── utils/
├── config/
├── constants/
├── styles/
├── prisma/
│
├── ai-service/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py
│   │   │
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   ├── router.py
│   │   │   └── v1/
│   │   │       ├── health.py
│   │   │       ├── witness.py
│   │   │       ├── sketch.py
│   │   │       └── recognition.py
│   │   │
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   ├── security.py
│   │   │   └── logging.py
│   │   │
│   │   ├── schemas/
│   │   │   ├── common.py
│   │   │   ├── witness.py
│   │   │   ├── sketch.py
│   │   │   └── recognition.py
│   │   │
│   │   ├── services/
│   │   │   ├── witness_service.py
│   │   │   ├── sketch_service.py
│   │   │   └── recognition_service.py
│   │   │
│   │   ├── providers/
│   │   │   ├── llm/
│   │   │   ├── sketch/
│   │   │   └── face/
│   │   │
│   │   └── utils/
│   │       ├── files.py
│   │       └── errors.py
│   │
│   ├── tests/
│   │   ├── test_health.py
│   │   ├── test_witness.py
│   │   ├── test_sketch.py
│   │   └── test_recognition.py
│   │
│   ├── .env.example
│   ├── .gitignore
│   ├── requirements.txt
│   └── README.md
│
└── ...
```

Adapt the structure to existing conventions, but preserve separation
between **routers, schemas, services, providers, configuration, and
tests**.

------------------------------------------------------------------------

# 6. FastAPI Application

Create:

``` text
ai-service/app/main.py
```

Responsibilities:

-   Create the FastAPI application.
-   Register routers.
-   Configure CORS.
-   Configure metadata.
-   Configure startup/shutdown behavior when required.
-   Expose health/readiness endpoints.

Do not place business or model logic in `main.py`.

------------------------------------------------------------------------

# 7. API Versioning

All application endpoints should use:

``` text
/api/v1
```

Required endpoint contracts:

``` http
GET  /api/v1/health
GET  /api/v1/health/ready
POST /api/v1/witness/process
POST /api/v1/sketch/generate
POST /api/v1/recognition/search
```

Versioning is mandatory so future API changes do not silently break the
Next.js application.

------------------------------------------------------------------------

# 8. Health and Readiness

## Health

``` http
GET /api/v1/health
```

Example:

``` json
{
  "status": "ok",
  "service": "criminal-eye-ai"
}
```

This should only prove that the service is alive.

## Readiness

``` http
GET /api/v1/health/ready
```

Check only dependencies required by the enabled configuration.

Do not perform expensive AI inference in health checks.

------------------------------------------------------------------------

# 9. Witness Processing API

## Endpoint

``` http
POST /api/v1/witness/process
```

Purpose: accept a witness description and return a structured
facial-attribute representation.

The real LLM implementation belongs to Phase 7.

### Request

``` json
{
  "case_id": "case-id",
  "witness_id": "witness-id",
  "description": "Witness description..."
}
```

Validation:

-   `case_id` required
-   `witness_id` required
-   description required
-   reject empty/whitespace-only descriptions
-   enforce a reasonable maximum length
-   validate the complete Pydantic schema

### Response

``` json
{
  "request_id": "req_...",
  "status": "completed",
  "case_id": "case-id",
  "witness_id": "witness-id",
  "attributes": {},
  "processing_time_ms": 0
}
```

Do not invent real AI attributes during Phase 6.

------------------------------------------------------------------------

# 10. Sketch Generation API

## Endpoint

``` http
POST /api/v1/sketch/generate
```

Purpose: establish the contract for generating a forensic sketch from
structured facial information.

The actual diffusion model belongs to Phase 7.

### Request

``` json
{
  "case_id": "case-id",
  "witness_id": "witness-id",
  "attributes": {}
}
```

### Response

``` json
{
  "request_id": "req_...",
  "status": "completed",
  "case_id": "case-id",
  "witness_id": "witness-id",
  "image": {
    "url": "...",
    "content_type": "image/png"
  },
  "processing_time_ms": 0
}
```

The actual storage implementation must reuse the secure image-storage
architecture already established in Phase 5.

Never expose storage credentials.

------------------------------------------------------------------------

# 11. Face Recognition API

## Endpoint

``` http
POST /api/v1/recognition/search
```

Purpose: establish the contract for submitting an image and returning
candidate matches.

InsightFace and pgvector belong to Phase 7.

### Request

Prefer a secure storage reference when an image already exists in the
project's storage layer.

Example:

``` json
{
  "case_id": "case-id",
  "image_reference": "secure-object-reference",
  "limit": 10
}
```

### Response

``` json
{
  "request_id": "req_...",
  "status": "completed",
  "case_id": "case-id",
  "matches": [],
  "processing_time_ms": 0
}
```

Phase 7 will define the final match structure and confidence-score
semantics.

------------------------------------------------------------------------

# 12. Request IDs

Every request should have a unique non-sensitive request ID.

Example:

``` text
req_01J...
```

Use it for:

-   Logs
-   Error responses
-   Frontend tracing
-   Debugging
-   Future audit correlation

Never put passwords, tokens, case descriptions, or other sensitive data
into request IDs.

------------------------------------------------------------------------

# 13. Standard Error Contract

All API errors should follow one structure:

``` json
{
  "error": {
    "code": "INVALID_REQUEST",
    "message": "The witness description is required.",
    "request_id": "req_..."
  }
}
```

Recommended codes:

``` text
INVALID_REQUEST
UNAUTHORIZED
FORBIDDEN
NOT_FOUND
UNSUPPORTED_FILE
FILE_TOO_LARGE
PROCESSING_ERROR
PROVIDER_ERROR
TIMEOUT
SERVICE_UNAVAILABLE
INTERNAL_ERROR
```

Production responses must never expose:

-   Python stack traces
-   API keys
-   database credentials
-   storage secrets
-   internal filesystem paths
-   raw provider exceptions

------------------------------------------------------------------------

# 14. Authentication Boundary

The AI service must not be an unauthenticated public endpoint.

Preferred flow:

``` text
Browser
   ↓
Next.js
   ↓ authenticated server request
FastAPI
```

Do not expose an AI-service secret to browser JavaScript.

The existing Better Auth system remains the application's
user-authentication layer. FastAPI should verify authorized service
requests using a secure server-to-server mechanism.

Do not duplicate the complete Better Auth implementation inside FastAPI
without a concrete requirement.

------------------------------------------------------------------------

# 15. CORS

Configure CORS explicitly.

Development may allow the local Next.js origin.

Production must allow only the actual deployed frontend origin(s).

Avoid unrestricted production:

``` python
allow_origins=["*"]
```

especially for credentialed/authenticated access.

Keep allowed origins in configuration.

------------------------------------------------------------------------

# 16. Environment Variables

Create:

``` text
ai-service/.env.example
```

Document only variables actually required.

Example:

``` env
APP_ENV=development
APP_NAME=criminal-eye-ai
API_V1_PREFIX=/api/v1
NEXT_APP_URL=http://localhost:3000

AI_SERVICE_SECRET=

LLM_PROVIDER=
LLM_API_KEY=

SKETCH_PROVIDER=
SKETCH_MODEL=

FACE_PROVIDER=
FACE_MODEL=

STORAGE_ENDPOINT=
STORAGE_BUCKET=
STORAGE_ACCESS_KEY=
STORAGE_SECRET_KEY=

DATABASE_URL=
```

Do not commit:

``` text
ai-service/.env
```

Do not expose private values through client-visible environment
variables.

------------------------------------------------------------------------

# 17. Centralized Configuration

Create:

``` text
app/core/config.py
```

Use a typed settings object.

Do not scatter:

``` python
os.getenv(...)
```

throughout the application.

Configuration should be centralized for:

-   Validation
-   Testability
-   Deployment
-   Environment separation

------------------------------------------------------------------------

# 18. Service Layer

Routes must remain thin.

Preferred architecture:

``` text
Router
  ↓
Pydantic Request Schema
  ↓
Service
  ↓
Provider Adapter
  ↓
Result
  ↓
Pydantic Response Schema
```

Do not put orchestration/model logic directly in route functions.

------------------------------------------------------------------------

# 19. Provider Abstraction

Create provider interfaces/adapters for future Phase 7 implementations.

Conceptually:

``` text
LLMProvider
  └── extract_facial_attributes()

SketchProvider
  └── generate_sketch()

FaceProvider
  └── generate_embedding()
```

The API routes must not depend directly on a specific vendor/model.

Phase 7 should be able to replace a mock provider with a real
implementation without redesigning the API.

------------------------------------------------------------------------

# 20. File Security

For forensic images:

-   Validate MIME type.
-   Validate extension.
-   Enforce maximum size.
-   Validate image integrity.
-   Validate dimensions where appropriate.
-   Do not trust filenames.
-   Never execute uploaded content.
-   Avoid unnecessary permanent temporary files.
-   Delete temporary files after processing.
-   Authorize access to referenced storage objects.

------------------------------------------------------------------------

# 21. Storage Boundary

Phase 5 already provides secure image storage.

Reuse that architecture.

Preferred:

``` text
Next.js
   ↓
Secure Storage
   ↓
Authorized object reference
   ↓
FastAPI
   ↓
Temporary processing
   ↓
Result
```

Do not create an unrelated second storage architecture.

Do not expose storage credentials to the browser.

------------------------------------------------------------------------

# 22. Database Boundary

The existing application uses Prisma/PostgreSQL.

Do not automatically introduce a second ORM/database layer in FastAPI.

Preferred initial boundary:

``` text
Next.js
   ├── Prisma
   │     ↓
   │   PostgreSQL
   │
   └── FastAPI
         ↓
      AI processing
```

If Phase 7 requires direct vector operations, define that architecture
explicitly before implementing it.

Avoid duplicated database models.

------------------------------------------------------------------------

# 23. Logging

Implement structured logs containing useful non-sensitive fields:

``` text
timestamp
level
request_id
endpoint
status_code
processing_time_ms
error_code
```

Never log:

-   API keys
-   Passwords
-   Session tokens
-   Storage secrets
-   Full private witness statements unless explicitly required
-   Image contents

Logging must support debugging without unnecessarily exposing forensic
information.

------------------------------------------------------------------------

# 24. Timeouts and Failures

External providers can fail or become slow.

Every external request must have an explicit timeout.

Never allow an AI request to hang indefinitely.

Return controlled errors:

``` json
{
  "error": {
    "code": "TIMEOUT",
    "message": "AI processing timed out.",
    "request_id": "req_..."
  }
}
```

------------------------------------------------------------------------

# 25. Long-Running Jobs

Do not introduce a queue merely for architectural complexity.

Synchronous APIs are acceptable during Phase 6 if the Phase 7 models can
reliably complete within the deployment timeout.

If actual AI inference becomes long-running, evolve toward:

``` text
POST /jobs
      ↓
job_id
      ↓
GET /jobs/{job_id}
```

Do not hold HTTP connections open indefinitely.

------------------------------------------------------------------------

# 26. OpenAPI Documentation

FastAPI's OpenAPI documentation must clearly describe:

-   Endpoints
-   Request schemas
-   Response schemas
-   Validation
-   Error responses
-   Authentication
-   Field meanings

The API should be understandable to the Next.js developer without
inspecting the backend source.

------------------------------------------------------------------------

# 27. Next.js Integration

Create a server-side AI integration layer.

Recommended:

``` text
services/
└── ai/
    ├── client.ts
    ├── witness.ts
    ├── sketch.ts
    └── recognition.ts
```

Do not scatter raw FastAPI URLs throughout React components.

Preferred:

``` text
React Component
      ↓
Server Action / Server Service
      ↓
AI Client
      ↓
FastAPI
```

Avoid:

``` text
React Component
      ↓
fetch("http://localhost:8000/...")
```

The FastAPI base URL must come from environment configuration.

------------------------------------------------------------------------

# 28. Next.js Environment

Example:

``` env
AI_SERVICE_URL=http://localhost:8000
AI_SERVICE_SECRET=
```

Never expose the private service secret through:

``` text
NEXT_PUBLIC_
```

The browser should not receive the service credential.

------------------------------------------------------------------------

# 29. Testing

Phase 6 requires automated API-contract tests.

## Health

-   Health returns 200.
-   Readiness behaves correctly.

## Witness

-   Valid request accepted.
-   Missing description rejected.
-   Empty description rejected.
-   Oversized description rejected.
-   Response matches schema.

## Sketch

-   Valid request accepted.
-   Invalid attributes rejected.
-   Unauthorized request rejected.

## Recognition

-   Invalid image reference rejected.
-   Invalid request rejected.
-   Unauthorized request rejected.
-   Response matches schema.

## Security

-   CORS behaves as configured.
-   Secrets are not returned.
-   Internal exceptions are sanitized.

External AI providers should be mocked during Phase 6.

Do not make paid AI API calls in the automated test suite.

------------------------------------------------------------------------

# 30. Local Development

Expected local architecture:

``` text
Next.js
localhost:3000
       |
       v
FastAPI
localhost:8000
```

FastAPI should be independently startable.

From `ai-service/`, a typical development command is:

``` bash
uvicorn app.main:app --reload --port 8000
```

Verify:

``` text
GET /api/v1/health
GET /api/v1/health/ready
```

Then inspect FastAPI's OpenAPI documentation.

------------------------------------------------------------------------

# 31. Quality Requirements

Before completion:

-   No route contains large business logic.
-   No secrets are hard-coded.
-   No client-side AI service credentials.
-   No unrestricted production CORS.
-   No duplicated storage implementation.
-   No unnecessary second database ORM.
-   No Phase 7 AI implementation hidden inside Phase 6.
-   All new endpoints have validation.
-   All endpoints have predictable errors.
-   All endpoints are documented.
-   All endpoints have tests.
-   The service starts independently.

------------------------------------------------------------------------

# 32. Phase 6 Completion Checklist

## Backend Foundation

-   [ ] `ai-service/` created.
-   [ ] Python environment configured.
-   [ ] FastAPI installed.
-   [ ] Uvicorn configured.
-   [ ] Pydantic settings configured.
-   [ ] Application starts successfully.
-   [ ] API versioning implemented.
-   [ ] Modular structure implemented.

## API

-   [ ] Health endpoint implemented.
-   [ ] Readiness endpoint implemented.
-   [ ] Witness processing endpoint implemented.
-   [ ] Sketch generation endpoint implemented.
-   [ ] Face recognition endpoint implemented.
-   [ ] Request schemas implemented.
-   [ ] Response schemas implemented.
-   [ ] Error contract implemented.
-   [ ] Request IDs implemented.

## Security

-   [ ] Server-to-server authentication implemented.
-   [ ] CORS restricted appropriately.
-   [ ] Secrets stored in environment variables.
-   [ ] `.env` ignored.
-   [ ] No secrets in source.
-   [ ] Sensitive errors sanitized.
-   [ ] File validation implemented.

## Architecture

-   [ ] Router/service separation.
-   [ ] Provider abstraction.
-   [ ] Centralized configuration.
-   [ ] Storage boundary defined.
-   [ ] Database boundary defined.
-   [ ] Next.js AI client layer implemented.

## Reliability

-   [ ] Timeouts configured.
-   [ ] Provider errors handled.
-   [ ] Structured logging implemented.
-   [ ] Health checks implemented.
-   [ ] Processing time tracked.

## Documentation

-   [ ] OpenAPI reviewed.
-   [ ] AI service README created.
-   [ ] Environment variables documented.
-   [ ] Local startup documented.
-   [ ] API contracts documented.

## Testing

-   [ ] Health tests pass.
-   [ ] Witness tests pass.
-   [ ] Sketch tests pass.
-   [ ] Recognition tests pass.
-   [ ] Validation tests pass.
-   [ ] Authentication tests pass.
-   [ ] Security/error tests pass.
-   [ ] External AI providers mocked.

------------------------------------------------------------------------

# 33. Definition of Done

Phase 6 is complete when:

``` text
                    Criminal Eye
                         |
              +----------+----------+
              |                     |
           Next.js              FastAPI
              |                     |
       Application Layer       API Layer
              |                     |
       Prisma / Storage       Service Layer
                                    |
                              Provider Layer
                                    |
                         +----------+----------+
                         |          |          |
                        LLM       Sketch      Face
                       Adapter    Adapter    Adapter
```

The provider adapters may use controlled mocks/placeholders because real
model implementations belong to Phase 7.

The critical requirement is that Phase 7 can replace those adapters with
real AI implementations **without redesigning the API layer**.

------------------------------------------------------------------------

# 34. Phase 7 Handoff

The next phase is **Phase 7 --- AI Features**.

The project roadmap specifies:

``` text
Witness Description
        ↓
LLM
        ↓
Structured Facial Attributes
        ↓
Diffusion Model
        ↓
Forensic Sketch
        ↓
InsightFace
        ↓
Facial Embedding
        ↓
pgvector
        ↓
Similarity Search
        ↓
Ranked Suspect Matches
        ↓
Confidence Scores
```

Do not implement this complete pipeline in Phase 6.

Phase 6 builds the stable infrastructure that Phase 7 will use.

------------------------------------------------------------------------

# 35. Antigravity Implementation Instructions

If this README is given to Antigravity or another coding agent, follow
these instructions strictly.

## Before coding

1.  Inspect the entire repository.
2.  Verify that Phase 1--5 functionality exists before changing
    anything.
3.  Inspect the existing Prisma schema.
4.  Inspect Better Auth integration.
5.  Inspect Case Management.
6.  Inspect Criminal Database.
7.  Inspect existing secure image storage.
8.  Inspect existing Next.js service/action patterns.
9.  Inspect environment configuration.
10. Identify existing conventions and reuse them.

Do not duplicate existing functionality.

## During coding

1.  Implement **Phase 6 only**.
2.  Do not unnecessarily redesign Phase 1--5.
3.  Do not replace Prisma.
4.  Do not replace the existing storage provider.
5.  Do not move authentication unnecessarily.
6.  Keep FastAPI independently deployable.
7.  Keep routes thin.
8.  Keep business logic in services.
9.  Keep model/provider integrations behind adapters.
10. Validate every request.
11. Sanitize every production error.
12. Never expose secrets.
13. Add automated tests.
14. Update documentation.

## Phase boundary

Do not silently implement Phase 7.

If a real AI provider is needed to test Phase 6 contracts, use a
mock/provider stub and explicitly label it:

``` text
Phase 7 implementation pending
```

## After coding

Run and verify:

``` text
Backend startup
API tests
Security tests
OpenAPI generation
Configuration validation
Next.js integration
```

Then report:

1.  Files created.
2.  Files modified.
3.  Endpoints created.
4.  Environment variables added.
5.  Tests added.
6.  Tests passed.
7.  Security decisions.
8.  Phase 6 items completed.
9.  Phase 6 items remaining.
10. Items intentionally deferred to Phase 7.

Never claim Phase 6 is complete without verifying the actual
implementation.

------------------------------------------------------------------------

# 36. Final Engineering Principle

Criminal Eye is not a generic AI demo.

The FastAPI service is the **controlled AI boundary of a professional
forensic investigation platform**.

Prioritize:

**Security → Reliability → API contracts → Separation of concerns →
Testability → AI extensibility**

Build Phase 6 so the real Phase 7 models can be introduced without
rewriting the backend.
