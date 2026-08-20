"""
Fleet360 — Database Seeder
===========================
Creates all tables, clears existing demo data, and generates realistic
Indian fleet operation data in INR.

Usage:
    python seed.py

What it generates:
    - 10 vehicles, 8 routes, 8 customers, 15 drivers  (from CSV)
    - 500+ trips across 12 months
    - 500+ financial transactions
    - 250+ fuel records
    - 80+ maintenance records
    - 1 admin user

Data Design Philosophy:
    Each vehicle/route/customer has a distinct performance profile so that
    the analytics APIs show meaningful variation — not uniform results.
"""
import csv
import os
import random
import sys
from datetime import date, timedelta
from pathlib import Path

# Ensure project root is on path
sys.path.insert(0, str(Path(__file__).resolve().parent))

os.environ.setdefault("DATABASE_URL", "sqlite:///./fleet360.db")

from app.core.database import init_db, SessionLocal
from app.core.security import hash_password
from app.models.user import User
from app.models.vehicle import Vehicle
from app.models.route import Route
from app.models.customer import Customer
from app.models.driver import Driver
from app.models.trip import Trip
from app.models.transaction import FinancialTransaction
from app.models.fuel import FuelRecord
from app.models.maintenance import MaintenanceRecord
from app.utils.data_loader import load_vehicles, load_routes, load_customers, load_drivers

# ── Reproducibility ───────────────────────────────────────────────────────────
RANDOM_SEED = 42
rng = random.Random(RANDOM_SEED)

# ── Date range: last 12 months ────────────────────────────────────────────────
END_DATE = date(2026, 8, 20)
START_DATE = date(2025, 8, 21)


def random_date(start: date = START_DATE, end: date = END_DATE) -> date:
    delta = (end - start).days
    return start + timedelta(days=rng.randint(0, delta))


# ─────────────────────────────────────────────────────────────────────────────
# Vehicle Performance Profiles
# Each vehicle has a multiplier affecting revenue and cost characteristics.
# This creates deliberate variation in profitability.
# ─────────────────────────────────────────────────────────────────────────────
VEHICLE_PROFILES = {
    # vehicle_number: {revenue_mult, cost_mult, utilization_mult, trips_per_month}
    "BUS-101": {"rev": 1.10, "cost": 0.95, "trips": 50, "label": "good"},
    "BUS-102": {"rev": 0.88, "cost": 1.18, "trips": 42, "label": "issues"},   # cost anomaly
    "BUS-103": {"rev": 1.25, "cost": 0.90, "trips": 58, "label": "star"},     # top performer
    "BUS-104": {"rev": 0.82, "cost": 1.05, "trips": 44, "label": "low-margin"},
    "BUS-105": {"rev": 0.70, "cost": 0.98, "trips": 32, "label": "under-util"},  # under-utilized
    "TRK-101": {"rev": 1.15, "cost": 0.92, "trips": 36, "label": "good"},
    "TRK-102": {"rev": 1.00, "cost": 1.00, "trips": 30, "label": "avg"},
    "TRK-103": {"rev": 0.90, "cost": 1.22, "trips": 28, "label": "high-maint"},  # high maintenance
    "VAN-101": {"rev": 1.05, "cost": 0.93, "trips": 40, "label": "good"},
    "VAN-102": {"rev": 0.72, "cost": 1.02, "trips": 25, "label": "under-util"},  # under-utilized
}

# ─────────────────────────────────────────────────────────────────────────────
# Route base revenue per trip (INR)
# ─────────────────────────────────────────────────────────────────────────────
ROUTE_REVENUE = {
    "MUM-PNE-01": 18000,   # busy, short, good margin
    "MUM-NGP-01": 45000,   # long, decent margin
    "DEL-AGR-01": 22000,   # tourist, good
    "DEL-JKP-01": 26000,   # busy, good
    "BNG-CHN-01": 32000,   # decent
    "BNG-HYD-01": 38000,   # decent
    "KOL-ASN-01": 14000,   # short, LOW margin route
    "CHN-COI-01": 28000,   # medium
}

