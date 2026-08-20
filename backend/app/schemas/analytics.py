"""Fleet360 — Analytics Pydantic Schemas.
All monetary values are in INR.
"""
from typing import Optional
from pydantic import BaseModel, field_validator


# ── Dashboard ─────────────────────────────────────────────────────────────────

class DashboardSummary(BaseModel):
    period: str                     # e.g. "2026-08"
    start_date: str
    end_date: str
    revenue: float
    operating_cost: float
    contribution: float
    margin_percentage: float
    total_vehicles: int
    active_vehicles: int
    vehicle_utilization: float      # fleet average %
    total_trips: int
    total_distance_km: float
    revenue_per_km: float
    cost_per_km: float
    fuel_cost: float
    maintenance_cost: float
    driver_cost: float
    other_cost: float


class MonthlyTrend(BaseModel):
    month: str                      # "2026-07"
    revenue: float
    operating_cost: float
    contribution: float
    margin_percentage: float
    total_trips: int


class DashboardTrendOut(BaseModel):
    months: list[MonthlyTrend]


# ── Vehicle Profitability ─────────────────────────────────────────────────────

class VehicleProfitability(BaseModel):
    vehicle_id: int
    vehicle_number: str
    vehicle_type: str
    branch_id: str
    revenue: float
    fuel_cost: float
    maintenance_cost: float
    driver_cost: float
    other_cost: float
    operating_cost: float
    contribution: float
    margin_percentage: float
    total_trips: int
    total_distance_km: float
    total_service_hours: float
    revenue_per_km: float
    cost_per_km: float
    fuel_efficiency_kmpl: float
    utilization_percentage: float
    downtime_days: float
    profitability_rank: Optional[int] = None


class VehicleRankingOut(BaseModel):
    total: int
    period_start: str
    period_end: str
    vehicles: list[VehicleProfitability]


# ── Route Profitability ───────────────────────────────────────────────────────

class RouteProfitability(BaseModel):
    route_id: int
    route_code: str
    origin: str
    destination: str
    distance_km: float
    total_revenue: float
    allocated_vehicle_cost: float
    allocated_driver_cost: float
    allocated_fuel_cost: float
    allocated_maintenance_cost: float
    other_cost: float
    total_route_cost: float
    contribution: float
    margin_percentage: float
    total_trips: int
    total_distance_km: float
    revenue_per_km: float
    cost_per_km: float
    avg_revenue_per_trip: float
    utilization_percentage: float
    profitability_rank: Optional[int] = None


class RouteRankingOut(BaseModel):
    total: int
    period_start: str
    period_end: str
    routes: list[RouteProfitability]


# ── Customer Profitability ────────────────────────────────────────────────────

class CustomerProfitability(BaseModel):
    customer_id: int
    customer_code: str
    customer_name: str
    industry: Optional[str] = None
    contract_value: Optional[float] = None
    contract_revenue: float          # actual revenue in period
    direct_cost: float
    allocated_cost: float
    total_cost: float
    contribution: float
    margin_percentage: float
    total_trips: int
    total_service_hours: float
    revenue_per_trip: float
    cost_per_trip: float
    contract_performance_pct: float  # actual vs contract value
    profitability_rank: Optional[int] = None


class CustomerRankingOut(BaseModel):
    total: int
    period_start: str
    period_end: str
    customers: list[CustomerProfitability]


# ── Driver Performance / Scorecard ────────────────────────────────────────────

class DriverPerformance(BaseModel):
    driver_id: int
    employee_code: str
    driver_name: str
    branch_id: str
    monthly_salary: float
    total_trips: int
    total_service_hours: float
    total_distance_km: float
    attendance_percentage: float
    overtime_hours: float
    driver_cost: float              # salary + overtime
    cost_per_trip: float
    revenue_generated: float
    productivity_score: float       # 0–100
    utilization_score: float        # 0–100
    attendance_score: float         # 0–100
    cost_efficiency_score: float    # 0–100
    overall_score: float            # 0–100 composite
    rank: Optional[int] = None


class DriverScorecardOut(BaseModel):
    total: int
    period_start: str
    period_end: str
    fleet_avg_score: float
    drivers: list[DriverPerformance]
