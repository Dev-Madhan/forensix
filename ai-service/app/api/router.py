from fastapi import APIRouter
from app.api.v1.health import router as health_router
from app.api.v1.witness import router as witness_router
from app.api.v1.sketch import router as sketch_router
from app.api.v1.recognition import router as recognition_router

api_v1_router = APIRouter()

api_v1_router.include_router(health_router)
api_v1_router.include_router(witness_router)
api_v1_router.include_router(sketch_router)
api_v1_router.include_router(recognition_router)
