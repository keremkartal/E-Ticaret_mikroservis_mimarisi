from typing import List, Optional
from sqlalchemy.orm import Session

from app.models.order_item import OrderItem

def get_item(db: Session, order_id: int, product_id: int) -> Optional[OrderItem]:
    """Sipariş ve ürün bazlı tekil öğe getirir."""
    return (
        db.query(OrderItem)
        .filter(
            OrderItem.order_id == order_id,
            OrderItem.product_id == product_id
        )
        .first()
    )


def list_items(db: Session, order_id: int) -> List[OrderItem]:
    """Belirli siparişe ait tüm öğeleri listeler."""
    return db.query(OrderItem).filter(OrderItem.order_id == order_id).all()


def create_item(
    db: Session,
    *,
    order_id: int,
    product_id: int,
    quantity: int,
    price_at_order
) -> OrderItem:
    """Yeni bir sipariş öğesi oluşturur."""
    db_obj = OrderItem(
        order_id=order_id,
        product_id=product_id,
        quantity=quantity,
        price_at_order=price_at_order
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj


def remove_item(db: Session, *, order_id: int, product_id: int) -> bool:
    """Siparişten belirli bir öğeyi siler."""
    obj = get_item(db, order_id, product_id)
    if not obj:
        return False
    db.delete(obj)
    db.commit()
    return True
