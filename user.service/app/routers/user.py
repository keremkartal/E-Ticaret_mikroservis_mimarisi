from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.user import UserCreate, UserUpdate, UserOut
from app.schemas.password import PasswordChange
from app.deps import get_current_active_user, require_roles
from app.crud import user as crud_user

router = APIRouter(prefix="/users", tags=["Users"])

# ─────────────────────────── Admin End‑point’leri ───────────────────────────

@router.get(
    "/", response_model=List[UserOut],
    dependencies=[Depends(require_roles("admin"))],
)
def list_users(db: Session = Depends(get_db)):
    return crud_user.list_users(db)

@router.post(
    "/", response_model=UserOut, status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_roles("admin"))],
)
def create_user(u: UserCreate, db: Session = Depends(get_db)):
    return crud_user.create_user(db, u)

@router.get(
    "/{uid}", response_model=UserOut,
    dependencies=[Depends(require_roles("admin"))],
)
def get_user(uid: int, db: Session = Depends(get_db)):
    user = crud_user.get_user(db, uid)
    if not user:
        raise HTTPException(404, "User not found")
    return user

@router.put(
    "/{uid}", response_model=UserOut,
    dependencies=[Depends(require_roles("admin"))],
)
def update_user_admin(uid: int, u: UserUpdate, db: Session = Depends(get_db)):
    user = crud_user.get_user(db, uid)
    if not user:
        raise HTTPException(404, "User not found")
    return crud_user.update_user(db, user, u)

@router.delete(
    "/{uid}", status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_roles("admin"))],
)
def deactivate_user_admin(uid: int, db: Session = Depends(get_db)):
    user = crud_user.get_user(db, uid)
    if not user:
        raise HTTPException(404, "User not found")
    crud_user.deactivate(db, uid)

@router.put(
    "/{uid}/roles", response_model=UserOut,
    dependencies=[Depends(require_roles("admin"))],
)
def set_user_roles(uid: int, role_ids: List[int], db: Session = Depends(get_db)):
    user = crud_user.get_user(db, uid)
    if not user:
        raise HTTPException(404, "User not found")
    crud_user.set_user_roles(db, user, role_ids)
    return user

@router.post(
    "/{uid}/reset-password",
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(require_roles("admin"))],
)
def reset_user_password(uid: int, db: Session = Depends(get_db)):
    user = crud_user.get_user(db, uid)
    if not user:
        raise HTTPException(404, "User not found")
    new_pwd = crud_user.reset_password(db, uid, "Temp1234!")   # örnek temp şifre
    return {"detail": "password reset", "new_password": new_pwd}

# ─────────────────────────── Self End‑point’leri ───────────────────────────

@router.get("/me", response_model=UserOut)
def me(current_user=Depends(get_current_active_user)):
    return current_user

@router.put("/me", response_model=UserOut)
def update_me(
    u: UserUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    return crud_user.update_user(db, current_user, u)

@router.put("/me/password", status_code=status.HTTP_204_NO_CONTENT)
def change_pwd(
    body: PasswordChange,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    if not crud_user.verify_password(body.old_password, current_user.hashed_password):
        raise HTTPException(400, "Old password incorrect")
    crud_user.update_password(db, current_user, body.new_password)

@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
def deactivate_self(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    crud_user.deactivate(db, current_user.id)