# Service hours per trip (approximate)
ROUTE_HOURS = {
    "MUM-PNE-01": 3.5, "MUM-NGP-01": 14.0, "DEL-AGR-01": 4.5,
    "DEL-JKP-01": 5.5, "BNG-CHN-01": 6.0, "BNG-HYD-01": 9.5,
    "KOL-ASN-01": 4.0, "CHN-COI-01": 9.0,
}

# ─────────────────────────────────────────────────────────────────────────────
# Customer revenue share (0.0–1.0 multiplier on route revenue)
# Higher customers pay premium prices
# ─────────────────────────────────────────────────────────────────────────────
CUSTOMER_MULT = {
    "CUST-001": 1.10,   # ABC Logistics — premium, good margin
    "CUST-002": 0.92,   # XYZ Mfg — below market
    "CUST-003": 1.05,   # DEF Industries — OK
    "CUST-004": 1.15,   # GHI Travels — tourist premium
    "CUST-005": 0.85,   # JKL Pharma — below market (risk)
    "CUST-006": 1.00,   # MNO Textiles — market rate
    "CUST-007": 0.88,   # PQR Infra — high revenue LOW margin
    "CUST-008": 1.08,   # STU Exports — above market
}

# ─────────────────────────────────────────────────────────────────────────────
# Branch → Route → Vehicle mapping for realistic assignment
# ─────────────────────────────────────────────────────────────────────────────
BRANCH_ROUTES = {
    "MUMBAI": ["MUM-PNE-01", "MUM-NGP-01"],
    "DELHI": ["DEL-AGR-01", "DEL-JKP-01"],
    "BANGALORE": ["BNG-CHN-01", "BNG-HYD-01", "KOL-ASN-01", "CHN-COI-01"],
}

# Fallback: assign any route if branch not matched
ALL_ROUTES = list(ROUTE_REVENUE.keys())


def get_vehicle_routes(vehicle_number: str, branch: str) -> list:
    routes = BRANCH_ROUTES.get(branch.upper(), ALL_ROUTES)
    return routes if routes else ALL_ROUTES


# ─────────────────────────────────────────────────────────────────────────────
# Fuel Prices (INR / liter)
# ─────────────────────────────────────────────────────────────────────────────
DIESEL_PRICE_PER_LITER = 94.50

FUEL_EFFICIENCY = {  # km/liter
    "BUS-101": 6.2, "BUS-102": 5.0, "BUS-103": 6.8,  # BUS-102 is fuel-hungry
    "BUS-104": 5.8, "BUS-105": 6.0,
    "TRK-101": 4.5, "TRK-102": 4.2, "TRK-103": 3.8,  # TRK-103 worst
    "VAN-101": 10.5, "VAN-102": 9.8,
}

# ─────────────────────────────────────────────────────────────────────────────
# Maintenance cost bands (INR/event) by type and vehicle profile
# ─────────────────────────────────────────────────────────────────────────────
MAINT_EVENTS = {
    "scheduled": (8000, 25000),
    "breakdown": (20000, 80000),
    "tyre": (15000, 40000),
    "engine": (50000, 150000),
    "accident": (30000, 120000),
}

# How many maintenance events per vehicle per year
MAINT_FREQUENCY = {
    "BUS-101": 6, "BUS-102": 8, "BUS-103": 5,
    "BUS-104": 7, "BUS-105": 6,
    "TRK-101": 6, "TRK-102": 7, "TRK-103": 12,  # TRK-103 breakdown-prone
    "VAN-101": 4, "VAN-102": 5,
}

