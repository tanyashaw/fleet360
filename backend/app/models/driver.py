"""Fleet360 — Driver model."""
from sqlalchemy import Column, Integer, String, Float, Date, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class Driver(Base):
    __tablename__ = "drivers"

    id = Column(Integer, primary_key=True, index=True)
    employee_code = Column(String(20), unique=True, nullable=False, index=True)
    name = Column(String(100), nullable=False)
    license_number = Column(String(30), unique=True, nullable=False)
    license_expiry = Column(Date, nullable=True)
    salary = Column(Float, nullable=False)          # Monthly salary INR
    branch_id = Column(String(20), nullable=False, default="HQ")
    joining_date = Column(Date, nullable=True)
    status = Column(String(20), nullable=False, default="active")  # active | on_leave | terminated
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    trips = relationship("Trip", back_populates="driver", lazy="dynamic")

    def __repr__(self) -> str:
        return f"<Driver {self.employee_code}: {self.name}>"
