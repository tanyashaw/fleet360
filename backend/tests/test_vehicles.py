"""Fleet360 — Vehicle Analytics Tests."""
import pytest
from datetime import date

from app.services.vehicle_service import get_vehicle_profitability, get_vehicle_ranking
from app.utils.calculations import safe_divide, calc_utilization, normalize_score


# ── Unit tests for calculation helpers ────────────────────────────────────────

def test_safe_divide_normal():
    assert safe_divide(100, 4) == 25.0


def test_safe_divide_zero_denominator():
    assert safe_divide(100, 0) == 0.0


def test_safe_divide_custom_default():
    assert safe_divide(50, 0, default=-1) == -1


def test_calc_utilization_normal():
    assert calc_utilization(80, 100) == 80.0


def test_calc_utilization_over_100():
    assert calc_utilization(120, 100) == 100.0


def test_calc_utilization_zero():
    assert calc_utilization(0, 100) == 0.0


def test_normalize_score_mid():
    assert normalize_score(50, 0, 100) == 50.0


def test_normalize_score_clamp_high():
    assert normalize_score(150, 0, 100) == 100.0


def test_normalize_score_clamp_low():
    assert normalize_score(-10, 0, 100) == 0.0


# ── Vehicle service tests (with DB fixtures) ──────────────────────────────────

def test_vehicle_profitability_no_trips(db, sample_vehicle):
    """Vehicle with no trips should return zeros, not error."""
    result = get_vehicle_profitability(db, sample_vehicle.id)
    assert result is not None
    assert result.vehicle_id == sample_vehicle.id
    assert result.revenue == 0.0
    assert result.total_trips == 0
    assert result.margin_percentage == 0.0


def test_vehicle_profitability_with_trips(db, sample_vehicle, sample_trips):
    result = get_vehicle_profitability(db, sample_vehicle.id)
    assert result is not None
    assert result.total_trips == 10
    assert result.revenue > 0
    assert result.total_distance_km > 0
    assert result.total_service_hours > 0


def test_vehicle_profitability_nonexistent(db):
    result = get_vehicle_profitability(db, 9999)
    assert result is None


def test_vehicle_ranking_returns_list(db, sample_vehicle, sample_trips):
    ranking = get_vehicle_ranking(db)
    assert ranking.total >= 1
    # Vehicles should be sorted by contribution (descending)
    contributions = [v.contribution for v in ranking.vehicles]
    assert contributions == sorted(contributions, reverse=True)


def test_vehicle_ranking_assigns_ranks(db, sample_vehicle, sample_trips):
    ranking = get_vehicle_ranking(db)
    ranks = [v.profitability_rank for v in ranking.vehicles]
    assert ranks[0] == 1


def test_vehicle_profitability_date_filter(db, sample_vehicle, sample_trips):
    """Date filter should reduce the result set."""
    full = get_vehicle_profitability(db, sample_vehicle.id)
    filtered = get_vehicle_profitability(
        db, sample_vehicle.id,
        start_date=date(2026, 7, 15),
        end_date=date(2026, 7, 20),
    )
    # Filtered result should have fewer or equal trips
    assert filtered.total_trips <= full.total_trips


# ── API endpoint tests ────────────────────────────────────────────────────────

def test_list_vehicles_api(client, auth_headers, sample_vehicle):
    resp = client.get("/api/v1/vehicles", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert "vehicles" in data
    assert data["total"] >= 1


def test_get_vehicle_api(client, auth_headers, sample_vehicle):
    resp = client.get(f"/api/v1/vehicles/{sample_vehicle.id}", headers=auth_headers)
    assert resp.status_code == 200
    assert resp.json()["vehicle_number"] == "TEST-001"


def test_get_vehicle_not_found(client, auth_headers):
    resp = client.get("/api/v1/vehicles/99999", headers=auth_headers)
    assert resp.status_code == 404
    error = resp.json()["detail"]["error"]
    assert error["code"] == "VEHICLE_NOT_FOUND"


def test_vehicle_profitability_api(client, auth_headers, sample_vehicle, sample_trips):
    resp = client.get(f"/api/v1/vehicles/{sample_vehicle.id}/profitability", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert "revenue" in data
    assert "contribution" in data
    assert "margin_percentage" in data


def test_vehicle_ranking_api(client, auth_headers, sample_vehicle, sample_trips):
    resp = client.get("/api/v1/vehicles/profitability/ranking", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert "vehicles" in data


def test_vehicles_require_auth(client):
    resp = client.get("/api/v1/vehicles")
    assert resp.status_code == 401
