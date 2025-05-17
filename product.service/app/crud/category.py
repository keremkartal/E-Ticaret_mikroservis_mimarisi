
# app/crud/category.py
from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.category import Category
from app.schemas.category import CategoryCreate, CategoryUpdate

# ─────────────────────────────────────────
# CRUD Fonksiyonları for Category
# ─────────────────────────────────────────

def get(db: Session, category_id: int) -> Optional[Category]:
    return db.query(Category).filter(Category.id == category_id).first()


def list(db: Session, skip: int = 0, limit: int = 100) -> List[Category]:
    return db.query(Category).offset(skip).limit(limit).all()


def create(db: Session, *, obj_in: CategoryCreate) -> Category:
    db_obj = Category(**obj_in.dict())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj


def update(
    db: Session,
    *,
    db_obj: Category,
    obj_in: CategoryUpdate
) -> Category:
    data = obj_in.dict(exclude_unset=True)
    for field, value in data.items():
        setattr(db_obj, field, value)
    db.commit()
    db.refresh(db_obj)
    return db_obj


def remove(db: Session, *, category_id: int) -> bool:
    obj = get(db, category_id)
    if not obj:
        return False
    db.delete(obj)
    db.commit()
    return True
