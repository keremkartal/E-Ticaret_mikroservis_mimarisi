from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.user import UserCreate, UserUpdate, UserOut
from app.schemas.password import PasswordChange
from app.deps import get_current_active_user, require_roles
from app.crud import user as crud_user
from app.schemas.user import ForgotPasswordRequest,ForgotPasswordResponse,UserOut
router = APIRouter(prefix="/users", tags=["Users"])

# ---------------------------------------------------------------------------
# Helper to convert ORM <User> into UserOut with roles as List[str]
# ---------------------------------------------------------------------------

def _to_user_out(u) -> UserOut:
    """Map ORM user to UserOut, flattening roles to list[str]."""
    data = {
        **u.__dict__,
        "roles": [r.name for r in u.roles],
    }
    # Pydantic v2 -> model_validate supports from_attributes flag
    return UserOut.model_validate(data, from_attributes=True)

# ---------------------------------------------------------------------------
# Admin End‑point’leri
# ---------------------------------------------------------------------------

@router.get("/", response_model=List[UserOut],
            dependencies=[Depends(require_roles("admin"))])
def list_users(db: Session = Depends(get_db)):
    users = crud_user.list_users(db)
    return [_to_user_out(u) for u in users]


@router.post("/", response_model=UserOut, status_code=status.HTTP_201_CREATED,
             dependencies=[Depends(require_roles("admin"))])
def create_user(u: UserCreate, db: Session = Depends(get_db)):
    created = crud_user.create_user(db, u)
    return _to_user_out(created)


@router.get("/{uid:int}", response_model=UserOut,
            dependencies=[Depends(require_roles("admin"))])
def get_user(uid: int, db: Session = Depends(get_db)):
    u = crud_user.get_user(db, uid)
    if not u:
        raise HTTPException(status_code=404, detail="User not found")
    return _to_user_out(u)


@router.put("/{uid:int}", response_model=UserOut,
           dependencies=[Depends(require_roles("admin"))])
def update_user_admin(uid: int, u: UserUpdate, db: Session = Depends(get_db)):
    user_obj = crud_user.get_user(db, uid)
    if not user_obj:
        raise HTTPException(status_code=404, detail="User not found")
    updated = crud_user.update_user(db, user_obj, u)
    return _to_user_out(updated)


@router.delete("/{uid:int}", status_code=status.HTTP_204_NO_CONTENT,
              dependencies=[Depends(require_roles("admin"))])
def deactivate_user_admin(uid: int, db: Session = Depends(get_db)):
    user_obj = crud_user.get_user(db, uid)
    if not user_obj:
        raise HTTPException(status_code=404, detail="User not found")
    crud_user.deactivate(db, uid)

@router.put(
    "/{uid:int}/activate",
    response_model=UserOut,
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(require_roles("admin"))],
)
def activate_user_admin(uid: int, db: Session = Depends(get_db)):
    """
    ID ile verilen kullanıcıyı yeniden aktif eder (soft undelete).
    Sadece admin erişebilir.
    """
    user_obj = crud_user.get_user(db, uid)
    if not user_obj:
        raise HTTPException(status_code=404, detail="User not found")

    crud_user.activate(db, uid)
    # user_obj.is_active artık True oldu, geri dön
    return _to_user_out(user_obj)

@router.put("/{uid:int}/roles", response_model=UserOut,
           dependencies=[Depends(require_roles("admin"))])
def set_user_roles(uid: int, role_ids: List[int], db: Session = Depends(get_db)):
    user_obj = crud_user.get_user(db, uid)
    if not user_obj:
        raise HTTPException(status_code=404, detail="User not found")
    crud_user.set_user_roles(db, user_obj, role_ids)
    return _to_user_out(user_obj)


@router.post("/{uid:int}/reset-password", status_code=status.HTTP_200_OK,
             dependencies=[Depends(require_roles("admin"))])
