"""Fleet360 — Customer Pydantic Schemas."""
from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class CustomerBase(BaseModel):
    customer_code: str
    name: str
    industry: Optional[str] = None
    contact_person: Optional[str] = None
    contact_email: Optional[str] = None
    contract_start: Optional[date] = None
    contract_end: Optional[date] = None
    contract_value: Optional[float] = None
    payment_terms: str = "NET-30"
    status: str = "active"


class CustomerCreate(CustomerBase):
    pass


class CustomerOut(CustomerBase):
    id: int
    created_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)


class CustomerListOut(BaseModel):
    total: int
    customers: list[CustomerOut]
