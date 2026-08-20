"""Fleet360 — Customer Analytics Service (Optimized)."""
import logging
from datetime import date
from typing import Optional

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.customer import Customer
from app.models.trip import Trip
from app.schemas.analytics import CustomerProfitability, CustomerRankingOut
from app.services import cost_allocation_service as ca
from app.utils.calculations import safe_divide

logger = logging.getLogger(__name__)


def _trip_filter(query, start_date, end_date):
    if start_date:
        query = query.filter(Trip.trip_date >= start_date)
    if end_date:
        query = query.filter(Trip.trip_date <= end_date)
    return query


def get_customer_profitability(
    db: Session,
    customer_id: int,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    rank: Optional[int] = None,
) -> Optional[CustomerProfitability]:
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        return None

    stats_q = db.query(
        func.count(Trip.id),
        func.sum(Trip.revenue),
        func.sum(Trip.service_hours)
    ).filter(Trip.customer_id == customer_id, Trip.status == "completed")
    stats_q = _trip_filter(stats_q, start_date, end_date)
    row = stats_q.first()

    total_trips = row[0] or 0
    contract_revenue = float(row[1] or 0.0)
    total_service_hours = float(row[2] or 0.0)

    # Direct cost (fuel) and allocated costs
    costs = ca.get_customer_costs(db, customer_id, start_date, end_date)
    direct_cost = costs["fuel_cost"]
    allocated_cost = costs["maintenance_cost"] + costs["driver_cost"] + costs["other_cost"]
    total_cost = direct_cost + allocated_cost

    contribution = contract_revenue - total_cost
    margin_pct = safe_divide(contribution, contract_revenue) * 100

    if customer.contract_value and customer.contract_value > 0:
        period_days = 365
        if start_date and end_date:
            period_days = max((end_date - start_date).days + 1, 1)
        prorated_contract = customer.contract_value * (period_days / 365)
        contract_performance = safe_divide(contract_revenue, prorated_contract) * 100
    else:
        contract_performance = 100.0

    return CustomerProfitability(
        customer_id=customer_id,
        customer_code=customer.customer_code,
        customer_name=customer.name,
        industry=customer.industry,
        contract_value=customer.contract_value,
        contract_revenue=round(contract_revenue, 2),
        direct_cost=round(direct_cost, 2),
        allocated_cost=round(allocated_cost, 2),
        total_cost=round(total_cost, 2),
        contribution=round(contribution, 2),
        margin_percentage=round(margin_pct, 2),
        total_trips=total_trips,
        total_service_hours=round(total_service_hours, 2),
        revenue_per_trip=round(safe_divide(contract_revenue, total_trips), 2),
        cost_per_trip=round(safe_divide(total_cost, total_trips), 2),
        contract_performance_pct=round(contract_performance, 2),
        profitability_rank=rank,
    )


def get_customer_ranking(
    db: Session,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
) -> CustomerRankingOut:
    customers = db.query(Customer).filter(Customer.status != "inactive").all()
    results = []
    for c in customers:
        p = get_customer_profitability(db, c.id, start_date, end_date)
        if p:
            results.append(p)

    results.sort(key=lambda x: x.contribution, reverse=True)
    for i, r in enumerate(results):
        r.profitability_rank = i + 1

    return CustomerRankingOut(
        total=len(results),
        period_start=str(start_date) if start_date else "all-time",
        period_end=str(end_date) if end_date else "all-time",
        customers=results,
    )
