"""Fleet360 — AI Insight Tests."""
import pytest

from app.services.ai_insight_service import generate_insights, RuleBasedInsightProvider
from app.schemas.insight import Insight


def test_insights_empty_db(db):
    """Should return empty list, not crash, when no data exists."""
    result = generate_insights(db)
    assert result is not None
    assert result.provider in ["openai", "rule_based"]
    assert isinstance(result.insights, list)


def test_insights_with_data(db, sample_vehicle, sample_route, sample_customer, sample_driver, sample_trips):
    result = generate_insights(db)
    assert result.total == len(result.insights)
    for insight in result.insights:
        assert insight.type in [
            "COST_ANOMALY", "UNDER_UTILIZATION", "LOW_MARGIN",
            "HIGH_PERFORMER", "RISK", "OPPORTUNITY"
        ]
        assert insight.severity in ["HIGH", "MEDIUM", "LOW", "INFO"]
        assert insight.entity_type in ["vehicle", "route", "customer", "driver", "fleet"]
        assert len(insight.message) > 0
        assert len(insight.recommendation) > 0


def test_vehicle_insights_only(db, sample_vehicle, sample_trips):
    result = generate_insights(db, entity_type="vehicle")
    for insight in result.insights:
        assert insight.entity_type == "vehicle"


def test_route_insights_only(db, sample_route, sample_trips):
    result = generate_insights(db, entity_type="route")
    for insight in result.insights:
        assert insight.entity_type == "route"


def test_insights_sorted_by_severity(db, sample_vehicle, sample_trips):
    result = generate_insights(db)
    severity_order = {"HIGH": 0, "MEDIUM": 1, "LOW": 2, "INFO": 3}
    orders = [severity_order.get(i.severity, 99) for i in result.insights]
    assert orders == sorted(orders)


def test_insights_api(client, auth_headers, sample_vehicle, sample_trips):
    resp = client.get("/api/v1/insights", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert "insights" in data
    assert "provider" in data
    assert data["provider"] in ["openai", "rule_based"]


def test_vehicle_insights_api(client, auth_headers, sample_vehicle, sample_trips):
    resp = client.get("/api/v1/insights/vehicles", headers=auth_headers)
    assert resp.status_code == 200


def test_insights_require_auth(client):
    resp = client.get("/api/v1/insights")
    assert resp.status_code == 401


def test_quickbooks_status_api(client, auth_headers):
    resp = client.get("/api/v1/quickbooks/status", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert "configured" in data
    assert "connected" in data
    # POC: QB credentials absent → not configured
    assert data["configured"] is False
    assert "demo" in data["message"].lower() or "not configured" in data["message"].lower()
