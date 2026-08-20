"""Fleet360 — Maintenance Record model."""
from sqlalchemy import Column, Integer, Float, Date, DateTime, ForeignKey, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class MaintenanceRecord(Base):
    __tablename__ = "maintenance_records"

    id = Column(Integer, primary_key=True, index=True)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"), nullable=False, index=True)
    date = Column(Date, nullable=False, index=True)
    maintenance_type = Column(String(50), nullable=False)  # scheduled | breakdown | accident | tyre | engine
    amount = Column(Float, nullable=False)                  # INR
    downtime_days = Column(Float, default=0.0)              # days vehicle was off-road
    vendor = Column(String(100), nullable=True)
    description = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    vehicle = relationship("Vehicle", back_populates="maintenance_records")

    def __repr__(self) -> str:
        return (
            f"<MaintenanceRecord id={self.id} vehicle_id={self.vehicle_id} "
            f"type={self.maintenance_type} amount={self.amount}>"
        )
