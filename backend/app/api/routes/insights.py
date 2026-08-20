"""Fleet360 — AI Insights Routes."""
import logging
from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.schemas.insight import InsightListOut
from app.services.ai_insight_service import generate_insights

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/insights", tags=["AI Insights"])


def _insights(
    entity_type: Optional[str],
    start_date: Optional[date],
    end_date: Optional[date],
    db: Session,
) -> InsightListOut:
    return generate_insights(db, entity_type=entity_type, start_date=start_date, end_date=end_date)


@router.get("", response_model=InsightListOut)
def all_insights(
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    """All AI-generated insights across vehicles, routes, customers, and drivers."""
    return _insights(None, start_date, end_date, db)


@router.get("/vehicles", response_model=InsightListOut)
def vehicle_insights(
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    """AI insights scoped to vehicle performance."""
    return _insights("vehicle", start_date, end_date, db)


@router.get("/routes", response_model=InsightListOut)
def route_insights(
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    """AI insights scoped to route profitability."""
    return _insights("route", start_date, end_date, db)


@router.get("/customers", response_model=InsightListOut)
def customer_insights(
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    """AI insights scoped to customer contracts."""
    return _insights("customer", start_date, end_date, db)


@router.get("/drivers", response_model=InsightListOut)
def driver_insights(
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    """AI insights scoped to driver productivity."""
    return _insights("driver", start_date, end_date, db)
