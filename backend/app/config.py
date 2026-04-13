from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    DEEPSEEK_API_KEY: str = ""
    DATABASE_URL: str = "sqlite+aiosqlite:///./chat.db"
    DEEPSEEK_BASE_URL: str = "https://api.deepseek.com"
    JWT_SECRET_KEY: str = "change-me-to-a-random-secret-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_DAYS: int = 7

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


@lru_cache
def get_settings() -> Settings:
    return Settings()
