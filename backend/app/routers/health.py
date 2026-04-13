from fastapi import APIRouter
from app.config import get_settings

router = APIRouter()


@router.get("/api/health")
async def health_check():
    settings = get_settings()
    has_api_key = bool(settings.DEEPSEEK_API_KEY and settings.DEEPSEEK_API_KEY != "your_deepseek_api_key_here")
    return {
        "status": "ok",
        "deepseek_configured": has_api_key,
    }
