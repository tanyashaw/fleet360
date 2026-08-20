"""Fleet360 — Customer Routes."""
import logging
from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.customer import Customer
from app.schemas.customer import CustomerOut, CustomerListOut
from app.schemas.analytics import CustomerProfitability, CustomerRankingOut
from app.services.customer_service import get_customer_profitability, get_customer_ranking

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/customers", tags=["Customers"])


def _not_found(customer_id: int):
    raise HTTPException(
        status_code=404,
        detail={
            "success": False,
            "error": {
                "code": "CUSTOMER_NOT_FOUND",
                "message": f"Customer with ID {customer_id} was not found.",
            },
        },
    )


@router.get("", response_model=CustomerListOut)
def list_customers(
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    """List all customers."""
    q = db.query(Customer)
    if status:
        q = q.filter(Customer.status == status)
    customers = q.all()
    return CustomerListOut(total=len(customers), customers=customers)


@router.get("/profitability/ranking", response_model=CustomerRankingOut)
def customer_ranking(
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    """Customer profitability ranking — sorted by contribution."""
    if start_date is None:
        start_date = date(2026, 8, 1)
    if end_date is None:
        end_date = date(2026, 8, 20)
    return get_customer_ranking(db, start_date, end_date)


@router.get("/{customer_id}", response_model=CustomerOut)
def get_customer(
    customer_id: int,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    """Get a single customer's master data."""
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        _not_found(customer_id)
    return customer


@router.get("/{customer_id}/profitability", response_model=CustomerProfitability)
def customer_profitability(
    customer_id: int,
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    """Full P&L for a single customer / contract."""
    result = get_customer_profitability(db, customer_id, start_date, end_date)
    if not result:
        _not_found(customer_id)
    return result
