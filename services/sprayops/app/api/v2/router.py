from fastapi import APIRouter
from app.api.v2.endpoints.compliance import router as compliance_router

api_v2_router = APIRouter(prefix="/api/v2/sprayops")
api_v2_router.include_router(compliance_router)
