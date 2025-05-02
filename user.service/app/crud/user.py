from typing import List, Optional
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# ───────── şifre yardımcıları ─────────
def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

def hash_password(pwd: str) -> str:
    return pwd_context.hash(pwd)

# ───────── temel CRUD ─────────
def get_user(db: Session, user_id: int) -> Optional[User]:
    return db.query(User).get(user_id)

def get_user_by_username(db: Session, username: str) -> Optional[User]:
    return db.query(User).filter(User.username == username).first()

def list_users(db: Session) -> List[User]:
    return db.query(User).all()

def create_user(db: Session, obj_in: UserCreate) -> User:
    db_obj = User(
        username=obj_in.username,
        email=obj_in.email,
        hashed_password=hash_password(obj_in.password),
    )
    db.add(db_obj); db.commit(); db.refresh(db_obj)
    return db_obj

def update_user(db: Session, db_obj: User, obj_in: UserUpdate) -> User:
    data = obj_in.dict(exclude_unset=True)
    for f, v in data.items():
        setattr(db_obj, f, v)
    db.commit(); db.refresh(db_obj); return db_obj

def deactivate(db: Session, user_id: int) -> None:
    user = get_user(db, user_id)
    if user:
        user.is_active = False
        db.commit()

# ───────── auth yardımcıları ─────────
def authenticate_user(db: Session, username: str, password: str):
    user = get_user_by_username(db, username)
    if not user or not verify_password(password, user.hashed_password):
        return False
    return user

def update_password(db: Session, user: User, new_pwd: str):
    user.hashed_password = hash_password(new_pwd)
    db.commit(); db.refresh(user)

def reset_password(db: Session, user_id: int, new_pwd: str):
    user = get_user(db, user_id)
    if user:
        update_password(db, user, new_pwd)

def set_user_roles(db: Session, user: User, role_ids: List[int]):
    from app.crud import role as crud_role
    roles = [crud_role.get(db, rid) for rid in role_ids]
    if any(r is None for r in roles):
        raise ValueError("One or more role IDs invalid")
    user.roles = roles
    db.commit(); db.refresh(user)
