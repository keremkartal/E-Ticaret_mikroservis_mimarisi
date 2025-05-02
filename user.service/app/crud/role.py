# app/crud/role.py (tam)
from sqlalchemy.orm import Session
from typing import Optional, List
from app.models.role import Role
from app.schemas.role import RoleCreate, RoleUpdate

def get(db: Session, role_id: int) -> Optional[Role]:
    return db.query(Role).get(role_id)

def get_by_name(db: Session, name: str) -> Optional[Role]:
    return db.query(Role).filter(Role.name == name).first()

def create(db: Session, obj_in: RoleCreate) -> Role:
    db_obj = Role(**obj_in.dict())
    db.add(db_obj); db.commit(); db.refresh(db_obj)
    return db_obj

def update(db: Session, db_obj: Role, obj_in: RoleUpdate) -> Role:
    for f, v in obj_in.dict(exclude_unset=True).items():
        setattr(db_obj, f, v)
    db.commit(); db.refresh(db_obj); return db_obj

def remove(db: Session, role_id: int) -> Role:
    obj = get(db, role_id); db.delete(obj); db.commit(); return obj

def list_roles(db: Session) -> List[Role]:
    return db.query(Role).all()
