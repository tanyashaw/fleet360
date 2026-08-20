"""
Fleet360 — AI Insight Service
==============================
Architecture:

    AIInsightProvider (abstract base)
        │
        ├── RuleBasedInsightProvider  ← used in POC (no LLM API key needed)
        │
        └── LLMInsightProvider        ← plug in later via LLM_PROVIDER env var

The active provider is selected at startup based on settings.LLM_PROVIDER.
All providers return List[Insight] — the API layer is unchanged regardless of provider.
"""
import json
import logging
from abc import ABC, abstractmethod
from datetime import date
from typing import Optional

from sqlalchemy.orm import Session

from app.core.config import settings
from app.schemas.insight import Insight, InsightListOut
from app.services import vehicle_service, route_service, customer_service, driver_service

logger = logging.getLogger(__name__)


# ── Abstract Provider ─────────────────────────────────────────────────────────

class AIInsightProvider(ABC):
    """All insight providers must implement this interface."""

    @abstractmethod
    def generate(
        self,
        db: Session,
        entity_type: Optional[str],
        start_date: Optional[date],
        end_date: Optional[date],
    ) -> list[Insight]:
        ...

    @property
    @abstractmethod
    def name(self) -> str:
        ...


# ── Rule-Based Provider ───────────────────────────────────────────────────────