def reset_user_password(uid: int, db: Session = Depends(get_db)):
    user_obj = crud_user.get_user(db, uid)
    if not user_obj:
        raise HTTPException(status_code=404, detail="User not found")
    new_pwd = crud_user.reset_password(db, uid, "Temp1234!")
    return {"detail": "password reset", "new_password": new_pwd}

# ---------------------------------------------------------------------------
# Self End‑point’leri
# ---------------------------------------------------------------------------

@router.get("/me", response_model=UserOut)
def me(current_user=Depends(get_current_active_user)):
    return _to_user_out(current_user)


@router.put("/me", response_model=UserOut)
def update_me(u: UserUpdate, db: Session = Depends(get_db),
              current_user=Depends(get_current_active_user)):
    updated = crud_user.update_user(db, current_user, u)
    return _to_user_out(updated)


@router.put("/me/password", status_code=status.HTTP_204_NO_CONTENT)
def change_pwd(body: PasswordChange, db: Session = Depends(get_db),
               current_user=Depends(get_current_active_user)):
    if not crud_user.verify_password(body.old_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Old password incorrect")
    crud_user.update_password(db, current_user, body.new_password)


@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
def deactivate_self(db: Session = Depends(get_db),
                   current_user=Depends(get_current_active_user)):
    crud_user.deactivate(db, current_user.id)


#########################

# ─────────────────────── Kullanıcı “Şifremi Unuttum” ──────────────────────
@router.post(
    "/forgot-password",
    response_model=ForgotPasswordResponse,
    status_code=status.HTTP_200_OK,
)
def forgot_password(
    req: ForgotPasswordRequest,
    db: Session = Depends(get_db),
):
    user = crud_user.get_by_username_and_email(
        db, req.username, req.email
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Kullanıcı bulunamadı"
        )
    # Zaten admin atamış geçici şifreyi ver
    if user.must_change == 2:
        temp = f"{user.username}{user.email}"
        return {
            "detail": "Geçici şifreniz hazır",
            "temporary_password": temp
        }
    # Daha önce talep edilmişse sadece onayla
    if user.must_change == 1:
        return {
            "detail": "Talebiniz alınmış, admin onay bekliyor"
        }
    # 0 ise ilk talep, must_change=1 yap
    crud_user.request_password_reset(db, user)
    return {
        "detail": "Talebiniz alındı; admin onayladıktan sonra bilgilendirileceksiniz"
    }

# ─────────────────────── Admin “Şifre Unutanlar” ──────────────────────
from app.crud.user import list_password_requests as crud_list_pr

@router.get(
    "/password-requests",
    response_model=list[UserOut],
    dependencies=[Depends(require_roles("admin"))],
)
def list_password_requests(db: Session = Depends(get_db)):
    users = crud_list_pr(db)
    return [
        UserOut.model_validate(
            {**u.__dict__, "roles": [r.name for r in u.roles]},
            from_attributes=True
        )
        for u in users
    ]
@router.post(
    "/{uid}/reset-password",
    response_model=ForgotPasswordResponse,
    dependencies=[Depends(require_roles("admin"))],
)
def admin_reset_password(uid: int, db: Session = Depends(get_db)):
    user = crud_user.get_user(db, uid)
    if not user:
        raise HTTPException(404, "User not found")
    temp = crud_user.admin_set_temporary_password(db, uid)
    return {
        "detail": "Geçici parola atandı",
        "temporary_password": temp
    }

# ─────────────────────── Mevcut “Şifre Değiştir” (PUT /me/password) ──────────────────────
@router.put(
    "/me/password",
    status_code=status.HTTP_204_NO_CONTENT,
)
def change_pwd(
    body: PasswordChange,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    # must_change=2 ise eski şifre kontrolünü atla
    if current_user.must_change != 2:
        if not body.old_password:
            raise HTTPException(400, "Eski şifre gereklidir")
        if not crud_user.verify_password(body.old_password, current_user.hashed_password):
            raise HTTPException(400, "Eski şifre hatalı")
    
    crud_user.update_password(db, current_user, body.new_password)