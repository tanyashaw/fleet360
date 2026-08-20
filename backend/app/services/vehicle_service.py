"""Fleet360 — Vehicle Analytics Service."""
import logging
from datetime import date
from typing import Optional

from sqlalchemy.orm import Session

from app.models.vehicle import Vehicle
from app.models.trip import Trip
from app.models.fuel import FuelRecord
from app.schemas.analytics import VehicleProfitability, VehicleRankingOut
from app.services import cost_allocation_service as ca
from app.utils.calculations import safe_divide, calc_utilization

logger = logging.getLogger(__name__)

# Available service hours per day per vehicle (operational assumption)
AVAILABLE_HOURS_PER_DAY = 16.0


def _period_days(start_date: Optional[date], end_date: Optional[date]) -> int:
    if start_date and end_date:
        return max((end_date - start_date).days + 1, 1)
    return 365  # default full year


def get_vehicle_profitability(
    db: Session,
    vehicle_id: int,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    rank: Optional[int] = None,
) -> Optional[VehicleProfitability]:
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not vehicle:
        return None

    # ── Trips ─────────────────────────────────────────────────────────────
    trips_q = db.query(Trip).filter(Trip.vehicle_id == vehicle_id, Trip.status == "completed")
    if start_date:
        trips_q = trips_q.filter(Trip.trip_date >= start_date)
    if end_date:
        trips_q = trips_q.filter(Trip.trip_date <= end_date)
    trips = trips_q.all()

    total_trips = len(trips)
    total_distance = sum(t.distance_km for t in trips)
    total_service_hours = sum(t.service_hours for t in trips)
    revenue = sum(t.revenue for t in trips)

    # ── Costs ─────────────────────────────────────────────────────────────
    fuel_cost = ca.get_vehicle_fuel_cost(db, vehicle_id, start_date, end_date)
    maintenance_cost = ca.get_vehicle_maintenance_cost(db, vehicle_id, start_date, end_date)
    driver_cost = ca.get_vehicle_driver_cost(db, vehicle_id, start_date, end_date)
    other_cost = ca.get_vehicle_other_costs(db, vehicle_id, start_date, end_date)
    operating_cost = fuel_cost + maintenance_cost + driver_cost + other_cost

    # ── KPIs ──────────────────────────────────────────────────────────────
    contribution = revenue - operating_cost
    margin_pct = safe_divide(contribution, revenue) * 100

    revenue_per_km = safe_divide(revenue, total_distance)
    cost_per_km = safe_divide(operating_cost, total_distance)

    # Fuel efficiency: km / liters consumed
    fuel_q = db.query(FuelRecord).filter(FuelRecord.vehicle_id == vehicle_id)
    if start_date:
        fuel_q = fuel_q.filter(FuelRecord.date >= start_date)
    if end_date:
        fuel_q = fuel_q.filter(FuelRecord.date <= end_date)
    fuel_records = fuel_q.all()
    total_liters = sum(r.liters for r in fuel_records)
    fuel_efficiency = safe_divide(total_distance, total_liters)

    # Utilization
    downtime = ca.get_vehicle_downtime(db, vehicle_id, start_date, end_date)
    period_days = _period_days(start_date, end_date)
    available_hours = (period_days - downtime) * AVAILABLE_HOURS_PER_DAY
    utilization = calc_utilization(total_service_hours, available_hours)

    return VehicleProfitability(
        vehicle_id=vehicle_id,
        vehicle_number=vehicle.vehicle_number,
        vehicle_type=vehicle.vehicle_type,
        branch_id=vehicle.branch_id,
        revenue=round(revenue, 2),
        fuel_cost=round(fuel_cost, 2),
        maintenance_cost=round(maintenance_cost, 2),
        driver_cost=round(driver_cost, 2),
        other_cost=round(other_cost, 2),
        operating_cost=round(operating_cost, 2),
        contribution=round(contribution, 2),
        margin_percentage=round(margin_pct, 2),
        total_trips=total_trips,
        total_distance_km=round(total_distance, 2),
        total_service_hours=round(total_service_hours, 2),
        revenue_per_km=round(revenue_per_km, 2),
        cost_per_km=round(cost_per_km, 2),
        fuel_efficiency_kmpl=round(fuel_efficiency, 2),
        utilization_percentage=round(utilization, 2),
        downtime_days=round(downtime, 1),
        profitability_rank=rank,
    )


def get_vehicle_ranking(
    db: Session,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
) -> VehicleRankingOut:
    vehicles = db.query(Vehicle).filter(Vehicle.status != "inactive").all()

    results = []
    for v in vehicles:
        p = get_vehicle_profitability(db, v.id, start_date, end_date)
        if p:
            results.append(p)

    # Rank by contribution (descending)
    results.sort(key=lambda x: x.contribution, reverse=True)
    for i, r in enumerate(results):
        r.profitability_rank = i + 1

    return VehicleRankingOut(
        total=len(results),
        period_start=str(start_date) if start_date else "all-time",
        period_end=str(end_date) if end_date else "all-time",
        vehicles=results,
    )
