# app/crud/permission.py
from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.permission import Permission
from app.schemas.permission import PermissionCreate, PermissionUpdate

def get(db: Session, permission_id: int) -> Optional[Permission]:
    return db.query(Permission).get(permission_id)

def get_by_name(db: Session, name: str) -> Optional[Permission]:
    return db.query(Permission).filter(Permission.name == name).first()

def list_permissions(db: Session) -> List[Permission]:
    return db.query(Permission).all()

def create(db: Session, obj_in: PermissionCreate) -> Permission:
    db_obj = Permission(**obj_in.dict())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def update(db: Session, db_obj: Permission, obj_in: PermissionUpdate) -> Permission:
    for f, v in obj_in.dict(exclude_unset=True).items():
        setattr(db_obj, f, v)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def remove(db: Session, permission_id: int) -> Permission:
    obj = get(db, permission_id)
    db.delete(obj)
    db.commit()
    return obj