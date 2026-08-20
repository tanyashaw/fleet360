"""Fleet360 — Driver Routes."""
import logging
from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.driver import Driver
from app.schemas.driver import DriverOut, DriverListOut
from app.schemas.analytics import DriverPerformance, DriverScorecardOut
from app.services.driver_service import get_driver_performance, get_driver_scorecard

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/drivers", tags=["Drivers"])


def _not_found(driver_id: int):
    raise HTTPException(
        status_code=404,
        detail={
            "success": False,
            "error": {
                "code": "DRIVER_NOT_FOUND",
                "message": f"Driver with ID {driver_id} was not found.",
            },
        },
    )


@router.get("", response_model=DriverListOut)
def list_drivers(
    status: Optional[str] = Query(None),
    branch_id: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    """List all drivers."""
    q = db.query(Driver)
    if status:
        q = q.filter(Driver.status == status)
    if branch_id:
        q = q.filter(Driver.branch_id == branch_id)
    drivers = q.all()
    return DriverListOut(total=len(drivers), drivers=drivers)


@router.get("/scorecard", response_model=DriverScorecardOut)
def driver_scorecard(
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    """Full driver productivity scorecard — ranked by overall score."""
    return get_driver_scorecard(db, start_date, end_date)


@router.get("/{driver_id}", response_model=DriverOut)
def get_driver(
    driver_id: int,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    """Get a single driver's master data."""
    driver = db.query(Driver).filter(Driver.id == driver_id).first()
    if not driver:
        _not_found(driver_id)
    return driver


@router.get("/{driver_id}/performance", response_model=DriverPerformance)
def driver_performance(
    driver_id: int,
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    """Individual driver performance analysis."""
    result = get_driver_performance(db, driver_id, start_date, end_date)
    if not result:
        _not_found(driver_id)
    return result
