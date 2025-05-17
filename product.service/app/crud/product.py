# app/crud/product.py
from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.product import Product
from app.schemas.product import ProductCreate, ProductUpdate

# ─────────────────────────────────────────
# CRUD Fonksiyonları for Product
# ─────────────────────────────────────────

def get(db: Session, product_id: int) -> Optional[Product]:
    return db.query(Product).filter(Product.id == product_id).first()


def list(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    only_visible: bool = True,
) -> List[Product]:
    query = db.query(Product)
    if only_visible:
        query = query.filter(Product.is_visible == True)
    return query.offset(skip).limit(limit).all()


def create(db: Session, *, obj_in: ProductCreate) -> Product:
    db_obj = Product(**obj_in.dict())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj


def update(
    db: Session,
    *,
    db_obj: Product,
    obj_in: ProductUpdate
) -> Product:
    data = obj_in.dict(exclude_unset=True)
    for field, value in data.items():
        setattr(db_obj, field, value)
    db.commit()
    db.refresh(db_obj)
    return db_obj



def soft_delete(db: Session, *, product_id: int) -> bool:
    """
    Gerçek silme yerine is_visible=False yapar.
    Returns True if found and marked, False otherwise.
    """
    prod = db.query(Product).filter(Product.id == product_id).first()
    if not prod:
        return False
    prod.is_visible = False
    db.commit()
    return True

def delete_product(db: Session, product_id: int) -> bool:
    """
    Gerçek silme yerine is_visible=False yapar.
    """
    prod = db.query(Product).filter(Product.id == product_id).first()
    if not prod:
        return False
    prod.is_visible = False
    db.commit()
    return True