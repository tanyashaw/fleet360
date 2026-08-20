"""Fleet360 — Dashboard Tests."""
import pytest
from datetime import date

from app.services.analytics_service import get_dashboard_summary, get_monthly_trend


def test_dashboard_summary_empty_db(db):
    """Dashboard with no data should return zeros, not error."""
    result = get_dashboard_summary(db)
    assert result is not None
    assert result.revenue == 0.0
    assert result.total_trips == 0


def test_dashboard_summary_with_data(db, sample_trips):
    result = get_dashboard_summary(db)
    assert result.revenue > 0
    assert result.total_trips == 10
    assert result.total_vehicles >= 1


def test_dashboard_summary_date_filter(db, sample_trips):
    result = get_dashboard_summary(
        db,
        start_date=date(2026, 7, 1),
        end_date=date(2026, 7, 31),
    )
    assert result.period == "2026-07"
    assert result.total_trips <= 10


def test_dashboard_margin_calculation(db, sample_trips):
    result = get_dashboard_summary(db)
    if result.revenue > 0 and result.operating_cost > 0:
        expected = (result.contribution / result.revenue) * 100
        assert abs(result.margin_percentage - expected) < 0.01


def test_monthly_trend(db, sample_trips):
    trend = get_monthly_trend(db, months=3)
    assert len(trend.months) == 3
    for m in trend.months:
        assert "month" in m.model_dump()
        assert m.revenue >= 0


# ── API tests ─────────────────────────────────────────────────────────────────

def test_dashboard_summary_api(client, auth_headers, sample_trips):
    resp = client.get("/api/v1/dashboard/summary", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    required_fields = ["revenue", "operating_cost", "contribution", "margin_percentage",
                       "total_vehicles", "active_vehicles", "total_trips"]
    for field in required_fields:
        assert field in data, f"Missing field: {field}"


def test_dashboard_summary_with_date_params(client, auth_headers, sample_trips):
    resp = client.get(
        "/api/v1/dashboard/summary",
        params={"start_date": "2026-07-01", "end_date": "2026-07-31"},
        headers=auth_headers,
    )
    assert resp.status_code == 200


def test_dashboard_trend_api(client, auth_headers):
    resp = client.get("/api/v1/dashboard/trend?months=3", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert len(data["months"]) == 3


def test_dashboard_requires_auth(client):
    resp = client.get("/api/v1/dashboard/summary")
    assert resp.status_code == 401
