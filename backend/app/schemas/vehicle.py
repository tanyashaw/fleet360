"""Fleet360 — Vehicle Pydantic Schemas."""
from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class VehicleBase(BaseModel):
    vehicle_number: str
    registration_number: str
    vehicle_type: str
    capacity: int
    branch_id: str = "HQ"
    status: str = "active"
    purchase_date: Optional[date] = None
    purchase_value: Optional[float] = None
    fuel_type: str = "diesel"


class VehicleCreate(VehicleBase):
    pass


class VehicleOut(VehicleBase):
    id: int
    created_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)


class VehicleListOut(BaseModel):
    total: int
    vehicles: list[VehicleOut]
