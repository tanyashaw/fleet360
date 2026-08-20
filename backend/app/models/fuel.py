"""Fleet360 — Fuel Record model."""
from sqlalchemy import Column, Integer, Float, Date, DateTime, ForeignKey, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class FuelRecord(Base):
    __tablename__ = "fuel_records"

    id = Column(Integer, primary_key=True, index=True)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"), nullable=False, index=True)
    date = Column(Date, nullable=False, index=True)
    liters = Column(Float, nullable=False)
    amount = Column(Float, nullable=False)           # INR
    odometer_km = Column(Float, nullable=True)       # odometer reading at fill-up
    fuel_station = Column(String(100), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    vehicle = relationship("Vehicle", back_populates="fuel_records")

    @property
    def price_per_liter(self) -> float:
        """Derive price/litre from amount and litres."""
        return round(self.amount / self.liters, 2) if self.liters else 0.0

    def __repr__(self) -> str:
        return f"<FuelRecord id={self.id} vehicle_id={self.vehicle_id} liters={self.liters} date={self.date}>"