MAINT_TYPES_DIST = {
    "BUS-102": {"scheduled": 0.4, "breakdown": 0.3, "tyre": 0.2, "engine": 0.1},
    "TRK-103": {"scheduled": 0.3, "breakdown": 0.4, "tyre": 0.1, "engine": 0.2},
    "default":  {"scheduled": 0.6, "breakdown": 0.15, "tyre": 0.2, "engine": 0.05},
}

VENDORS = ["Star Auto Works", "Bharat Service Centre", "Jai Garage", "Krishna Motors", "Sai Auto"]


# ─────────────────────────────────────────────────────────────────────────────
# Helper: weighted choice
# ─────────────────────────────────────────────────────────────────────────────
def weighted_choice(choices: dict) -> str:
    keys = list(choices.keys())
    weights = list(choices.values())
    return rng.choices(keys, weights=weights, k=1)[0]


# ─────────────────────────────────────────────────────────────────────────────
# Clear all demo data (preserves table structure)
# ─────────────────────────────────────────────────────────────────────────────
def clear_data(db):
    db.query(FinancialTransaction).delete()
    db.query(FuelRecord).delete()
    db.query(MaintenanceRecord).delete()
    db.query(Trip).delete()
    db.query(Driver).delete()
    db.query(Customer).delete()
    db.query(Route).delete()
    db.query(Vehicle).delete()
    db.query(User).delete()
    db.commit()
    print("  Existing data cleared.")


# ─────────────────────────────────────────────────────────────────────────────
# Generate Trips
# ─────────────────────────────────────────────────────────────────────────────
def generate_trips(db, vehicles, routes, customers, drivers) -> list[Trip]:
    vehicle_map = {v.vehicle_number: v for v in vehicles}
    route_map = {r.route_code: r for r in routes}
    customer_list = customers
    driver_map = {}  # branch → drivers
    for d in drivers:
        driver_map.setdefault(d.branch_id, []).append(d)

    trips = []
    odometer = {v.vehicle_number: 50000 for v in vehicles}  # starting odometer

    for vnum, profile in VEHICLE_PROFILES.items():
        vehicle = vehicle_map.get(vnum)
        if not vehicle:
            continue

        branch = vehicle.branch_id
        v_routes = get_vehicle_routes(vnum, branch)
        branch_drivers = driver_map.get(branch, drivers)  # fallback to all

        total_months = 12
        trips_per_month = profile["trips"]

        for month in range(total_months):
            # Calculate the actual month/year
            m_start = START_DATE + timedelta(days=30 * month)
            m_end = min(m_start + timedelta(days=29), END_DATE)

            for _ in range(trips_per_month):
                route_code = rng.choice(v_routes)
                route = route_map.get(route_code)
                if not route:
                    route_code = rng.choice(ALL_ROUTES)
                    route = route_map.get(route_code)
                if not route:
                    continue

                customer = rng.choice(customer_list)
                driver = rng.choice(branch_drivers)

                trip_date = random_date(m_start, m_end)

                # Revenue = base route revenue × vehicle multiplier × customer multiplier × random variance
                base_rev = ROUTE_REVENUE[route_code]
                rev = (
                    base_rev
                    * profile["rev"]
                    * CUSTOMER_MULT.get(customer.customer_code, 1.0)
                    * rng.uniform(0.90, 1.10)
                )

                # Distance = route distance ± 5%
                dist_km = route.distance_km * rng.uniform(0.95, 1.05)

                # Service hours
                service_hrs = ROUTE_HOURS[route_code] * rng.uniform(0.90, 1.15)

                trip = Trip(
                    vehicle_id=vehicle.id,
                    driver_id=driver.id,
                    route_id=route.id,
                    customer_id=customer.id,
                    trip_date=trip_date,
                    distance_km=round(dist_km, 1),
                    service_hours=round(service_hrs, 2),
                    revenue=round(rev, 2),
                    status="completed",
                )
                db.add(trip)
                trips.append(trip)

                odometer[vnum] = odometer.get(vnum, 0) + dist_km

    db.commit()
    print(f"  Trips: {len(trips)}")
    return trips


