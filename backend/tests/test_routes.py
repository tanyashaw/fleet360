"""Fleet360 — Route Analytics Tests."""
import pytest

from app.services.route_service import get_route_profitability, get_route_ranking


def test_route_profitability_no_trips(db, sample_route):
    result = get_route_profitability(db, sample_route.id)
    assert result is not None
    assert result.total_trips == 0
    assert result.total_revenue == 0.0
    assert result.margin_percentage == 0.0


def test_route_profitability_with_trips(db, sample_route, sample_trips):
    result = get_route_profitability(db, sample_route.id)
    assert result.total_trips == 10
    assert result.total_revenue > 0
    assert result.route_code == "TEST-RT-01"


def test_route_profitability_nonexistent(db):
    result = get_route_profitability(db, 9999)
    assert result is None


def test_route_ranking(db, sample_route, sample_trips):
    ranking = get_route_ranking(db)
    assert ranking.total >= 1
    contributions = [r.contribution for r in ranking.routes]
    assert contributions == sorted(contributions, reverse=True)


def test_route_ranking_assigns_ranks(db, sample_route, sample_trips):
    ranking = get_route_ranking(db)
    assert ranking.routes[0].profitability_rank == 1


def test_list_routes_api(client, auth_headers, sample_route):
    resp = client.get("/api/v1/routes", headers=auth_headers)
    assert resp.status_code == 200
    assert resp.json()["total"] >= 1


def test_route_profitability_api(client, auth_headers, sample_route, sample_trips):
    resp = client.get(f"/api/v1/routes/{sample_route.id}/profitability", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert "total_revenue" in data
    assert "margin_percentage" in data


def test_route_not_found_api(client, auth_headers):
    resp = client.get("/api/v1/routes/9999/profitability", headers=auth_headers)
    assert resp.status_code == 404
    assert resp.json()["detail"]["error"]["code"] == "ROUTE_NOT_FOUND"


def test_route_ranking_api(client, auth_headers, sample_route, sample_trips):
    resp = client.get("/api/v1/routes/profitability/ranking", headers=auth_headers)
    assert resp.status_code == 200
