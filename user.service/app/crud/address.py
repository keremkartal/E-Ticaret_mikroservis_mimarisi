# app/crud/address.py
from typing import List, Optional, Union, Dict, Any
from sqlalchemy.orm import Session
from app.models.address import Address
from app.schemas.address import AddressCreate, Address as AddressSchema

# ─────────────────────────────────────────
# CRUD Fonksiyonları
# ─────────────────────────────────────────
def get(db: Session, address_id: int) -> Optional[Address]:
    return db.query(Address).filter(Address.id == address_id).first()

def list_by_user(db: Session, user_id: int) -> List[Address]:
    return db.query(Address).filter(Address.user_id == user_id).all()

def create(db: Session, *, user_id: int, obj_in: AddressCreate) -> Address:
    db_obj = Address(user_id=user_id, **obj_in.dict())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def update(
    db: Session,
    *,
    db_obj: Address,
    obj_in: Union[AddressCreate, Dict[str, Any]]
) -> Address:
    update_data = obj_in.dict(exclude_unset=True) if hasattr(obj_in, "dict") else obj_in
    for field, value in update_data.items():
        setattr(db_obj, field, value)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def remove(db: Session, *, address_id: int) -> Address:
    obj = db.query(Address).get(address_id)
    db.delete