# ─────────────────────────────────────────────────────────────────────────────
# Generate Fuel Records
# ─────────────────────────────────────────────────────────────────────────────
def generate_fuel_records(db, vehicles, trips) -> list[FuelRecord]:
    # Group trips by vehicle
    trips_by_vehicle = {}
    for t in trips:
        trips_by_vehicle.setdefault(t.vehicle_id, []).append(t)

    vehicle_map = {v.id: v for v in vehicles}
    records = []
    odometer_track = {v.id: 50000.0 for v in vehicles}

    for vehicle in vehicles:
        vnum = vehicle.vehicle_number
        efficiency = FUEL_EFFICIENCY.get(vnum, 5.5)
        v_trips = trips_by_vehicle.get(vehicle.id, [])

        # Fuel up approximately every 3 trips
        fuel_events = []
        batch = []
        for t in sorted(v_trips, key=lambda x: x.trip_date):
            batch.append(t)
            if len(batch) >= 3 or t == v_trips[-1]:
                if batch:
                    fuel_events.append(batch[:])
                    batch = []

        for batch_trips in fuel_events:
            total_km = sum(t.distance_km for t in batch_trips)
            liters = total_km / efficiency * rng.uniform(0.92, 1.08)
            price_liter = DIESEL_PRICE_PER_LITER * rng.uniform(0.96, 1.04)
            amount = liters * price_liter
            odometer_track[vehicle.id] += total_km
            fuel_date = max(t.trip_date for t in batch_trips)

            rec = FuelRecord(
                vehicle_id=vehicle.id,
                date=fuel_date,
                liters=round(liters, 2),
                amount=round(amount, 2),
                odometer_km=round(odometer_track[vehicle.id], 0),
                fuel_station=rng.choice(["HPCL Station", "BPCL Pump", "IOC Fuel", "Reliance BP"]),
            )
            db.add(rec)
            records.append(rec)

    db.commit()
    print(f"  Fuel Records: {len(records)}")
    return records


# ─────────────────────────────────────────────────────────────────────────────
# Generate Maintenance Records
# ─────────────────────────────────────────────────────────────────────────────
def generate_maintenance_records(db, vehicles) -> list[MaintenanceRecord]:
    records = []
    for vehicle in vehicles:
        vnum = vehicle.vehicle_number
        n_events = MAINT_FREQUENCY.get(vnum, 6)
        dist = MAINT_TYPES_DIST.get(vnum, MAINT_TYPES_DIST["default"])

        for _ in range(n_events):
            mtype = weighted_choice(dist)
            min_cost, max_cost = MAINT_EVENTS[mtype]
            amount = rng.uniform(min_cost, max_cost)

            # Cost multiplier for cost-anomaly vehicles
            profile = VEHICLE_PROFILES.get(vnum, {})
            amount *= profile.get("cost", 1.0)

            downtime = 0.0
            if mtype in ("breakdown", "engine", "accident"):
                downtime = rng.uniform(1, 5)
            elif mtype == "scheduled":
                downtime = rng.uniform(0.25, 1.0)

            rec = MaintenanceRecord(
                vehicle_id=vehicle.id,
                date=random_date(),
                maintenance_type=mtype,
                amount=round(amount, 2),
                downtime_days=round(downtime, 1),
                vendor=rng.choice(VENDORS),
                description=f"{mtype.title()} maintenance for {vnum}",
            )
            db.add(rec)
            records.append(rec)

    db.commit()
    print(f"  Maintenance Records: {len(records)}")
    return records


