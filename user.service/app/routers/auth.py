from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm, HTTPAuthorizationCredentials  # ⚠️
from datetime import datetime, timedelta
from jose import jwt
from sqlalchemy.orm import Session

from app.db.session import get_db
# from app.crud.user import authenticate_user
from app.crud import user as crud_user
from app.schemas.auth import Token
from app.core.config import settings
from app.deps import oauth2_scheme, get_current_active_user  # get_current_active_user isteğe bağlı
from uuid import uuid4
from jose import jwt

router = APIRouter(prefix="/auth", tags=["Authentication"])


# ────────────────────────────────────────────────────────
# Token oluşturma: kullanıcı ID, roller ve izinleri payload'a ekleyelim
# ────────────────────────────────────────────────────────
def create_token(user):
    exp = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    jti = str(uuid4())   # benzersiz token ID
    payload = {
        "sub": user.username,
        "user_id": user.id,
        "roles": [r.name for r in user.roles],
        "permissions": [p.name for r in user.roles for p in r.permissions],
        "jti": jti,        # ← bunu ekledik
        "exp": exp,
        "is_active":user.is_active,
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

# --------------------------- login ---------------------------
@router.post("/token", response_model=Token)
def login(
    form: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    user = crud_user.authenticate_user(db, form.username, form.password)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Bad credentials")
    access_token = create_token(user)
    return {"access_token": access_token, "token_type": "bearer"}

# --------------------------- logout (sadece bilgilendirme) ---
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.crud.revoked_token import add_revoked

bearer_scheme = HTTPBearer(auto_error=True)   # aynı şema

@router.post("/logout")
def logout(
    creds: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    current_user = Depends(get_current_active_user),
    db: Session  = Depends(get_db),
):
    """
    1) Header’daki token’daki `jti`’yi al  
    2) `revoked_tokens` tablosuna kaydet  
    3) İstemci token’ı silmeli – aksi hâlde 401 alır.
    """
    try:
        jti = jwt.decode(
            creds.credentials,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        ).get("jti")
    except JWTError:
        raise HTTPException(400, "Bad token")

    if jti:
        add_revoked(db, jti)

    return {"detail": "Logged out. Token revoked."}

# --------------------------- token doğrulama -----------------
@router.get("/checkLogin")
def check_login(                    # ⚠️
    creds: HTTPAuthorizationCredentials = Depends(oauth2_scheme)
):
    """
    Header'da geçerli Bearer token varsa **200 OK** döner,
    yoksa FastAPI otomatik **401** gönderir.
    """
    # creds = None olursa HTTPBearer otomatik 401 döndürür
    return {
        "valid": True,
        "token_snippet": creds.credentials[:10] + "..."  # opsiyonel
    }

# --------------------------- kimim ben? (alternatif) ---------
@router.get("/whoami")
def whoami(user = Depends(get_current_active_user)):
    return {
        "id": user.id,
        "username": user.username,
        "roles": [r.name for r in user.roles]
    }