"""Fleet360 — QuickBooks OAuth token storage model."""
from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean
from sqlalchemy.sql import func
from app.core.database import Base


class QuickBooksToken(Base):
    """
    Stores OAuth 2.0 tokens for QuickBooks Online integration.
    One row per connected QuickBooks realm (company).
    Tokens are encrypted at rest in production; stored as-is for POC.
    """
    __tablename__ = "quickbooks_tokens"

    id = Column(Integer, primary_key=True, index=True)
    realm_id = Column(String(50), unique=True, nullable=False, index=True)  # QB Company ID
    access_token = Column(Text, nullable=True)       # short-lived (1 hour)
    refresh_token = Column(Text, nullable=True)      # long-lived (100 days)
    token_type = Column(String(20), default="Bearer")
    access_token_expires_at = Column(DateTime(timezone=True), nullable=True)
    refresh_token_expires_at = Column(DateTime(timezone=True), nullable=True)
    environment = Column(String(20), default="sandbox")  # sandbox | production
    is_active = Column(Boolean, default=True)
    last_sync_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self) -> str:
        return f"<QuickBooksToken realm_id={self.realm_id} active={self.is_active}>"


class QuickBooksSyncLog(Base):
    """Tracks every QuickBooks synchronisation run."""
    __tablename__ = "quickbooks_sync_logs"

    id = Column(Integer, primary_key=True, index=True)
    realm_id = Column(String(50), nullable=False, index=True)
    sync_type = Column(String(50), nullable=False)   # full | incremental | customers | invoices | expenses
    status = Column(String(20), nullable=False)      # running | completed | failed
    records_fetched = Column(Integer, default=0)
    records_saved = Column(Integer, default=0)
    error_message = Column(Text, nullable=True)
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)
