"""Fleet360 — Trip model."""
from sqlalchemy import Column, Integer, String, Float, Date, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class Trip(Base):
    __tablename__ = "trips"

    id = Column(Integer, primary_key=True, index=True)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"), nullable=False, index=True)
    driver_id = Column(Integer, ForeignKey("drivers.id"), nullable=False, index=True)
    route_id = Column(Integer, ForeignKey("routes.id"), nullable=False, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False, index=True)
    trip_date = Column(Date, nullable=False, index=True)
    distance_km = Column(Float, nullable=False)
    passengers = Column(Integer, nullable=True)          # for passenger buses
    load_tons = Column(Float, nullable=True)             # for trucks
    service_hours = Column(Float, nullable=False)        # duration of trip in hours
    revenue = Column(Float, nullable=False)              # INR
    status = Column(String(20), default="completed")    # completed | cancelled | in_progress
    notes = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    vehicle = relationship("Vehicle", back_populates="trips")
    driver = relationship("Driver", back_populates="trips")
    route = relationship("Route", back_populates="trips")
    customer = relationship("Customer", back_populates="trips")

    def __repr__(self) -> str:
        return f"<Trip id={self.id} vehicle_id={self.vehicle_id} date={self.trip_date}>"
