from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm, HTTPAuthorizationCredentials  # ⚠️
from datetime import datetime, timedelta
from jose import jwt
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.crud import user as crud_user
from app.schemas.auth import Token
from app.core.config import settings
from app.deps import oauth2_scheme, get_current_active_user 
from uuid import uuid4
from jose import jwt

router = APIRouter(prefix="/auth", tags=["Authentication"])


def create_token(user):
    exp = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    jti = str(uuid4())  
    payload = {
        "sub": user.username,
        "user_id": user.id,
        "roles": [r.name for r in user.roles],
        "permissions": [p.name for r in user.roles for p in r.permissions],
        "jti": jti,        
        "exp": exp,
        "is_active":user.is_active,
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

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

from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.crud.revoked_token import add_revoked

bearer_scheme = HTTPBearer(auto_error=True)   

@router.post("/logout")
def logout(
    creds: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    current_user = Depends(get_current_active_user),
    db: Session  = Depends(get_db),
):
   
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
@router.get("/checkLogin")
def check_login(                    # ⚠️
    creds: HTTPAuthorizationCredentials = Depends(oauth2_scheme)
):
   
    return {
        "valid": True,
        "token_snippet": creds.credentials[:10] + "..."  
    }

@router.get("/whoami")
def whoami(user = Depends(get_current_active_user)):
    return {
        "id": user.id,
        "username": user.username,
        "roles": [r.name for r in user.roles]
    }