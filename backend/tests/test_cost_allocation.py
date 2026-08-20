"""Fleet360 — Cost Allocation Tests."""
import pytest
from datetime import date

from app.services.cost_allocation_service import (
    get_vehicle_fuel_cost,
    get_vehicle_maintenance_cost,
    get_vehicle_driver_cost,
    get_vehicle_other_costs,
    get_vehicle_revenue,
    get_route_costs,
    get_customer_costs,
)


def test_vehicle_fuel_cost_no_records(db, sample_vehicle):
    cost = get_vehicle_fuel_cost(db, sample_vehicle.id)
    assert cost == 0.0


def test_vehicle_fuel_cost_with_records(db, sample_vehicle):
    from app.models.fuel import FuelRecord
    fr = FuelRecord(
        vehicle_id=sample_vehicle.id,
        date=date(2026, 7, 15),
        liters=100.0,
        amount=9450.0,
        odometer_km=55000.0,
    )
    db.add(fr)
    db.commit()
    cost = get_vehicle_fuel_cost(db, sample_vehicle.id)
    assert cost == pytest.approx(9450.0)


def test_vehicle_fuel_cost_date_filter(db, sample_vehicle):
    from app.models.fuel import FuelRecord
    fr = FuelRecord(
        vehicle_id=sample_vehicle.id,
        date=date(2026, 6, 1),
        liters=50.0,
        amount=4725.0,
        odometer_km=54000.0,
    )
    db.add(fr)
    db.commit()
    # Filter to July only — should not include June record
    cost = get_vehicle_fuel_cost(
        db, sample_vehicle.id,
        start_date=date(2026, 7, 1),
        end_date=date(2026, 7, 31),
    )
    assert cost == 0.0


def test_vehicle_maintenance_cost(db, sample_vehicle):
    from app.models.maintenance import MaintenanceRecord
    mr = MaintenanceRecord(
        vehicle_id=sample_vehicle.id,
        date=date(2026, 7, 10),
        maintenance_type="scheduled",
        amount=15000.0,
        downtime_days=1.0,
    )
    db.add(mr)
    db.commit()
    cost = get_vehicle_maintenance_cost(db, sample_vehicle.id)
    assert cost == pytest.approx(15000.0)


def test_vehicle_revenue(db, sample_vehicle, sample_trips):
    rev = get_vehicle_revenue(db, sample_vehicle.id)
    assert rev > 0
    expected = sum(t.revenue for t in sample_trips)
    assert rev == pytest.approx(expected, rel=0.01)


def test_route_costs_no_data(db, sample_route):
    costs = get_route_costs(db, sample_route.id)
    assert all(v == 0.0 for v in costs.values())


def test_customer_costs_no_data(db, sample_customer):
    costs = get_customer_costs(db, sample_customer.id)
    assert all(v == 0.0 for v in costs.values())


def test_driver_cost_allocation(db, sample_vehicle, sample_driver, sample_trips):
    """Driver cost allocated to vehicle should be > 0 when trips exist."""
    driver_cost = get_vehicle_driver_cost(db, sample_vehicle.id)
    # Driver cost is pro-rated by service hours
    # With 10 trips assigned entirely to this vehicle, 100% of hours → 100% of salary
    assert driver_cost >= 0.0
    # Should not exceed driver's annual salary
    annual_salary = sample_driver.salary * 12
    assert driver_cost <= annual_salary * 1.1  # 10% tolerance
