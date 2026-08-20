"""Fleet360 — Data Loader Utility.
Reads master CSV files from the data/ directory and inserts into the database.
Used by seed.py.
"""
import csv
import logging
from datetime import date
from pathlib import Path
from typing import Any

from sqlalchemy.orm import Session

from app.models.vehicle import Vehicle
from app.models.route import Route
from app.models.customer import Customer
from app.models.driver import Driver

logger = logging.getLogger(__name__)
DATA_DIR = Path(__file__).resolve().parents[2] / "data"


def _parse_date(value: str) -> date | None:
    if not value or value.strip() == "":
        return None
    try:
        return date.fromisoformat(value.strip())
    except ValueError:
        return None


def _parse_float(value: str) -> float | None:
    try:
        return float(value.strip()) if value.strip() else None
    except (ValueError, AttributeError):
        return None


def _parse_int(value: str) -> int | None:
    try:
        return int(value.strip()) if value.strip() else None
    except (ValueError, AttributeError):
        return None


def load_vehicles(db: Session, csv_path: Path | None = None) -> int:
    path = csv_path or (DATA_DIR / "vehicles.csv")
    count = 0
    with open(path, newline="", encoding="utf-8") as f:
        for row in csv.DictReader(f):
            vehicle = Vehicle(
                vehicle_number=row["vehicle_number"],
                registration_number=row["registration_number"],
                vehicle_type=row["vehicle_type"],
                capacity=int(row["capacity"]),
                branch_id=row.get("branch_id", "HQ"),
                status=row.get("status", "active"),
                purchase_date=_parse_date(row.get("purchase_date", "")),
                purchase_value=_parse_float(row.get("purchase_value", "")),
                fuel_type=row.get("fuel_type", "diesel"),
            )
            db.add(vehicle)
            count += 1
    db.commit()
    logger.info("Loaded %d vehicles.", count)
    return count


def load_routes(db: Session, csv_path: Path | None = None) -> int:
    path = csv_path or (DATA_DIR / "routes.csv")
    count = 0
    with open(path, newline="", encoding="utf-8") as f:
        for row in csv.DictReader(f):
            route = Route(
                route_code=row["route_code"],
                origin=row["origin"],
                destination=row["destination"],
                distance_km=float(row["distance_km"]),
                contract_id=row.get("contract_id") or None,
                route_type=row.get("route_type", "intercity"),
                toll_applicable=int(row.get("toll_applicable", 0)),
                status=row.get("status", "active"),
            )
            db.add(route)
            count += 1
    db.commit()
    logger.info("Loaded %d routes.", count)
    return count


def load_customers(db: Session, csv_path: Path | None = None) -> int:
    path = csv_path or (DATA_DIR / "customers.csv")
    count = 0
    with open(path, newline="", encoding="utf-8") as f:
        for row in csv.DictReader(f):
            customer = Customer(
                customer_code=row["customer_code"],
                name=row["name"],
                industry=row.get("industry") or None,
                contact_person=row.get("contact_person") or None,
                contact_email=row.get("contact_email") or None,
                contract_start=_parse_date(row.get("contract_start", "")),
                contract_end=_parse_date(row.get("contract_end", "")),
                contract_value=_parse_float(row.get("contract_value", "")),
                payment_terms=row.get("payment_terms", "NET-30"),
                status=row.get("status", "active"),
            )
            db.add(customer)
            count += 1
    db.commit()
    logger.info("Loaded %d customers.", count)
    return count


def load_drivers(db: Session, csv_path: Path | None = None) -> int:
    path = csv_path or (DATA_DIR / "drivers.csv")
    count = 0
    with open(path, newline="", encoding="utf-8") as f:
        for row in csv.DictReader(f):
            driver = Driver(
                employee_code=row["employee_code"],
                name=row["name"],
                license_number=row["license_number"],
                license_expiry=_parse_date(row.get("license_expiry", "")),
                salary=float(row["salary"]),
                branch_id=row.get("branch_id", "HQ"),
                joining_date=_parse_date(row.get("joining_date", "")),
                status=row.get("status", "active"),
            )
            db.add(driver)
            count += 1
    db.commit()
    logger.info("Loaded %d drivers.", count)
    return count
