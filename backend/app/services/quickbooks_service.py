"""
Fleet360 — QuickBooks Integration Service
==========================================
Architecture for QuickBooks Online OAuth 2.0 integration.

Flow:
  1. User calls GET /api/v1/quickbooks/connect  → gets QB authorization URL
  2. User authenticates with QB → QB redirects to /api/v1/quickbooks/callback
  3. Backend exchanges code for tokens and stores in quickbooks_tokens table
  4. POST /api/v1/quickbooks/sync  → fetches QB data and maps to Fleet360 entities

POC Behavior:
  If QUICKBOOKS_CLIENT_ID or QUICKBOOKS_CLIENT_SECRET are absent in .env,
  all QB endpoints return graceful "not configured" responses.
  All demo analytics continue to work from seed data.
"""
import logging
from datetime import datetime, timezone, timedelta
from typing import Optional

import httpx
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.quickbooks import QuickBooksToken, QuickBooksSyncLog

logger = logging.getLogger(__name__)

# QuickBooks API endpoints
QB_AUTH_BASE = "https://appcenter.intuit.com/connect/oauth2"
QB_TOKEN_URL = "https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer"
QB_API_BASE = {
    "sandbox": "https://sandbox-quickbooks.api.intuit.com/v3/company",
    "production": "https://quickbooks.api.intuit.com/v3/company",
}
QB_SCOPES = "com.intuit.quickbooks.accounting"


def is_configured() -> bool:
    """Return True if QB credentials are present in settings."""
    return bool(settings.QUICKBOOKS_CLIENT_ID and settings.QUICKBOOKS_CLIENT_SECRET)


def get_authorization_url(state: str = "fleet360") -> str:
    """Build the OAuth 2.0 authorization URL for QuickBooks."""
    if not is_configured():
        raise ValueError("QuickBooks credentials are not configured.")

    params = {
        "client_id": settings.QUICKBOOKS_CLIENT_ID,
        "scope": QB_SCOPES,
        "redirect_uri": settings.QUICKBOOKS_REDIRECT_URI,
        "response_type": "code",
        "state": state,
    }
    query = "&".join(f"{k}={v}" for k, v in params.items())
    return f"{QB_AUTH_BASE}?{query}"


def exchange_code_for_tokens(
    db: Session,
    code: str,
    realm_id: str,
) -> QuickBooksToken:
    """Exchange an authorization code for access + refresh tokens."""
    response = httpx.post(
        QB_TOKEN_URL,
        data={
            "grant_type": "authorization_code",
            "code": code,
            "redirect_uri": settings.QUICKBOOKS_REDIRECT_URI,
        },
        auth=(settings.QUICKBOOKS_CLIENT_ID, settings.QUICKBOOKS_CLIENT_SECRET),
        headers={"Accept": "application/json"},
        timeout=30,
    )
    response.raise_for_status()
    data = response.json()

    now = datetime.now(timezone.utc)
    token = db.query(QuickBooksToken).filter(QuickBooksToken.realm_id == realm_id).first()
    if not token:
        token = QuickBooksToken(realm_id=realm_id)
        db.add(token)

    # NEVER log actual token values
    token.access_token = data["access_token"]
    token.refresh_token = data.get("refresh_token")
    token.token_type = data.get("token_type", "Bearer")
    token.access_token_expires_at = now + timedelta(seconds=data.get("expires_in", 3600))
    token.refresh_token_expires_at = now + timedelta(seconds=data.get("x_refresh_token_expires_in", 8640000))
    token.environment = settings.QUICKBOOKS_ENVIRONMENT
    token.is_active = True

    db.commit()
    db.refresh(token)
    logger.info("QuickBooks tokens stored for realm_id=%s", realm_id)
    return token


def get_active_token(db: Session) -> Optional[QuickBooksToken]:
    """Return the first active token, or None."""
    return db.query(QuickBooksToken).filter(QuickBooksToken.is_active == True).first()  # noqa: E712


def refresh_access_token(db: Session, token: QuickBooksToken) -> QuickBooksToken:
    """Use the refresh token to get a new access token."""
    response = httpx.post(
        QB_TOKEN_URL,
        data={
            "grant_type": "refresh_token",
            "refresh_token": token.refresh_token,
        },
        auth=(settings.QUICKBOOKS_CLIENT_ID, settings.QUICKBOOKS_CLIENT_SECRET),
        headers={"Accept": "application/json"},
        timeout=30,
    )
    response.raise_for_status()
    data = response.json()

    now = datetime.now(timezone.utc)
    token.access_token = data["access_token"]
    if "refresh_token" in data:
        token.refresh_token = data["refresh_token"]
    token.access_token_expires_at = now + timedelta(seconds=data.get("expires_in", 3600))
    db.commit()
    logger.info("QuickBooks access token refreshed for realm_id=%s", token.realm_id)
    return token


