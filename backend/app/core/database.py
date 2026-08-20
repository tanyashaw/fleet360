"""
Fleet360 — Database Setup
SQLAlchemy engine + session factory + declarative base.
Supports SQLite (POC) and PostgreSQL (production) via DATABASE_URL.
"""
import logging
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from app.core.config import settings

logger = logging.getLogger(__name__)

# Build engine — SQLite needs check_same_thread=False for FastAPI
_connect_args = {}
if settings.DATABASE_URL.startswith("sqlite"):
    _connect_args["check_same_thread"] = False

engine = create_engine(
    settings.DATABASE_URL,
    connect_args=_connect_args,
    echo=settings.DEBUG,
)

# Enable WAL mode for SQLite for better concurrent reads
if settings.DATABASE_URL.startswith("sqlite"):
    @event.listens_for(engine, "connect")
    def set_sqlite_pragma(dbapi_connection, connection_record):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA journal_mode=WAL")
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    """FastAPI dependency — yields a database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Create all tables. Import all models before calling."""
    # Trigger model registration by importing them
    from app.models import (  # noqa: F401
        vehicle, route, customer, driver,
        trip, transaction, fuel, maintenance, quickbooks, user,
    )
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables created / verified.")
