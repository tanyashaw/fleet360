"""Fleet360 — Financial Transaction model.
Mirrors the structure that QuickBooks will eventually provide.
"""
from sqlalchemy import Column, Integer, String, Float, Date, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

# Allowed transaction types
TRANSACTION_TYPES = (
    "revenue",
    "fuel",
    "maintenance",
    "salary",
    "insurance",
    "toll",
    "other_operating_cost",
)


class FinancialTransaction(Base):
    __tablename__ = "financial_transactions"

    id = Column(Integer, primary_key=True, index=True)
    quickbooks_id = Column(String(50), nullable=True, index=True)   # QB sync key
    transaction_type = Column(String(30), nullable=False, index=True)
    transaction_date = Column(Date, nullable=False, index=True)
    account = Column(String(100), nullable=True)                     # QB Chart of Accounts
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=True, index=True)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"), nullable=True, index=True)
    route_id = Column(Integer, ForeignKey("routes.id"), nullable=True, index=True)
    driver_id = Column(Integer, ForeignKey("drivers.id"), nullable=True, index=True)
    amount = Column(Float, nullable=False)                           # INR (positive = cost; revenue labeled by type)
    description = Column(String(255), nullable=True)
    reference_number = Column(String(50), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    vehicle = relationship("Vehicle", back_populates="transactions")
    customer = relationship("Customer", back_populates="transactions")

    def __repr__(self) -> str:
        return f"<FinancialTransaction id={self.id} type={self.transaction_type} amount={self.amount}>"
