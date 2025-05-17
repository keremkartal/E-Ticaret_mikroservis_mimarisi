# # app/crud/role.py (tam)
# from sqlalchemy.orm import Session
# from typing import Optional, List
# from app.models.role import Role
# from app.schemas.role import RoleCreate, RoleUpdate

# def get(db: Session, role_id: int) -> Optional[Role]:
#     return db.query(Role).get(role_id)

# def get_by_name(db: Session, name: str) -> Optional[Role]:
#     return db.query(Role).filter(Role.name == name).first()

# def create(db: Session, obj_in: RoleCreate) -> Role:
#     db_obj = Role(**obj_in.dict())
#     db.add(db_obj); db.commit(); db.refresh(db_obj)
#     return db_obj

# def update(db: Session, db_obj: Role, obj_in: RoleUpdate) -> Role:
#     for f, v in obj_in.dict(exclude_unset=True).items():
#         setattr(db_obj, f, v)
#     db.commit(); db.refresh(db_obj); return db_obj

# def remove(db: Session, role_id: int) -> Role:
#     obj = get(db, role_id); db.delete(obj); db.commit(); return obj

# def list_roles(db: Session) -> List[Role]:
#     return db.query(Role).all()

from sqlalchemy.orm import Session
from typing import Optional, List # Python 3.9 için List import edildi

from app.models.role import Role # SQLAlchemy Role modelini import et
from app.schemas.role import RoleCreate, RoleUpdate # Pydantic şemalarını import et

def get(db: Session, role_id: int) -> Optional[Role]:
    """
    Verilen ID'ye sahip rolü veritabanından alır.
    Bulunamazsa None döndürür.
    """
    return db.query(Role).filter(Role.id == role_id).first() # .get(role_id) de kullanılabilir eğer primary key ise

def get_by_name(db: Session, name: str) -> Optional[Role]:
    """
    Verilen isme sahip rolü veritabanından alır.
    Bulunamazsa None döndürür.
    """
    return db.query(Role).filter(Role.name == name).first()

def list_roles(db: Session, skip: int = 0, limit: int = 100) -> List[Role]: # skip ve limit eklendi
    """
    Veritabanındaki rolleri listeler. Sayfalama için skip ve limit parametreleri alır.
    """
    return db.query(Role).offset(skip).limit(limit).all()

def create(db: Session, obj_in: RoleCreate) -> Role:
    """
    Verilen Pydantic şemasına göre yeni bir rol oluşturur.
    """
    # Pydantic V2'de .dict() yerine .model_dump() kullanılır.
    db_obj_data = obj_in.model_dump()
    db_obj = Role(**db_obj_data)
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def update(db: Session, db_obj: Role, obj_in: RoleUpdate) -> Role:
    """
    Mevcut bir rol ORM nesnesini, verilen Pydantic şemasındaki verilerle günceller.
    Sadece obj_in içinde değeri olan (None olmayan) alanlar güncellenir.
    """
    # Pydantic V2'de .dict(exclude_unset=True) yerine .model_dump(exclude_unset=True) kullanılır.
    update_data = obj_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_obj, field, value)
    db.add(db_obj) # Session'a eklemek, değişikliklerin izlenmesini sağlar (genellikle gereklidir)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def remove(db: Session, role_id: int) -> Optional[Role]: # None dönebilir eğer bulunamazsa
    """
    Verilen ID'ye sahip rolü veritabanından siler.
    Silinen nesneyi veya bulunamazsa None döndürür.
    """
    obj = db.query(Role).filter(Role.id == role_id).first()
    if obj:
        db.delete(obj)
        db.commit()
        return obj
    return None
