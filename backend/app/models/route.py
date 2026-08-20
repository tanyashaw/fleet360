"""Fleet360 — Route model."""
from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class Route(Base):
    __tablename__ = "routes"

    id = Column(Integer, primary_key=True, index=True)
    route_code = Column(String(30), unique=True, nullable=False, index=True)
    origin = Column(String(100), nullable=False)
    destination = Column(String(100), nullable=False)
    distance_km = Column(Float, nullable=False)
    contract_id = Column(String(30), nullable=True)     # links to customer contract
    route_type = Column(String(20), default="intercity")  # intercity | intracity | highway
    toll_applicable = Column(Integer, default=0)         # 0=no, 1=yes
    status = Column(String(20), nullable=False, default="active")  # active | suspended
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    trips = relationship("Trip", back_populates="route", lazy="dynamic")

    def __repr__(self) -> str:
        return f"<Route {self.route_code}: {self.origin}→{self.destination} ({self.distance_km} km)>"
