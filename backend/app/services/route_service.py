"""Fleet360 — Route Analytics Service."""
import logging
from datetime import date
from typing import Optional

from sqlalchemy.orm import Session

from app.models.route import Route
from app.models.trip import Trip
from app.schemas.analytics import RouteProfitability, RouteRankingOut
from app.services import cost_allocation_service as ca
from app.utils.calculations import safe_divide, calc_utilization

logger = logging.getLogger(__name__)

AVAILABLE_TRIPS_PER_ROUTE_PER_DAY = 2.0   # operational assumption


def _trip_filter(query, start_date, end_date):
    if start_date:
        query = query.filter(Trip.trip_date >= start_date)
    if end_date:
        query = query.filter(Trip.trip_date <= end_date)
    return query


def get_route_profitability(
    db: Session,
    route_id: int,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    rank: Optional[int] = None,
) -> Optional[RouteProfitability]:
    route = db.query(Route).filter(Route.id == route_id).first()
    if not route:
        return None

    trips_q = db.query(Trip).filter(Trip.route_id == route_id, Trip.status == "completed")
    trips_q = _trip_filter(trips_q, start_date, end_date)
    trips = trips_q.all()

    total_trips = len(trips)
    total_revenue = sum(t.revenue for t in trips)
    total_distance = sum(t.distance_km for t in trips)
    total_service_hours = sum(t.service_hours for t in trips)

    # Allocated costs
    costs = ca.get_route_costs(db, route_id, start_date, end_date)
    total_cost = sum(costs.values())
    contribution = total_revenue - total_cost
    margin_pct = safe_divide(contribution, total_revenue) * 100

    # Period days for utilization
    period_days = 30
    if start_date and end_date:
        period_days = max((end_date - start_date).days + 1, 1)

    available_trips = period_days * AVAILABLE_TRIPS_PER_ROUTE_PER_DAY
    utilization = calc_utilization(total_trips, available_trips)

    return RouteProfitability(
        route_id=route_id,
        route_code=route.route_code,
        origin=route.origin,
        destination=route.destination,
        distance_km=route.distance_km,
        total_revenue=round(total_revenue, 2),
        allocated_vehicle_cost=0.0,  # rolled into fuel + maintenance below
        allocated_driver_cost=round(costs["driver_cost"], 2),
        allocated_fuel_cost=round(costs["fuel_cost"], 2),
        allocated_maintenance_cost=round(costs["maintenance_cost"], 2),
        other_cost=round(costs["other_cost"], 2),
        total_route_cost=round(total_cost, 2),
        contribution=round(contribution, 2),
        margin_percentage=round(margin_pct, 2),
        total_trips=total_trips,
        total_distance_km=round(total_distance, 2),
        revenue_per_km=round(safe_divide(total_revenue, total_distance), 2),
        cost_per_km=round(safe_divide(total_cost, total_distance), 2),
        avg_revenue_per_trip=round(safe_divide(total_revenue, total_trips), 2),
        utilization_percentage=round(utilization, 2),
        profitability_rank=rank,
    )


def get_route_ranking(
    db: Session,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
) -> RouteRankingOut:
    routes = db.query(Route).filter(Route.status == "active").all()
    results = []
    for r in routes:
        p = get_route_profitability(db, r.id, start_date, end_date)
        if p:
            results.append(p)

    results.sort(key=lambda x: x.contribution, reverse=True)
    for i, r in enumerate(results):
        r.profitability_rank = i + 1

    return RouteRankingOut(
        total=len(results),
        period_start=str(start_date) if start_date else "all-time",
        period_end=str(end_date) if end_date else "all-time",
        routes=results,
    )
