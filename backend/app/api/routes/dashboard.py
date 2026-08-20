"""Fleet360 — Executive Dashboard Routes."""
import logging
from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.services.analytics_service import get_dashboard_summary, get_monthly_trend
from app.schemas.analytics import DashboardSummary, DashboardTrendOut

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/summary", response_model=DashboardSummary)
def dashboard_summary(
    start_date: Optional[date] = Query(None, description="Filter start date (YYYY-MM-DD)"),
    end_date: Optional[date] = Query(None, description="Filter end date (YYYY-MM-DD)"),
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    """
    Executive fleet summary — revenue, operating cost, contribution, utilization.
    Supports optional date range filtering.
    """
    return get_dashboard_summary(db, start_date, end_date)


@router.get("/trend", response_model=DashboardTrendOut)
def dashboard_trend(
    months: int = Query(12, ge=1, le=24, description="Number of months of trend data"),
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    """Monthly KPI trend for the last N months."""
    return get_monthly_trend(db, months)
