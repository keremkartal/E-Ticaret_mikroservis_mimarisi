# app/crud/contact.py
from typing import List, Optional, Union, Dict, Any
from sqlalchemy.orm import Session
from app.models.contact import Contact
from app.schemas.contact import ContactCreate
from sqlalchemy import delete

# ─────────────────────────────────────────
# CRUD Fonksiyonları
# ─────────────────────────────────────────

def get(db: Session, contact_id: int) -> Optional[Contact]:
    return db.query(Contact).filter(Contact.id == contact_id).first()


def list_by_user(db: Session, user_id: int) -> List[Contact]:
    return db.query(Contact).filter(Contact.user_id == user_id).all()


def create(db: Session, *, user_id: int, obj_in: ContactCreate) -> Contact:
    db_obj = Contact(user_id=user_id, **obj_in.dict())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj


def update(
    db: Session,
    *,
    db_obj: Contact,
    obj_in: Union[ContactCreate, Dict[str, Any]]
) -> Contact:
    update_data = obj_in.dict(exclude_unset=True) if hasattr(obj_in, "dict") else obj_in
    for field, value in update_data.items():
        setattr(db_obj, field, value)
    db.commit()
    db.refresh(db_obj)
    return db_obj


def remove(db: Session, *, contact_id: int) -> bool:
    """
    True dönerse satır silindi demektir.
    """
    result = db.execute(
        delete(Contact).where(Contact.id == contact_id)
    )
    db.commit()
    return result.rowcount > 0


