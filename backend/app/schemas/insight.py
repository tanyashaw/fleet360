"""Fleet360 — AI Insight Pydantic Schemas."""
from typing import Optional
from pydantic import BaseModel


class Insight(BaseModel):
    type: str           # COST_ANOMALY | UNDER_UTILIZATION | LOW_MARGIN | HIGH_PERFORMER | RISK | OPPORTUNITY
    severity: str       # HIGH | MEDIUM | LOW | INFO
    entity_type: str    # vehicle | route | customer | driver | fleet
    entity_id: Optional[int] = None
    entity_name: str
    message: str
    recommendation: str
    metric_value: Optional[float] = None   # the numeric value that triggered this insight
    threshold_value: Optional[float] = None
    period: Optional[str] = None


class InsightListOut(BaseModel):
    total: int
    period_start: str
    period_end: str
    provider: str       # rule_based | openai | gemini
    insights: list[Insight]
