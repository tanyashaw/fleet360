"""Fleet360 — Vehicle Routes."""
import logging
from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.vehicle import Vehicle
from app.schemas.vehicle import VehicleOut, VehicleListOut
from app.schemas.analytics import VehicleProfitability, VehicleRankingOut
from app.services.vehicle_service import get_vehicle_profitability, get_vehicle_ranking

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/vehicles", tags=["Vehicles"])


def _not_found(vehicle_id: int):
    raise HTTPException(
        status_code=404,
        detail={
            "success": False,
            "error": {
                "code": "VEHICLE_NOT_FOUND",
                "message": f"Vehicle with ID {vehicle_id} was not found.",
            },
        },
    )


@router.get("", response_model=VehicleListOut)
def list_vehicles(
    status: Optional[str] = Query(None, description="Filter by status (active/inactive/maintenance)"),
    branch_id: Optional[str] = Query(None, description="Filter by branch"),
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    """List all vehicles with optional filters."""
    q = db.query(Vehicle)
    if status:
        q = q.filter(Vehicle.status == status)
    if branch_id:
        q = q.filter(Vehicle.branch_id == branch_id)
    vehicles = q.all()
    return VehicleListOut(total=len(vehicles), vehicles=vehicles)


@router.get("/profitability/ranking", response_model=VehicleRankingOut)
def vehicle_ranking(
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    """Vehicle profitability ranking — sorted by contribution (highest first)."""
    if start_date is None:
        start_date = date(2026, 8, 1)
    if end_date is None:
        end_date = date(2026, 8, 20)
    return get_vehicle_ranking(db, start_date, end_date)


@router.get("/{vehicle_id}", response_model=VehicleOut)
def get_vehicle(
    vehicle_id: int,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    """Get a single vehicle's master data."""
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not vehicle:
        _not_found(vehicle_id)
    return vehicle


@router.get("/{vehicle_id}/profitability", response_model=VehicleProfitability)
def vehicle_profitability(
    vehicle_id: int,
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    """Full P&L for a single vehicle."""
    result = get_vehicle_profitability(db, vehicle_id, start_date, end_date)
    if not result:
        _not_found(vehicle_id)
    return result
