# app/crud/order.py
from typing import List, Optional
from sqlalchemy.orm import Session
from decimal import Decimal

from app.models.order import Order
from app.models.order_item import OrderItem

# ─────────────────────────────────────────
# CRUD Fonksiyonları for Order
# ─────────────────────────────────────────

def get(db: Session, order_id: int) -> Optional[Order]:
    """Bir siparişi ID ile getirir."""
    return db.query(Order).filter(Order.id == order_id).first()


def list_by_user(
    db: Session,
    user_id: int,
    skip: int = 0,
    limit: int = 100
) -> List[Order]:
    """Belirli kullanıcıya ait sipariş listesini döner."""
    return (
        db.query(Order)
        .filter(Order.user_id == user_id)
        .order_by(Order.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
def create(
    db: Session,
    *,
    user_id: int,
    total_amount: Decimal,
    status: str = "pending",
    address_id: Optional[int] = None,
    street: Optional[str] = None,
    city: Optional[str] = None,
    country: Optional[str] = None,
    postal_code: Optional[str] = None,
) -> Order:
    db_obj = Order(
        user_id      = user_id,
        total_amount = total_amount,
        status       = status,
        address_id   = address_id,
        street       = street,
        city         = city,
        country      = country,
        postal_code  = postal_code,
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def update_status(
    db: Session,
    *,
    db_obj: Order,
    status: str
) -> Order:
    """Sipariş durumunu günceller."""
    db_obj.status = status
    db.commit()
    db.refresh(db_obj)
    return db_obj


def remove(db: Session, *, order_id: int) -> bool:
    """Bir siparişi siler (hard delete)."""
    obj = get(db, order_id)
    if not obj:
        return False
    db.delete(obj)
    db.commit()
    return True
