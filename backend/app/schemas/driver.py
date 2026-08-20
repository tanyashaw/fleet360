"""Fleet360 — Driver Pydantic Schemas."""
from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class DriverBase(BaseModel):
    employee_code: str
    name: str
    license_number: str
    license_expiry: Optional[date] = None
    salary: float
    branch_id: str = "HQ"
    joining_date: Optional[date] = None
    status: str = "active"


class DriverCreate(DriverBase):
    pass


class DriverOut(DriverBase):
    id: int
    created_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)


class DriverListOut(BaseModel):
    total: int
    drivers: list[DriverOut]
