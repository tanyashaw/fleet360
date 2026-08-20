"""Fleet360 — Test Configuration and Fixtures."""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.database import Base, get_db
from app.main import app


# ── In-memory SQLite for tests ────────────────────────────────────────────────
TEST_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="session", autouse=True)
def setup_database():
    """Create all tables once for the test session."""
    from app.models import vehicle, route, customer, driver, trip, transaction, fuel, maintenance, quickbooks, user  # noqa
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def db():
    """Provide a clean database session per test."""
    connection = engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)
    yield session
    session.close()
    transaction.rollback()
    connection.close()


@pytest.fixture
def client(db):
    """Provide a FastAPI test client with DB override."""
    def override_get_db():
        try:
            yield db
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


# ── Seed helpers ──────────────────────────────────────────────────────────────

@pytest.fixture
def admin_user(db):
    from app.models.user import User
    from app.core.security import hash_password
    user = User(
        name="Test Admin",
        email="testadmin@fleet360.in",
        hashed_password=hash_password("TestPass123!"),
        role="ADMIN",
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture
def auth_token(client, admin_user):
    """Return a valid JWT bearer token for the test admin user."""
    resp = client.post("/api/v1/auth/login", json={
        "email": "testadmin@fleet360.in",
        "password": "TestPass123!",
    })
    assert resp.status_code == 200
    return resp.json()["access_token"]


@pytest.fixture
def auth_headers(auth_token):
    return {"Authorization": f"Bearer {auth_token}"}


@pytest.fixture
def sample_vehicle(db):
    from app.models.vehicle import Vehicle
    v = Vehicle(
        vehicle_number="TEST-001",
        registration_number="MH-TEST-0001",
        vehicle_type="BUS",
        capacity=50,
        branch_id="MUMBAI",
        status="active",
    )
    db.add(v)
    db.commit()
    db.refresh(v)
    return v


@pytest.fixture
def sample_route(db):
    from app.models.route import Route
    r = Route(
        route_code="TEST-RT-01",
        origin="Mumbai",
        destination="Pune",
        distance_km=148.0,
        status="active",
    )
    db.add(r)
    db.commit()
    db.refresh(r)
    return r


@pytest.fixture
def sample_customer(db):
    from app.models.customer import Customer
    from datetime import date
    c = Customer(
        customer_code="TEST-CUST-01",
        name="Test Customer Ltd",
        contract_value=5000000,
        contract_start=date(2025, 4, 1),
        contract_end=date(2026, 3, 31),
        status="active",
    )
    db.add(c)
    db.commit()
    db.refresh(c)
    return c


@pytest.fixture
def sample_driver(db):
    from app.models.driver import Driver
    d = Driver(
        employee_code="TEST-D-01",
        name="Test Driver",
        license_number="TEST-LIC-001",
        salary=35000,
        branch_id="MUMBAI",
        status="active",
    )
    db.add(d)
    db.commit()
    db.refresh(d)
    return d


@pytest.fixture
def sample_trips(db, sample_vehicle, sample_route, sample_customer, sample_driver):
    """Create 10 completed sample trips."""
    from app.models.trip import Trip
    from datetime import date, timedelta
    trips = []
    base_date = date(2026, 7, 1)
    for i in range(10):
        t = Trip(
            vehicle_id=sample_vehicle.id,
            driver_id=sample_driver.id,
            route_id=sample_route.id,
            customer_id=sample_customer.id,
            trip_date=base_date + timedelta(days=i * 2),
            distance_km=148.0,
            service_hours=3.5,
            revenue=18000.0 + (i * 500),
            status="completed",
        )
        db.add(t)
        trips.append(t)
    db.commit()
    return trips
