from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from datetime import datetime, timedelta
from jose import jwt
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.crud.user import authenticate_user
from app.schemas.auth import Token
from app.core.config import settings
from app.deps import oauth2_scheme

router = APIRouter(prefix="/auth", tags=["Auth"])

def create_token(sub: str):
    exp = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return jwt.encode({"sub": sub, "exp": exp}, settings.SECRET_KEY,
                      algorithm=settings.ALGORITHM)

@router.post("/token", response_model=Token)
def login(form: OAuth2PasswordRequestForm = Depends(),
          db: Session = Depends(get_db)):
    user = authenticate_user(db, form.username, form.password)
    if not user:
        raise HTTPException(status_code=401, detail="Bad credentials")
    return {"access_token": create_token(user.username), "token_type":"bearer"}

@router.post("/logout")
def logout():  # istemci taraflı token silinir
    return {"detail": "Client must delete token"}

@router.get("/checkLogin")
def check_login(token: str = Depends(oauth2_scheme)):
    return {"valid": True}
