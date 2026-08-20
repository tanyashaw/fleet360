"""Fleet360 — Driver Analytics Tests."""
import pytest

from app.services.driver_service import get_driver_performance, get_driver_scorecard


def test_driver_performance_no_trips(db, sample_driver):
    result = get_driver_performance(db, sample_driver.id)
    assert result is not None
    assert result.total_trips == 0
    assert result.overall_score >= 0.0
    assert result.overall_score <= 100.0


def test_driver_performance_with_trips(db, sample_driver, sample_trips):
    result = get_driver_performance(db, sample_driver.id)
    assert result.total_trips == 10
    assert result.total_service_hours > 0
    assert 0.0 <= result.overall_score <= 100.0
    assert 0.0 <= result.productivity_score <= 100.0
    assert 0.0 <= result.utilization_score <= 100.0
    assert 0.0 <= result.attendance_score <= 100.0


def test_driver_performance_nonexistent(db):
    result = get_driver_performance(db, 9999)
    assert result is None


def test_driver_scorecard(db, sample_driver, sample_trips):
    scorecard = get_driver_scorecard(db)
    assert scorecard.total >= 1
    scores = [d.overall_score for d in scorecard.drivers]
    assert scores == sorted(scores, reverse=True)
    assert scorecard.fleet_avg_score >= 0


def test_driver_scorecard_rank_assigned(db, sample_driver, sample_trips):
    scorecard = get_driver_scorecard(db)
    assert scorecard.drivers[0].rank == 1


def test_list_drivers_api(client, auth_headers, sample_driver):
    resp = client.get("/api/v1/drivers", headers=auth_headers)
    assert resp.status_code == 200
    assert resp.json()["total"] >= 1


def test_driver_performance_api(client, auth_headers, sample_driver, sample_trips):
    resp = client.get(f"/api/v1/drivers/{sample_driver.id}/performance", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert "overall_score" in data
    assert "productivity_score" in data
    assert 0 <= data["overall_score"] <= 100


def test_driver_not_found_api(client, auth_headers):
    resp = client.get("/api/v1/drivers/9999/performance", headers=auth_headers)
    assert resp.status_code == 404
    assert resp.json()["detail"]["error"]["code"] == "DRIVER_NOT_FOUND"


def test_driver_scorecard_api(client, auth_headers, sample_driver, sample_trips):
    resp = client.get("/api/v1/drivers/scorecard", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert "drivers" in data
    assert "fleet_avg_score" in data