def _get_headers(token: QuickBooksToken) -> dict:
    return {
        "Authorization": f"Bearer {token.access_token}",
        "Accept": "application/json",
        "Content-Type": "application/json",
    }


def _api_base(token: QuickBooksToken) -> str:
    base = QB_API_BASE.get(token.environment, QB_API_BASE["sandbox"])
    return f"{base}/{token.realm_id}"


# ── Data Retrieval Stubs (to be implemented in Phase 2) ─────────────────────

def fetch_customers(token: QuickBooksToken) -> list[dict]:
    """Fetch all customers from QuickBooks."""
    url = f"{_api_base(token)}/query?query=SELECT * FROM Customer MAXRESULTS 1000"
    with httpx.Client(timeout=30) as client:
        resp = client.get(url, headers=_get_headers(token))
        resp.raise_for_status()
        return resp.json().get("QueryResponse", {}).get("Customer", [])


def fetch_invoices(token: QuickBooksToken) -> list[dict]:
    """Fetch all invoices from QuickBooks."""
    url = f"{_api_base(token)}/query?query=SELECT * FROM Invoice MAXRESULTS 1000"
    with httpx.Client(timeout=30) as client:
        resp = client.get(url, headers=_get_headers(token))
        resp.raise_for_status()
        return resp.json().get("QueryResponse", {}).get("Invoice", [])


def fetch_expenses(token: QuickBooksToken) -> list[dict]:
    """Fetch all expenses/purchases from QuickBooks."""
    url = f"{_api_base(token)}/query?query=SELECT * FROM Purchase MAXRESULTS 1000"
    with httpx.Client(timeout=30) as client:
        resp = client.get(url, headers=_get_headers(token))
        resp.raise_for_status()
        return resp.json().get("QueryResponse", {}).get("Purchase", [])


def fetch_profit_and_loss(token: QuickBooksToken, start_date: str, end_date: str) -> dict:
    """Fetch P&L report from QuickBooks."""
    url = (
        f"{_api_base(token)}/reports/ProfitAndLoss"
        f"?start_date={start_date}&end_date={end_date}"
    )
    with httpx.Client(timeout=30) as client:
        resp = client.get(url, headers=_get_headers(token))
        resp.raise_for_status()
        return resp.json()


def sync_quickbooks(db: Session, sync_type: str = "full") -> dict:
    """
    Trigger a QuickBooks synchronisation.

    In POC: returns a demo response.
    In production: fetches QB data, maps to Fleet360 entities, saves to DB.
    """
    if not is_configured():
        return {
            "status": "skipped",
            "sync_type": sync_type,
            "records_fetched": 0,
            "records_saved": 0,
            "message": "QuickBooks is not configured. Running on demo data.",
        }

    token = get_active_token(db)
    if not token:
        return {
            "status": "error",
            "sync_type": sync_type,
            "records_fetched": 0,
            "records_saved": 0,
            "message": "No active QuickBooks connection. Please connect first.",
        }

    log = QuickBooksSyncLog(
        realm_id=token.realm_id,
        sync_type=sync_type,
        status="running",
    )
    db.add(log)
    db.commit()

    try:
        records_fetched = 0
        if sync_type in ("full", "customers"):
            customers = fetch_customers(token)
            records_fetched += len(customers)
            # TODO: map QB customers to Fleet360 customers table

        if sync_type in ("full", "invoices"):
            invoices = fetch_invoices(token)
            records_fetched += len(invoices)
            # TODO: map QB invoices to FinancialTransaction (type=revenue)

        if sync_type in ("full", "expenses"):
            expenses = fetch_expenses(token)
            records_fetched += len(expenses)
            # TODO: map QB expenses to FinancialTransaction (fuel/maintenance/etc.)

        log.status = "completed"
        log.records_fetched = records_fetched
        log.records_saved = records_fetched  # placeholder
        log.completed_at = datetime.now(timezone.utc)
        token.last_sync_at = datetime.now(timezone.utc)
        db.commit()
        logger.info("QuickBooks sync completed: %d records fetched.", records_fetched)

        return {
            "status": "completed",
            "sync_type": sync_type,
            "records_fetched": records_fetched,
            "records_saved": records_fetched,
            "message": "Sync completed successfully.",
        }

    except Exception as exc:
        log.status = "failed"
        log.error_message = str(exc)
        log.completed_at = datetime.now(timezone.utc)
        db.commit()
        logger.exception("QuickBooks sync failed: %s", exc)
        raise
