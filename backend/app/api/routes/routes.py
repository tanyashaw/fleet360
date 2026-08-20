"""Fleet360 — Route API Routes."""
import logging
from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.route import Route
from app.schemas.route import RouteOut, RouteListOut
from app.schemas.analytics import RouteProfitability, RouteRankingOut
from app.services.route_service import get_route_profitability, get_route_ranking

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/routes", tags=["Routes"])


def _not_found(route_id: int):
    raise HTTPException(
        status_code=404,
        detail={
            "success": False,
            "error": {
                "code": "ROUTE_NOT_FOUND",
                "message": f"Route with ID {route_id} was not found.",
            },
        },
    )


@router.get("", response_model=RouteListOut)
def list_routes(
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    """List all routes."""
    q = db.query(Route)
    if status:
        q = q.filter(Route.status == status)
    routes = q.all()
    return RouteListOut(total=len(routes), routes=routes)


@router.get("/profitability/ranking", response_model=RouteRankingOut)
def route_ranking(
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    """Route profitability ranking — sorted by contribution."""
    if start_date is None:
        start_date = date(2026, 8, 1)
    if end_date is None:
        end_date = date(2026, 8, 20)
    return get_route_ranking(db, start_date, end_date)


@router.get("/{route_id}", response_model=RouteOut)
def get_route(
    route_id: int,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    """Get a single route's master data."""
    route = db.query(Route).filter(Route.id == route_id).first()
    if not route:
        _not_found(route_id)
    return route


@router.get("/{route_id}/profitability", response_model=RouteProfitability)
def route_profitability(
    route_id: int,
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    """Full P&L for a single route."""
    result = get_route_profitability(db, route_id, start_date, end_date)
    if not result:
        _not_found(route_id)
    return result
