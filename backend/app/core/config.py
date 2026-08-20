"""
Fleet360 — Core Configuration
Reads settings from environment variables / .env file.
"""
from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # ── Application ────────────────────────────────────────────────────────
    APP_NAME: str = "Fleet360"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False

    # ── Database ───────────────────────────────────────────────────────────
    DATABASE_URL: str = "sqlite:///./fleet360.db"

    # ── Security ───────────────────────────────────────────────────────────
    SECRET_KEY: str = "change-this-to-a-strong-random-secret-key-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours

    # ── QuickBooks Online ──────────────────────────────────────────────────
    QUICKBOOKS_CLIENT_ID: Optional[str] = None
    QUICKBOOKS_CLIENT_SECRET: Optional[str] = None
    QUICKBOOKS_REDIRECT_URI: str = "http://localhost:8000/api/v1/quickbooks/callback"
    QUICKBOOKS_ENVIRONMENT: str = "sandbox"

    # ── AI Insight Provider ────────────────────────────────────────────────
    LLM_PROVIDER: str = "rule_based"  # "rule_based" | "openai" | "gemini"
    LLM_API_KEY: Optional[str] = None
    OPENAI_API_KEY: Optional[str] = None
    OPENAI_MODEL: str = "gpt-4o-mini"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