# ─────────────────────────────────────────────────────────────────────────────
# Generate Financial Transactions
# ─────────────────────────────────────────────────────────────────────────────
def generate_transactions(db, vehicles, drivers, customers, trips, fuel_records, maint_records) -> list:
    txns = []
    txn_date = lambda: random_date()

    vehicle_map = {v.id: v for v in vehicles}
    customer_map = {c.id: c for c in customers}
    driver_map = {d.id: d for d in drivers}

    # 1. Revenue transactions — one per trip (grouped monthly per vehicle/customer)
    trips_by_vc = {}
    for t in trips:
        key = (t.vehicle_id, t.customer_id, t.trip_date.year, t.trip_date.month)
        trips_by_vc.setdefault(key, []).append(t)

    for (vid, cid, yr, mo), batch in trips_by_vc.items():
        from datetime import date as date_cls
        import calendar
        _, last = calendar.monthrange(yr, mo)
        tx_date = date_cls(yr, mo, min(28, last))
        total_rev = sum(t.revenue for t in batch)
        vehicle = vehicle_map.get(vid)
        customer = customer_map.get(cid)
        txns.append(FinancialTransaction(
            transaction_type="revenue",
            transaction_date=tx_date,
            account="Revenue - Transport Services",
            customer_id=cid,
            vehicle_id=vid,
            amount=round(total_rev, 2),
            description=f"Revenue {yr}-{mo:02d} | {vehicle.vehicle_number if vehicle else ''} | {customer.name if customer else ''}",
            reference_number=f"REV-{yr}{mo:02d}-{vid}-{cid}",
        ))

    # 2. Fuel transactions (matching fuel records)
    for fr in fuel_records:
        vehicle = vehicle_map.get(fr.vehicle_id)
        txns.append(FinancialTransaction(
            transaction_type="fuel",
            transaction_date=fr.date,
            account="Expenses - Fuel",
            vehicle_id=fr.vehicle_id,
            amount=round(fr.amount, 2),
            description=f"Fuel fill-up {fr.liters:.1f}L | {vehicle.vehicle_number if vehicle else ''}",
        ))

    # 3. Maintenance transactions (matching maintenance records)
    for mr in maint_records:
        vehicle = vehicle_map.get(mr.vehicle_id)
        txns.append(FinancialTransaction(
            transaction_type="maintenance",
            transaction_date=mr.date,
            account="Expenses - Maintenance",
            vehicle_id=mr.vehicle_id,
            amount=round(mr.amount, 2),
            description=f"{mr.maintenance_type.title()} maintenance | {vehicle.vehicle_number if vehicle else ''}",
        ))

    # 4. Salary transactions (monthly per driver × 12 months)
    for driver in drivers:
        for month_offset in range(12):
            from datetime import date as date_cls
            import calendar
            m_date = START_DATE + timedelta(days=30 * month_offset)
            _, last = calendar.monthrange(m_date.year, m_date.month)
            salary_date = date_cls(m_date.year, m_date.month, min(28, last))
            txns.append(FinancialTransaction(
                transaction_type="salary",
                transaction_date=salary_date,
                account="Expenses - Driver Salary",
                driver_id=driver.id,
                amount=round(driver.salary, 2),
                description=f"Monthly salary | {driver.name} | {salary_date.strftime('%b %Y')}",
                reference_number=f"SAL-{driver.employee_code}-{salary_date.year}{salary_date.month:02d}",
            ))

    # 5. Insurance transactions (annual per vehicle)
    for vehicle in vehicles:
        insurance_amount = rng.uniform(80000, 180000)
        txns.append(FinancialTransaction(
            transaction_type="insurance",
            transaction_date=date(2025, 4, 1),
            account="Expenses - Insurance",
            vehicle_id=vehicle.id,
            amount=round(insurance_amount, 2),
            description=f"Annual insurance | {vehicle.vehicle_number}",
        ))

    # 6. Toll transactions (per trip on toll routes)
    toll_routes = {"MUM-PNE-01", "MUM-NGP-01", "DEL-AGR-01", "DEL-JKP-01",
                   "BNG-CHN-01", "BNG-HYD-01", "CHN-COI-01"}
    toll_rate = {
        "MUM-PNE-01": 480, "MUM-NGP-01": 1800, "DEL-AGR-01": 680,
        "DEL-JKP-01": 780, "BNG-CHN-01": 920, "BNG-HYD-01": 1200,
        "CHN-COI-01": 1100,
    }

    # Group toll by vehicle/month
    toll_by_vm = {}
    for t in trips:
        from app.models.route import Route as RouteModel
        # We'll batch toll by vehicle + month
        key = (t.vehicle_id, t.trip_date.year, t.trip_date.month)
        toll_by_vm.setdefault(key, 0)

    # Just generate periodic toll txns per vehicle
    for vehicle in vehicles:
        for month_offset in range(12):
            m_date = START_DATE + timedelta(days=30 * month_offset)
            # ~60% of months have toll
            if rng.random() < 0.6:
                toll_amount = rng.uniform(5000, 25000)
                import calendar
                _, last = calendar.monthrange(m_date.year, m_date.month)
                from datetime import date as date_cls
                toll_date = date_cls(m_date.year, m_date.month, rng.randint(1, min(28, last)))
                txns.append(FinancialTransaction(
                    transaction_type="toll",
                    transaction_date=toll_date,
                    account="Expenses - Toll & Road Tax",
                    vehicle_id=vehicle.id,
                    amount=round(toll_amount, 2),
                    description=f"Toll charges | {vehicle.vehicle_number} | {toll_date.strftime('%b %Y')}",
                ))

    # 7. Other operating costs
    for vehicle in vehicles:
        for month_offset in range(12):
            if rng.random() < 0.7:
                m_date = START_DATE + timedelta(days=30 * month_offset)
                import calendar
                _, last = calendar.monthrange(m_date.year, m_date.month)
                from datetime import date as date_cls
                op_date = date_cls(m_date.year, m_date.month, rng.randint(1, min(28, last)))
                txns.append(FinancialTransaction(
                    transaction_type="other_operating_cost",
                    transaction_date=op_date,
                    account="Expenses - Other Operating",
                    vehicle_id=vehicle.id,
                    amount=round(rng.uniform(2000, 12000), 2),
                    description=f"Misc operating cost | {vehicle.vehicle_number}",
                ))

    for txn in txns:
        db.add(txn)
    db.commit()
    print(f"  Transactions: {len(txns)}")
    return txns


