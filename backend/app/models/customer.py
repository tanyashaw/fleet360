"""Fleet360 — Customer model."""
from sqlalchemy import Column, Integer, String, Float, Date, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)
    customer_code = Column(String(20), unique=True, nullable=False, index=True)
    name = Column(String(150), nullable=False)
    industry = Column(String(80), nullable=True)
    contact_person = Column(String(100), nullable=True)
    contact_email = Column(String(150), nullable=True)
    contract_start = Column(Date, nullable=True)
    contract_end = Column(Date, nullable=True)
    contract_value = Column(Float, nullable=True)   # Annual contract value INR
    payment_terms = Column(String(50), default="NET-30")
    status = Column(String(20), nullable=False, default="active")  # active | inactive | at_risk
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    trips = relationship("Trip", back_populates="customer", lazy="dynamic")
    transactions = relationship("FinancialTransaction", back_populates="customer", lazy="dynamic")

    def __repr__(self) -> str:
        return f"<Customer {self.customer_code}: {self.name}>"
