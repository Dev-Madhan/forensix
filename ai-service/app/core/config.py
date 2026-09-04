from functools import lru_cache
from typing import List
from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict
import json


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=(".env", "../.env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # Service metadata
    APP_ENV: str = "development"
    APP_NAME: str = "criminal-eye-ai"
    API_V1_PREFIX: str = "/api/v1"
    PORT: int = 8000
    HOST: str = "0.0.0.0"

    # Server-to-server Authentication
    AI_SERVICE_SECRET: str | None = None

    # Next.js Frontend URL
    NEXT_APP_URL: str = "http://localhost:3000"

    # CORS Allowed Origins
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "https://forensix-sketch.vercel.app",
    ]

    # Timeouts & Request Limits
    REQUEST_TIMEOUT_SECONDS: float = 30.0
    MAX_IMAGE_SIZE_BYTES: int = 15 * 1024 * 1024  # 15 MB
    MAX_DESCRIPTION_LENGTH: int = 5000
    MIN_DESCRIPTION_LENGTH: int = 10

    # Phase 7 AI Providers (Defaults to mock)
    LLM_PROVIDER: str = "mock"
    LLM_API_KEY: str | None = None
    SKETCH_PROVIDER: str = "mock"
    SKETCH_MODEL: str | None = None
    FACE_PROVIDER: str = "mock"
    FACE_MODEL: str | None = None

    # Local Model Configurations (RTX 4050 6GB Optimized)
    QWEN_BASE_URL: str = "http://127.0.0.1:8001/v1"
    QWEN_MODEL: str = "Qwen3-8B-GGUF"
    SD_MODEL_PATH: str = "./models/sd15"
    CONTROLNET_MODEL_PATH: str = "./models/controlnet/lineart"
    MEDIAPIPE_MODEL_PATH: str = "./models/mediapipe/face_landmarker.task"
    OUTPUT_DIR: str = "./outputs"

    # Generation Defaults
    DEFAULT_RESOLUTION: int = 512
    DEFAULT_STEPS: int = 24
    DEFAULT_CONTROL_STRENGTH: float = 0.85
    DEFAULT_BATCH_SIZE: int = 1


    # Phase 5 Storage Reference
    STORAGE_ENDPOINT: str | None = None
    STORAGE_BUCKET: str | None = None
    STORAGE_ACCESS_KEY: str | None = None
    STORAGE_SECRET_KEY: str | None = None

    # Database URL
    DATABASE_URL: str | None = None

    @field_validator("ALLOWED_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v):
        if isinstance(v, str):
            if v.startswith("[") and v.endswith("]"):
                try:
                    return json.loads(v)
                except Exception:
                    pass
            return [i.strip() for i in v.split(",") if i.strip()]
        return v

    @property
    def is_production(self) -> bool:
        return self.APP_ENV.lower() in ("production", "prod")


@lru_cache()
def get_settings() -> Settings:
    return Settings()
