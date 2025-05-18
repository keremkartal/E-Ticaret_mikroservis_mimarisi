from typing import List, Optional
from sqlalchemy.orm import Session, selectinload
from passlib.context import CryptContext

from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate
from app.schemas.role import RoleCreate
from fastapi import HTTPException, status
from app.crud import role as crud_role

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

def hash_password(pwd: str) -> str:
    return pwd_context.hash(pwd)

def get_user(db: Session, user_id: int) -> Optional[User]:
    return db.query(User).get(user_id)

def get_user_by_username(db: Session, username: str) -> Optional[User]:
    return db.query(User).filter(User.username == username).first()

def list_users(db: Session) -> List[User]:
    return (
        db.query(User)
          .options(
            selectinload(User.roles),
            selectinload(User.addresses),
            selectinload(User.contacts),
          )
          .all()
    )

def create_user(db: Session, obj_in: UserCreate) -> User:
    if get_user_by_username(db, obj_in.username):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Bu kullanıcı adı zaten mevcut.",)
    
    default_role = crud_role.get_by_name(db, "user")
    if not default_role:
        default_role = crud_role.create(db, obj_in=RoleCreate(name="user", description="Varsayılan kullanıcı rolü"))

    db_obj = User(
        username=obj_in.username,
        email=obj_in.email,
        hashed_password=hash_password(obj_in.password),
        roles=[default_role],
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def update_user(db: Session, db_obj: User, obj_in: UserUpdate) -> User:
    update_data = obj_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_obj, field, value)
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def deactivate(db: Session, user_id: int) -> Optional[User]:
    user = get_user(db, user_id)
    if user:
        user.is_active = False
        db.add(user)
        db.commit()
        db.refresh(user)
    return user

def activate(db: Session, user_id: int) -> Optional[User]:
    user = get_user(db, user_id)
    if user:
        user.is_active = True
        db.add(user)
        db.commit()
        db.refresh(user)
    return user

def authenticate_user(db: Session, username: str, password: str) -> Optional[User]:
    user = get_user_by_username(db, username)
    if not user or not verify_password(password, user.hashed_password):
        return None
    return user

def _update_password_basic(db: Session, user: User, new_pwd: str) -> None:
    user.hashed_password = hash_password(new_pwd)
    db.add(user)
    db.commit()
    db.refresh(user)

def reset_password(db: Session, user_id: int, new_pwd: str) -> None:
    user = get_user(db, user_id)
    if user:
        user.hashed_password = hash_password(new_pwd)
        user.must_change = 0
        db.add(user)
        db.commit()
        db.refresh(user)

def set_user_roles(db: Session, user: User, role_ids: List[int]) -> User:
    roles_to_assign = []
    for r_id in role_ids:
        role_obj = crud_role.get(db, role_id=r_id)
        if not role_obj:
            raise ValueError(f"Rol ID {r_id} geçersiz.")
        roles_to_assign.append(role_obj)
        
    user.roles = roles_to_assign
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def get_by_username_and_email(db: Session, username: str, email: str) -> Optional[User]:
    return (
        db.query(User)
          .filter(User.username == username, User.email == email)
          .first()
    )

def request_password_reset(db: Session, user: User) -> None:
    user.must_change = 1
    db.add(user)
    db.commit()
    db.refresh(user)

def list_password_requests(db: Session) -> List[User]:
    return db.query(User).filter(User.must_change == 1).all()
def admin_set_temporary_password(db: Session, user_id: int) -> Optional[str]:
    user = get_user(db, user_id)
    if not user:
        return None
    temp_password = f"{user.username}_{user.email}"
    user.hashed_password = hash_password(temp_password)
    user.must_change = 2
    db.add(user)
    db.commit()
    db.refresh(user)
    return temp_password

def update_password(db: Session, user: User, new_pwd: str) -> User:
    user.hashed_password = hash_password(new_pwd)
    user.must_change = 0
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def admin_reset_password_to_email(db: Session, user: User) -> str:
    if not user.email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Kullanıcının şifre sıfırlama için kayıtlı bir e-posta adresi bulunmuyor."
        )

    temporary_password = user.email
    user.hashed_password = hash_password(temporary_password)
    user.must_change = 0
    db.add(user)
    db.commit()
    db.refresh(user)
    return temporary_password