# ─────────────────────────────────────────────────────────────────────────────
# Create admin user
# ─────────────────────────────────────────────────────────────────────────────
def create_admin_user(db):
    user = User(
        name="Fleet360 Admin",
        email="admin@fleet360.in",
        hashed_password=hash_password("Fleet360Admin!"),
        role="ADMIN",
        is_active=True,
    )
    db.add(user)

    manager = User(
        name="Fleet Manager",
        email="manager@fleet360.in",
        hashed_password=hash_password("Fleet360Manager!"),
        role="MANAGER",
        is_active=True,
    )
    db.add(manager)

    analyst = User(
        name="Fleet Analyst",
        email="analyst@fleet360.in",
        hashed_password=hash_password("Fleet360Analyst!"),
        role="ANALYST",
        is_active=True,
    )
    db.add(analyst)

    db.commit()
    print("  Demo users created.")


# ─────────────────────────────────────────────────────────────────────────────
# Export generated transactional data to CSVs
# ─────────────────────────────────────────────────────────────────────────────
def export_to_csv(db):
    data_dir = Path(__file__).parent / "data"
    data_dir.mkdir(exist_ok=True)

    # Trips
    trips = db.query(Trip).all()
    with open(data_dir / "trips.csv", "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["id", "vehicle_id", "driver_id", "route_id", "customer_id",
                    "trip_date", "distance_km", "service_hours", "revenue", "status"])
        for t in trips:
            w.writerow([t.id, t.vehicle_id, t.driver_id, t.route_id, t.customer_id,
                        t.trip_date, t.distance_km, t.service_hours, t.revenue, t.status])

    # Transactions
    txns = db.query(FinancialTransaction).all()
    with open(data_dir / "transactions.csv", "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["id", "transaction_type", "transaction_date", "account",
                    "vehicle_id", "customer_id", "amount", "description"])
        for t in txns:
            w.writerow([t.id, t.transaction_type, t.transaction_date, t.account,
                        t.vehicle_id, t.customer_id, t.amount, t.description])

    # Fuel
    fuels = db.query(FuelRecord).all()
    with open(data_dir / "fuel.csv", "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["id", "vehicle_id", "date", "liters", "amount", "odometer_km"])
        for r in fuels:
            w.writerow([r.id, r.vehicle_id, r.date, r.liters, r.amount, r.odometer_km])

    # Maintenance
    maints = db.query(MaintenanceRecord).all()
    with open(data_dir / "maintenance.csv", "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["id", "vehicle_id", "date", "maintenance_type", "amount", "downtime_days"])
        for m in maints:
            w.writerow([m.id, m.vehicle_id, m.date, m.maintenance_type, m.amount, m.downtime_days])


# ─────────────────────────────────────────────────────────────────────────────
# Main
# ─────────────────────────────────────────────────────────────────────────────
def main():
    print("\n" + "=" * 60)
    print("  Fleet360 — Database Seeder")
    print("=" * 60)

    print("\n[1/7] Initialising database tables...")
    init_db()
    print("  Tables ready.")

    db = SessionLocal()
    try:
        print("\n[2/7] Clearing existing data...")
        clear_data(db)

        print("\n[3/7] Loading master data from CSVs...")
        n_v = load_vehicles(db)
        n_r = load_routes(db)
        n_c = load_customers(db)
        n_d = load_drivers(db)

        vehicles = db.query(Vehicle).all()
        routes = db.query(Route).all()
        customers = db.query(Customer).all()
        drivers = db.query(Driver).all()

        print("\n[4/7] Generating trips...")
        trips = generate_trips(db, vehicles, routes, customers, drivers)

        print("\n[5/7] Generating fuel records...")
        fuel_records = generate_fuel_records(db, vehicles, trips)

        print("\n[6/7] Generating maintenance records...")
        maint_records = generate_maintenance_records(db, vehicles)

        print("\n[6b/7] Generating financial transactions...")
        txns = generate_transactions(db, vehicles, drivers, customers, trips, fuel_records, maint_records)

        print("\n[7/7] Creating demo users...")
        create_admin_user(db)

        print("\n  Exporting CSVs...")
        export_to_csv(db)

        txn_count = db.query(FinancialTransaction).count()
        fuel_count = db.query(FuelRecord).count()
        maint_count = db.query(MaintenanceRecord).count()
        trip_count = db.query(Trip).count()

        print("\n" + "=" * 60)
        print("  Fleet360 Demo Data Summary")
        print("-" * 60)
        print(f"  Vehicles:       {n_v}")
        print(f"  Routes:         {n_r}")
        print(f"  Customers:      {n_c}")
        print(f"  Drivers:        {n_d}")
        print(f"  Trips:          {trip_count}")
        print(f"  Transactions:   {txn_count}")
        print(f"  Fuel Records:   {fuel_count}")
        print(f"  Maintenance:    {maint_count}")
        print("=" * 60)
        print("\n  [OK] Database seeded successfully!")
        print("\n  Demo credentials:")
        print("    Admin:   admin@fleet360.in     / Fleet360Admin!")
        print("    Manager: manager@fleet360.in   / Fleet360Manager!")
        print("    Analyst: analyst@fleet360.in   / Fleet360Analyst!")
        print("\n  Start the server:")
        print("    uvicorn app.main:app --reload")
        print("\n  Swagger UI:")
        print("    http://localhost:8000/docs\n")

    except Exception as exc:
        db.rollback()
        print(f"\n  [ERROR] Seeding failed: {exc}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
