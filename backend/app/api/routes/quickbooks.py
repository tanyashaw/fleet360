"""Fleet360 — QuickBooks Integration Routes."""
import logging
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user, require_role
from app.schemas.quickbooks import (
    QuickBooksStatus,
    QuickBooksConnectOut,
    QuickBooksSyncRequest,
    QuickBooksSyncOut,
    QuickBooksTokenCallbackOut,
)
from app.services import quickbooks_service as qb

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/quickbooks", tags=["QuickBooks"])


@router.get("/status", response_model=QuickBooksStatus)
def quickbooks_status(
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    """
    Check QuickBooks connection status.
    Returns 'not configured' gracefully if credentials are absent — demo data still works.
    """
    configured = qb.is_configured()
    token = qb.get_active_token(db) if configured else None

    if not configured:
        return QuickBooksStatus(
            configured=False,
            connected=False,
            environment=qb.settings.QUICKBOOKS_ENVIRONMENT,
            message=(
                "QuickBooks credentials are not configured. "
                "The system is running on demo/seed data. "
                "Add QUICKBOOKS_CLIENT_ID and QUICKBOOKS_CLIENT_SECRET to .env to connect."
            ),
        )

    if not token:
        return QuickBooksStatus(
            configured=True,
            connected=False,
            environment=qb.settings.QUICKBOOKS_ENVIRONMENT,
            message="QuickBooks credentials configured but not yet connected. Call /connect to start OAuth flow.",
        )

    return QuickBooksStatus(
        configured=True,
        connected=True,
        realm_id=token.realm_id,
        environment=token.environment,
        last_sync_at=token.last_sync_at,
        message=f"Connected to QuickBooks ({token.environment}). Realm: {token.realm_id}.",
    )


@router.get("/connect", response_model=QuickBooksConnectOut)
def quickbooks_connect(
    _=Depends(require_role("ADMIN", "MANAGER")),
):
    """
    Generate the QuickBooks OAuth 2.0 authorization URL.
    Direct the user's browser to the returned URL to grant access.
    """
    if not qb.is_configured():
        raise HTTPException(
            status_code=400,
            detail={
                "success": False,
                "error": {
                    "code": "QB_NOT_CONFIGURED",
                    "message": "Set QUICKBOOKS_CLIENT_ID and QUICKBOOKS_CLIENT_SECRET in .env first.",
                },
            },
        )
    auth_url = qb.get_authorization_url()
    return QuickBooksConnectOut(
        authorization_url=auth_url,
        message="Redirect the user to the authorization_url to grant QuickBooks access.",
    )


@router.get("/callback", response_model=QuickBooksTokenCallbackOut)
def quickbooks_callback(
    code: str = Query(..., description="OAuth authorization code from QuickBooks"),
    realm_id: str = Query(..., description="QuickBooks company (realm) ID"),
    state: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    """
    OAuth 2.0 callback endpoint.
    QuickBooks redirects here after the user grants access.
    Exchanges the authorization code for tokens.
    """
    if not qb.is_configured():
        raise HTTPException(status_code=400, detail="QuickBooks not configured.")

    try:
        token = qb.exchange_code_for_tokens(db, code, realm_id)
        return QuickBooksTokenCallbackOut(
            message="QuickBooks connected successfully.",
            realm_id=token.realm_id,
            environment=token.environment,
        )
    except Exception as exc:
        logger.exception("OAuth callback error: %s", exc)
        raise HTTPException(status_code=500, detail=f"OAuth exchange failed: {exc}") from exc


@router.post("/sync", response_model=QuickBooksSyncOut)
def quickbooks_sync(
    payload: QuickBooksSyncRequest = QuickBooksSyncRequest(),
    db: Session = Depends(get_db),
    _=Depends(require_role("ADMIN", "MANAGER")),
):
    """
    Trigger a QuickBooks data sync.
    In POC: returns a demo response.
    In production: fetches QB data and updates Fleet360 entities.
    """
    result = qb.sync_quickbooks(db, payload.sync_type)
    return QuickBooksSyncOut(**result)