class RuleBasedInsightProvider(AIInsightProvider):
    """
    Stateless rule engine. Runs on each request — no external API calls.

    Rules:
      V1  Cost Anomaly       — vehicle cost jumped >15% vs fleet average cost/km
      V2  Under-Utilization  — vehicle utilization < 70% while fleet avg > 80%
      V3  High Performer     — vehicle in top 1 by contribution
      R1  Low-Margin Route   — route margin < 20%
      C1  Low-Margin Customer — customer margin < 15%
      C2  High Revenue Low Margin — revenue > median but margin < 20%
      D1  Low Driver Score   — driver overall score < 50
      D2  Top Driver         — driver overall score > 85
    """

    @property
    def name(self) -> str:
        return "rule_based"

    def generate(
        self,
        db: Session,
        entity_type: Optional[str],
        start_date: Optional[date],
        end_date: Optional[date],
    ) -> list[Insight]:
        insights: list[Insight] = []
        period = f"{start_date} to {end_date}" if start_date else "all-time"

        if entity_type in (None, "vehicle"):
            insights.extend(self._vehicle_insights(db, start_date, end_date, period))
        if entity_type in (None, "route"):
            insights.extend(self._route_insights(db, start_date, end_date, period))
        if entity_type in (None, "customer"):
            insights.extend(self._customer_insights(db, start_date, end_date, period))
        if entity_type in (None, "driver"):
            insights.extend(self._driver_insights(db, start_date, end_date, period))

        return insights

    # ── Vehicle rules ─────────────────────────────────────────────────────

    def _vehicle_insights(self, db, start_date, end_date, period) -> list[Insight]:
        insights = []
        ranking = vehicle_service.get_vehicle_ranking(db, start_date, end_date)
        vehicles = ranking.vehicles
        if not vehicles:
            return []

        fleet_avg_util = sum(v.utilization_percentage for v in vehicles) / len(vehicles)
        fleet_avg_cost_km = sum(v.cost_per_km for v in vehicles) / len(vehicles)
        fleet_avg_margin = sum(v.margin_percentage for v in vehicles) / len(vehicles)

        for v in vehicles:
            # V1 — Cost anomaly
            if fleet_avg_cost_km > 0 and v.cost_per_km > fleet_avg_cost_km * 1.20:
                pct_above = round((v.cost_per_km / fleet_avg_cost_km - 1) * 100, 1)
                insights.append(Insight(
                    type="COST_ANOMALY",
                    severity="HIGH",
                    entity_type="vehicle",
                    entity_id=v.vehicle_id,
                    entity_name=v.vehicle_number,
                    message=(
                        f"{v.vehicle_number} cost/km is ₹{v.cost_per_km:.1f}, "
                        f"which is {pct_above}% above the fleet average of ₹{fleet_avg_cost_km:.1f}."
                    ),
                    recommendation="Review fuel consumption and recent maintenance expenses.",
                    metric_value=v.cost_per_km,
                    threshold_value=fleet_avg_cost_km * 1.20,
                    period=period,
                ))

            # V2 — Under-utilization
            if fleet_avg_util > 80 and v.utilization_percentage < 70:
                insights.append(Insight(
                    type="UNDER_UTILIZATION",
                    severity="MEDIUM",
                    entity_type="vehicle",
                    entity_id=v.vehicle_id,
                    entity_name=v.vehicle_number,
                    message=(
                        f"{v.vehicle_number} utilization is {v.utilization_percentage:.1f}% "
                        f"while the fleet average is {fleet_avg_util:.1f}%."
                    ),
                    recommendation="Assign additional routes or investigate scheduling gaps.",
                    metric_value=v.utilization_percentage,
                    threshold_value=70.0,
                    period=period,
                ))

            # V3 — Low margin vehicle
            if v.margin_percentage < 15 and v.revenue > 0:
                insights.append(Insight(
                    type="LOW_MARGIN",
                    severity="HIGH" if v.margin_percentage < 5 else "MEDIUM",
                    entity_type="vehicle",
                    entity_id=v.vehicle_id,
                    entity_name=v.vehicle_number,
                    message=(
                        f"{v.vehicle_number} contribution margin is only {v.margin_percentage:.1f}%, "
                        f"far below the fleet average of {fleet_avg_margin:.1f}%."
                    ),
                    recommendation=(
                        "Review route assignment and negotiate higher rates or reduce operating costs."
                    ),
                    metric_value=v.margin_percentage,
                    threshold_value=15.0,
                    period=period,
                ))

        # V4 — Top performer
        if vehicles:
            top = vehicles[0]
            insights.append(Insight(
                type="HIGH_PERFORMER",
                severity="INFO",
                entity_type="vehicle",
                entity_id=top.vehicle_id,
                entity_name=top.vehicle_number,
                message=(
                    f"{top.vehicle_number} is the highest-performing vehicle this period "
                    f"with ₹{top.contribution:,.0f} contribution at {top.margin_percentage:.1f}% margin."
                ),
                recommendation="Use this vehicle's operational profile as a benchmark for the fleet.",
                metric_value=top.contribution,
                period=period,
            ))

        return insights

    # ── Route rules ───────────────────────────────────────────────────────

    def _route_insights(self, db, start_date, end_date, period) -> list[Insight]:
        insights = []
        ranking = route_service.get_route_ranking(db, start_date, end_date)
        routes = ranking.routes
        if not routes:
            return []

        for r in routes:
            if r.total_revenue == 0:
                continue
            if r.margin_percentage < 20:
                insights.append(Insight(
                    type="LOW_MARGIN",
                    severity="HIGH" if r.margin_percentage < 10 else "MEDIUM",
                    entity_type="route",
                    entity_id=r.route_id,
                    entity_name=r.route_code,
                    message=(
                        f"Route {r.route_code} ({r.origin}→{r.destination}) "
                        f"contribution margin is only {r.margin_percentage:.1f}%."
                    ),
                    recommendation=(
                        "Renegotiate contract rates, optimize vehicle assignment, "
                        "or consider suspending this route."
                    ),
                    metric_value=r.margin_percentage,
                    threshold_value=20.0,
                    period=period,
                ))

            if r.utilization_percentage < 60 and r.total_trips > 0:
                insights.append(Insight(
                    type="UNDER_UTILIZATION",
                    severity="LOW",
                    entity_type="route",
                    entity_id=r.route_id,
                    entity_name=r.route_code,
                    message=(
                        f"Route {r.route_code} utilization is {r.utilization_percentage:.1f}%, "
                        f"indicating spare capacity."
                    ),
                    recommendation="Explore additional customer contracts for this route.",
                    metric_value=r.utilization_percentage,
                    threshold_value=60.0,
                    period=period,
                ))

        return insights

    # ── Customer rules ────────────────────────────────────────────────────

    def _customer_insights(self, db, start_date, end_date, period) -> list[Insight]:
        insights = []
        ranking = customer_service.get_customer_ranking(db, start_date, end_date)
        customers = ranking.customers
        if not customers:
            return []

        revenues = [c.contract_revenue for c in customers if c.contract_revenue > 0]
        median_rev = sorted(revenues)[len(revenues) // 2] if revenues else 0

        for c in customers:
            if c.contract_revenue == 0:
                continue

            # Low margin
            if c.margin_percentage < 15:
                insights.append(Insight(
                    type="LOW_MARGIN",
                    severity="HIGH" if c.margin_percentage < 9 else "MEDIUM",
                    entity_type="customer",
                    entity_id=c.customer_id,
                    entity_name=c.customer_name,
                    message=(
                        f"Customer {c.customer_name} generates ₹{c.contract_revenue:,.0f} revenue "
                        f"but only {c.margin_percentage:.1f}% contribution margin."
                    ),
                    recommendation=(
                        "Review service costs and renegotiate contract terms. "
                        "Consider priority cost-reduction measures."
                    ),
                    metric_value=c.margin_percentage,
                    threshold_value=15.0,
                    period=period,
                ))

            # High revenue, low margin — risk
            if c.contract_revenue > median_rev and c.margin_percentage < 20:
                insights.append(Insight(
                    type="RISK",
                    severity="HIGH",
                    entity_type="customer",
                    entity_id=c.customer_id,
                    entity_name=c.customer_name,
                    message=(
                        f"High-revenue customer {c.customer_name} (₹{c.contract_revenue:,.0f}) "
                        f"has a low margin of {c.margin_percentage:.1f}%. "
                        f"Revenue concentration risk."
                    ),
                    recommendation=(
                        "Immediate commercial review recommended. "
                        "Escalate to management before next contract renewal."
                    ),
                    metric_value=c.margin_percentage,
                    threshold_value=20.0,
                    period=period,
                ))

        # Top customer
        top = customers[0]
        insights.append(Insight(
            type="HIGH_PERFORMER",
            severity="INFO",
            entity_type="customer",
            entity_id=top.customer_id,
            entity_name=top.customer_name,
            message=(
                f"{top.customer_name} is the most profitable customer this period "
                f"with ₹{top.contribution:,.0f} contribution at {top.margin_percentage:.1f}% margin."
            ),
            recommendation="Prioritize renewal and explore contract expansion.",
            metric_value=top.contribution,
            period=period,
        ))

        return insights

    # ── Driver rules ──────────────────────────────────────────────────────

    def _driver_insights(self, db, start_date, end_date, period) -> list[Insight]:
        insights = []
        scorecard = driver_service.get_driver_scorecard(db, start_date, end_date)
        drivers = scorecard.drivers
        if not drivers:
            return []

        for d in drivers:
            if d.overall_score < 50:
                insights.append(Insight(
                    type="UNDER_UTILIZATION",
                    severity="MEDIUM",
                    entity_type="driver",
                    entity_id=d.driver_id,
                    entity_name=d.driver_name,
                    message=(
                        f"Driver {d.driver_name} has a low productivity score of "
                        f"{d.overall_score:.1f}/100 (fleet avg: {scorecard.fleet_avg_score:.1f})."
                    ),
                    recommendation="Review scheduling, attendance, and performance coaching.",
                    metric_value=d.overall_score,
                    threshold_value=50.0,
                    period=period,
                ))

        # Top driver
        top = drivers[0]
        if top.overall_score > 75:
            insights.append(Insight(
                type="HIGH_PERFORMER",
                severity="INFO",
                entity_type="driver",
                entity_id=top.driver_id,
                entity_name=top.driver_name,
                message=(
                    f"{top.driver_name} is the top-performing driver "
                    f"with a score of {top.overall_score:.1f}/100 "
                    f"and {top.total_trips} trips completed."
                ),
                recommendation="Consider nominating for performance incentive.",
                metric_value=top.overall_score,
                period=period,
            ))

        return insights


# ── LLM Provider (OpenAI) ─────────────────────────────────────────────────────

class LLMInsightProvider(AIInsightProvider):
    """
    OpenAI-backed AI Insight Provider.
    Analyzes fleet financial and operational KPIs to detect cost leakage,
    anomalies, under-performance, and emerging trends using OpenAI models.
    """

    @property
    def name(self) -> str:
        return "openai"

    def _get_api_key(self) -> Optional[str]:
        return settings.OPENAI_API_KEY or settings.LLM_API_KEY

    def generate(
        self,
        db: Session,
        entity_type: Optional[str],
        start_date: Optional[date],
        end_date: Optional[date],
    ) -> list[Insight]:
        api_key = self._get_api_key()
        if not api_key:
            logger.warning(
                "OPENAI_API_KEY / LLM_API_KEY not configured in .env. "
                "Falling back to RuleBasedInsightProvider."
            )
            return RuleBasedInsightProvider().generate(db, entity_type, start_date, end_date)

        try:
            from openai import OpenAI

            context_data = self._gather_fleet_context(db, entity_type, start_date, end_date)

            system_prompt = (
                "You are an expert Fleet Operations & Financial Intelligence AI for an Indian transport company.\n"
                "Analyze the provided fleet management dataset for cost leakage, operational anomalies, "
                "under-performing assets/drivers, low-margin customer contracts, and emerging risks.\n\n"
                "Output MUST be a valid JSON object with a top-level key 'insights' containing an array of objects matching:\n"
                "{\n"
                "  \"insights\": [\n"
                "    {\n"
                "      \"type\": \"COST_ANOMALY\" | \"UNDER_UTILIZATION\" | \"LOW_MARGIN\" | \"HIGH_PERFORMER\" | \"RISK\" | \"OPPORTUNITY\",\n"
                "      \"severity\": \"HIGH\" | \"MEDIUM\" | \"LOW\" | \"INFO\",\n"
                "      \"entity_type\": \"vehicle\" | \"route\" | \"customer\" | \"driver\" | \"fleet\",\n"
                "      \"entity_id\": number or null,\n"
                "      \"entity_name\": string,\n"
                "      \"message\": string (clear explanation of cost leakage, anomaly, or trend),\n"
                "      \"recommendation\": string (actionable commercial/operational recommendation),\n"
                "      \"metric_value\": number or null,\n"
                "      \"threshold_value\": number or null\n"
                "    }\n"
                "  ]\n"
                "}"
            )

            client = OpenAI(api_key=api_key)
            model_name = settings.OPENAI_MODEL or "gpt-4o-mini"
            logger.info("Requesting AI insights from OpenAI (%s)...", model_name)

            response = client.chat.completions.create(
                model=model_name,
                response_format={"type": "json_object"},
                messages=[
                    {"role": "system", "content": system_prompt},
                    {
                        "role": "user",
                        "content": (
                            f"Target Scope: entity_type={entity_type or 'all'}, period={start_date} to {end_date}.\n"
                            f"Fleet Performance Data:\n{json.dumps(context_data, default=str, indent=2)}"
                        ),
                    },
                ],
                temperature=0.2,
            )

            content = response.choices[0].message.content
            parsed = json.loads(content)
            raw_insights = parsed.get("insights", [])

            insights = []
            period_str = f"{start_date} to {end_date}" if start_date else "all-time"
            for item in raw_insights:
                insights.append(Insight(
                    type=item.get("type", "COST_ANOMALY"),
                    severity=item.get("severity", "MEDIUM"),
                    entity_type=item.get("entity_type", "fleet"),
                    entity_id=item.get("entity_id"),
                    entity_name=str(item.get("entity_name", "Fleet")),
                    message=item.get("message", ""),
                    recommendation=item.get("recommendation", ""),
                    metric_value=item.get("metric_value"),
                    threshold_value=item.get("threshold_value"),
                    period=period_str,
                ))

            logger.info("OpenAI returned %d structured AI insights.", len(insights))
            return insights

        except Exception as exc:
            logger.exception("OpenAI insight generation failed (%s). Falling back to RuleBasedInsightProvider.", exc)
            return RuleBasedInsightProvider().generate(db, entity_type, start_date, end_date)

    def _gather_fleet_context(self, db: Session, entity_type: Optional[str], start_date, end_date) -> dict:
        data = {}
        if entity_type in (None, "vehicle"):
            ranking = vehicle_service.get_vehicle_ranking(db, start_date, end_date)
            data["vehicles"] = [v.model_dump() for v in ranking.vehicles[:10]]
        if entity_type in (None, "route"):
            ranking = route_service.get_route_ranking(db, start_date, end_date)
            data["routes"] = [r.model_dump() for r in ranking.routes[:10]]
        if entity_type in (None, "customer"):
            ranking = customer_service.get_customer_ranking(db, start_date, end_date)
            data["customers"] = [c.model_dump() for c in ranking.customers[:10]]
        if entity_type in (None, "driver"):
            scorecard = driver_service.get_driver_scorecard(db, start_date, end_date)
            data["drivers"] = [d.model_dump() for d in scorecard.drivers[:10]]
        return data


# ── Provider Factory ──────────────────────────────────────────────────────────

def get_insight_provider() -> AIInsightProvider:
    api_key = settings.OPENAI_API_KEY or settings.LLM_API_KEY
    if settings.LLM_PROVIDER in ("openai", "llm") or (api_key and settings.LLM_PROVIDER != "rule_based"):
        return LLMInsightProvider()
    return RuleBasedInsightProvider()


# ── Public API ────────────────────────────────────────────────────────────────

def generate_insights(
    db: Session,
    entity_type: Optional[str] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
) -> InsightListOut:
    provider = get_insight_provider()
    logger.info("Generating insights using provider: %s", provider.name)

    raw = provider.generate(db, entity_type, start_date, end_date)

    # De-duplicate and sort by severity
    severity_order = {"HIGH": 0, "MEDIUM": 1, "LOW": 2, "INFO": 3}
    raw.sort(key=lambda x: severity_order.get(x.severity, 99))

    return InsightListOut(
        total=len(raw),
        period_start=str(start_date) if start_date else "all-time",
        period_end=str(end_date) if end_date else "all-time",
        provider=provider.name,
        insights=raw,
    )
