"""Fleet360 — Route Pydantic Schemas."""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class RouteBase(BaseModel):
    route_code: str
    origin: str
    destination: str
    distance_km: float
    contract_id: Optional[str] = None
    route_type: str = "intercity"
    toll_applicable: int = 0
    status: str = "active"


class RouteCreate(RouteBase):
    pass


class RouteOut(RouteBase):
    id: int
    created_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)


class RouteListOut(BaseModel):
    total: int
    routes: list[RouteOut]
