"""Fleet360 — Analytics Service (Executive Dashboard).
Provides fleet-wide KPIs and monthly trend data.
"""
import logging
from datetime import date
from typing import Optional
from calendar import monthrange

from sqlalchemy.orm import Session

from app.models.vehicle import Vehicle
from app.models.trip import Trip
from app.models.transaction import FinancialTransaction
from app.models.fuel import FuelRecord
from app.models.maintenance import MaintenanceRecord
from app.schemas.analytics import DashboardSummary, DashboardTrendOut, MonthlyTrend
from app.utils.calculations import safe_divide

logger = logging.getLogger(__name__)


def _apply_date(query, model, col_name: str, start_date, end_date):
    col = getattr(model, col_name)
    if start_date:
        query = query.filter(col >= start_date)
    if end_date:
        query = query.filter(col <= end_date)
    return query


def get_dashboard_summary(
    db: Session,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
) -> DashboardSummary:
    # ── Revenue ────────────────────────────────────────────────────────────
    trips_q = db.query(Trip).filter(Trip.status == "completed")
    trips_q = _apply_date(trips_q, Trip, "trip_date", start_date, end_date)
    trips = trips_q.all()

    revenue = sum(t.revenue for t in trips)
    total_trips = len(trips)
    total_distance = sum(t.distance_km for t in trips)

    # ── Costs ──────────────────────────────────────────────────────────────
    fuel_q = db.query(FuelRecord)
    fuel_q = _apply_date(fuel_q, FuelRecord, "date", start_date, end_date)
    fuel_cost = sum(r.amount for r in fuel_q.all())

    maint_q = db.query(MaintenanceRecord)
    maint_q = _apply_date(maint_q, MaintenanceRecord, "date", start_date, end_date)
    maintenance_cost = sum(r.amount for r in maint_q.all())

    salary_q = (
        db.query(FinancialTransaction)
        .filter(FinancialTransaction.transaction_type == "salary")
    )
    salary_q = _apply_date(salary_q, FinancialTransaction, "transaction_date", start_date, end_date)
    driver_cost = sum(t.amount for t in salary_q.all())

    other_q = (
        db.query(FinancialTransaction)
        .filter(FinancialTransaction.transaction_type.in_(["insurance", "toll", "other_operating_cost"]))
    )
    other_q = _apply_date(other_q, FinancialTransaction, "transaction_date", start_date, end_date)
    other_cost = sum(t.amount for t in other_q.all())

    operating_cost = fuel_cost + maintenance_cost + driver_cost + other_cost
    contribution = revenue - operating_cost
    margin_pct = safe_divide(contribution, revenue) * 100

    # ── Vehicles ───────────────────────────────────────────────────────────
    total_vehicles = db.query(Vehicle).count()
    active_vehicles = db.query(Vehicle).filter(Vehicle.status == "active").count()

    # Fleet utilization: average across all active vehicles
    # Simple proxy: service hours / (period_days × active_vehicles × 16h)
    total_service_hours = sum(t.service_hours for t in trips)
    period_days = 30
    if start_date and end_date:
        period_days = max((end_date - start_date).days + 1, 1)
    available_hours = period_days * active_vehicles * 16
    vehicle_utilization = safe_divide(total_service_hours, available_hours) * 100

    # Period label
    if start_date and end_date:
        period = f"{start_date.year}-{start_date.month:02d}"
    else:
        period = "all-time"

    return DashboardSummary(
        period=period,
        start_date=str(start_date) if start_date else "all-time",
        end_date=str(end_date) if end_date else "all-time",
        revenue=round(revenue, 2),
        operating_cost=round(operating_cost, 2),
        contribution=round(contribution, 2),
        margin_percentage=round(margin_pct, 2),
        total_vehicles=total_vehicles,
        active_vehicles=active_vehicles,
        vehicle_utilization=round(min(vehicle_utilization, 100.0), 2),
        total_trips=total_trips,
        total_distance_km=round(total_distance, 2),
        revenue_per_km=round(safe_divide(revenue, total_distance), 2),
        cost_per_km=round(safe_divide(operating_cost, total_distance), 2),
        fuel_cost=round(fuel_cost, 2),
        maintenance_cost=round(maintenance_cost, 2),
        driver_cost=round(driver_cost, 2),
        other_cost=round(other_cost, 2),
    )


def get_monthly_trend(db: Session, months: int = 12) -> DashboardTrendOut:
    """Return monthly KPIs for the last N months."""
    from datetime import date as date_cls
    import calendar

    today = date_cls.today()
    trend = []

    for i in range(months - 1, -1, -1):
        # Calculate year/month
        month = today.month - i
        year = today.year
        while month <= 0:
            month += 12
            year -= 1

        _, last_day = calendar.monthrange(year, month)
        m_start = date_cls(year, month, 1)
        m_end = date_cls(year, month, last_day)

        summary = get_dashboard_summary(db, m_start, m_end)
        trend.append(
            MonthlyTrend(
                month=f"{year}-{month:02d}",
                revenue=summary.revenue,
                operating_cost=summary.operating_cost,
                contribution=summary.contribution,
                margin_percentage=summary.margin_percentage,
                total_trips=summary.total_trips,
            )
        )

    return DashboardTrendOut(months=trend)
