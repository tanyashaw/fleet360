"""Fleet360 — Driver Analytics Service."""
import logging
from datetime import date
from typing import Optional

from sqlalchemy.orm import Session

from app.models.driver import Driver
from app.models.trip import Trip
from app.schemas.analytics import DriverPerformance, DriverScorecardOut
from app.utils.calculations import safe_divide, normalize_score

logger = logging.getLogger(__name__)

AVAILABLE_HOURS_PER_DAY = 8.0        # working hours per day
EXPECTED_TRIPS_PER_DAY = 2.0         # benchmark trips per driver per working day


def _period_days(start_date: Optional[date], end_date: Optional[date]) -> int:
    if start_date and end_date:
        return max((end_date - start_date).days + 1, 1)
    return 365


def _trip_filter(query, start_date, end_date):
    if start_date:
        query = query.filter(Trip.trip_date >= start_date)
    if end_date:
        query = query.filter(Trip.trip_date <= end_date)
    return query


def get_driver_performance(
    db: Session,
    driver_id: int,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    rank: Optional[int] = None,
) -> Optional[DriverPerformance]:
    driver = db.query(Driver).filter(Driver.id == driver_id).first()
    if not driver:
        return None

    trips_q = db.query(Trip).filter(Trip.driver_id == driver_id, Trip.status == "completed")
    trips_q = _trip_filter(trips_q, start_date, end_date)
    trips = trips_q.all()

    total_trips = len(trips)
    total_service_hours = sum(t.service_hours for t in trips)
    total_distance = sum(t.distance_km for t in trips)
    revenue_generated = sum(t.revenue for t in trips)

    period_days = _period_days(start_date, end_date)
    # Working days (exclude weekends approx — use 5/7 ratio)
    working_days = period_days * (5 / 7)
    available_hours = working_days * AVAILABLE_HOURS_PER_DAY

    # Attendance: estimate from actual service days
    actual_service_days = len({t.trip_date for t in trips})
    attendance_pct = safe_divide(actual_service_days, working_days) * 100
    attendance_pct = min(attendance_pct, 100.0)

    overtime_hours = max(total_service_hours - available_hours, 0.0)
    driver_cost = driver.salary * (period_days / 30)   # pro-rate by period

    cost_per_trip = safe_divide(driver_cost, total_trips)

    # ── Scoring (0–100 each component) ────────────────────────────────────────
    # 1. Productivity: actual trips vs expected trips
    expected_trips = working_days * EXPECTED_TRIPS_PER_DAY
    productivity_score = normalize_score(total_trips, 0, expected_trips)

    # 2. Utilization: service hours vs available hours
    utilization_score = normalize_score(total_service_hours, 0, available_hours)

    # 3. Attendance
    attendance_score = min(attendance_pct, 100.0)

    # 4. Cost Efficiency: revenue generated per unit of driver cost
    #    benchmark: revenue should be at least 3× driver cost
    cost_efficiency_score = normalize_score(revenue_generated, 0, driver_cost * 4)

    # 5. Composite overall score (equal weights for POC)
    overall_score = (
        productivity_score * 0.30
        + utilization_score * 0.25
        + attendance_score * 0.20
        + cost_efficiency_score * 0.25
    )

    return DriverPerformance(
        driver_id=driver_id,
        employee_code=driver.employee_code,
        driver_name=driver.name,
        branch_id=driver.branch_id,
        monthly_salary=driver.salary,
        total_trips=total_trips,
        total_service_hours=round(total_service_hours, 2),
        total_distance_km=round(total_distance, 2),
        attendance_percentage=round(attendance_pct, 2),
        overtime_hours=round(overtime_hours, 2),
        driver_cost=round(driver_cost, 2),
        cost_per_trip=round(cost_per_trip, 2),
        revenue_generated=round(revenue_generated, 2),
        productivity_score=round(productivity_score, 2),
        utilization_score=round(utilization_score, 2),
        attendance_score=round(attendance_score, 2),
        cost_efficiency_score=round(cost_efficiency_score, 2),
        overall_score=round(overall_score, 2),
        rank=rank,
    )


def get_driver_scorecard(
    db: Session,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
) -> DriverScorecardOut:
    drivers = db.query(Driver).filter(Driver.status == "active").all()
    results = []
    for d in drivers:
        p = get_driver_performance(db, d.id, start_date, end_date)
        if p:
            results.append(p)

    results.sort(key=lambda x: x.overall_score, reverse=True)
    for i, r in enumerate(results):
        r.rank = i + 1

    fleet_avg = safe_divide(sum(r.overall_score for r in results), len(results))

    return DriverScorecardOut(
        total=len(results),
        period_start=str(start_date) if start_date else "all-time",
        period_end=str(end_date) if end_date else "all-time",
        fleet_avg_score=round(fleet_avg, 2),
        drivers=results,
    )
