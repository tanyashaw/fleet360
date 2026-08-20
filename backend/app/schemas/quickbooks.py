"""Fleet360 — QuickBooks Pydantic Schemas."""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class QuickBooksStatus(BaseModel):
    configured: bool                  # QB credentials present in .env
    connected: bool                   # OAuth token exists and is valid
    realm_id: Optional[str] = None
    environment: str
    last_sync_at: Optional[datetime] = None
    message: str


class QuickBooksConnectOut(BaseModel):
    authorization_url: str
    message: str


class QuickBooksSyncRequest(BaseModel):
    sync_type: str = "full"          # full | customers | invoices | expenses | transactions


class QuickBooksSyncOut(BaseModel):
    status: str
    sync_type: str
    records_fetched: int
    records_saved: int
    message: str


class QuickBooksTokenCallbackOut(BaseModel):
    message: str
    realm_id: str
    environment: str


# Auth schemas
class UserRegister(BaseModel):
    name: str
    email: str
    password: str
    role: str = "ANALYST"           # ADMIN | MANAGER | ANALYST


class UserLogin(BaseModel):
    email: str
    password: str


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int                  # seconds


class UserOut(BaseModel):
    id: int
    name: str
    email: str
    role: str
    is_active: bool
