"""Fleet360 — Vehicle model."""
from sqlalchemy import Column, Integer, String, Float, Date, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class Vehicle(Base):
    __tablename__ = "vehicles"

    id = Column(Integer, primary_key=True, index=True)
    vehicle_number = Column(String(20), unique=True, nullable=False, index=True)
    registration_number = Column(String(25), unique=True, nullable=False)
    vehicle_type = Column(String(20), nullable=False)   # BUS | TRUCK | VAN
    capacity = Column(Integer, nullable=False)           # seats (bus/van) or metric tons (truck)
    branch_id = Column(String(20), nullable=False, default="HQ")
    status = Column(String(20), nullable=False, default="active")  # active | inactive | maintenance
    purchase_date = Column(Date, nullable=True)
    purchase_value = Column(Float, nullable=True)        # INR
    fuel_type = Column(String(20), default="diesel")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    trips = relationship("Trip", back_populates="vehicle", lazy="dynamic")
    fuel_records = relationship("FuelRecord", back_populates="vehicle", lazy="dynamic")
    maintenance_records = relationship("MaintenanceRecord", back_populates="vehicle", lazy="dynamic")
    transactions = relationship("FinancialTransaction", back_populates="vehicle", lazy="dynamic")

    def __repr__(self) -> str:
        return f"<Vehicle {self.vehicle_number} ({self.vehicle_type})>"
