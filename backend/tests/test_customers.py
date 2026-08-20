"""Fleet360 — Customer Analytics Tests."""
import pytest

from app.services.customer_service import get_customer_profitability, get_customer_ranking


def test_customer_profitability_no_trips(db, sample_customer):
    result = get_customer_profitability(db, sample_customer.id)
    assert result is not None
    assert result.total_trips == 0
    assert result.contract_revenue == 0.0


def test_customer_profitability_with_trips(db, sample_customer, sample_trips):
    result = get_customer_profitability(db, sample_customer.id)
    assert result.total_trips == 10
    assert result.contract_revenue > 0


def test_customer_profitability_nonexistent(db):
    result = get_customer_profitability(db, 9999)
    assert result is None


def test_customer_ranking(db, sample_customer, sample_trips):
    ranking = get_customer_ranking(db)
    assert ranking.total >= 1
    contributions = [c.contribution for c in ranking.customers]
    assert contributions == sorted(contributions, reverse=True)


def test_list_customers_api(client, auth_headers, sample_customer):
    resp = client.get("/api/v1/customers", headers=auth_headers)
    assert resp.status_code == 200
    assert resp.json()["total"] >= 1


def test_customer_profitability_api(client, auth_headers, sample_customer, sample_trips):
    resp = client.get(f"/api/v1/customers/{sample_customer.id}/profitability", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert "contract_revenue" in data
    assert "margin_percentage" in data
    assert "contract_performance_pct" in data


def test_customer_not_found_api(client, auth_headers):
    resp = client.get("/api/v1/customers/9999/profitability", headers=auth_headers)
    assert resp.status_code == 404
    assert resp.json()["detail"]["error"]["code"] == "CUSTOMER_NOT_FOUND"


def test_customer_ranking_api(client, auth_headers, sample_customer, sample_trips):
    resp = client.get("/api/v1/customers/profitability/ranking", headers=auth_headers)
    assert resp.status_code == 200
