"""Fleet360 — Authentication Routes."""
import logging
from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user,
)
from app.core.config import settings
from app.models.user import User
from app.schemas.quickbooks import UserRegister, UserLogin, TokenOut, UserOut

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/auth", tags=["Authentication"])

VALID_ROLES = {"ADMIN", "MANAGER", "ANALYST"}


def _error(code: str, message: str, status_code: int = 400):
    raise HTTPException(
        status_code=status_code,
        detail={"success": False, "error": {"code": code, "message": message}},
    )


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register(payload: UserRegister, db: Session = Depends(get_db)):
    """Register a new user. Role must be ADMIN, MANAGER, or ANALYST."""
    if payload.role.upper() not in VALID_ROLES:
        _error("INVALID_ROLE", f"Role must be one of: {', '.join(VALID_ROLES)}.")

    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        _error("EMAIL_EXISTS", "An account with this email already exists.", 409)

    user = User(
        name=payload.name,
        email=payload.email.lower(),
        hashed_password=hash_password(payload.password),
        role=payload.role.upper(),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    logger.info("New user registered: %s (role=%s)", user.email, user.role)
    return user


@router.post("/login", response_model=TokenOut)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    """Authenticate and receive a JWT access token."""
    user = db.query(User).filter(User.email == payload.email.lower()).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        _error("INVALID_CREDENTIALS", "Email or password is incorrect.", 401)
    if not user.is_active:
        _error("ACCOUNT_INACTIVE", "This account has been deactivated.", 403)

    expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    token = create_access_token({"sub": str(user.id), "role": user.role}, expires)
    logger.info("User logged in: %s", user.email)
    return TokenOut(
        access_token=token,
        token_type="bearer",
        expires_in=int(expires.total_seconds()),
    )


@router.get("/me", response_model=UserOut)
def me(current_user: User = Depends(get_current_user)):
    """Return the currently authenticated user's profile."""
    return current_user
