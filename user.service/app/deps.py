from typing import Optional, Set, List

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.session import get_db
from app.crud.user import get_user_by_username
from app.models.user import User
from app.models.role import Role
from app.models.permission import Permission
from app.crud.revoked_token import is_revoked

oauth2_scheme = HTTPBearer(auto_error=False)

def _get_user(token: str, db: Session) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Geçersiz kimlik doğrulama bilgileri",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        jti_from_payload: Optional[str] = payload.get("jti")
        if jti_from_payload and is_revoked(db, jti_from_payload):
            raise credentials_exception
        username_from_payload: Optional[str] = payload.get("sub")
        if username_from_payload is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user: Optional[User] = get_user_by_username(db, username=username_from_payload)
    if user is None:
        raise credentials_exception
    return user

def get_current_user(
    creds: Optional[HTTPAuthorizationCredentials] = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    if creds is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Kimlik doğrulanmadı",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return _get_user(token=creds.credentials, db=db)

def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    if not current_user.is_active:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Aktif olmayan kullanıcı")
    return current_user

def require_roles(*roles: str):
    required_role_set: Set[str] = set(roles)

    def checker(current_user: User = Depends(get_current_active_user)) -> User:
        user_role_names: Set[str] = {role.name for role in current_user.roles}
        if not user_role_names.intersection(required_role_set):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Kullanıcının gerekli rolleri yok. Gerekli: {', '.join(required_role_set)}"
            )
        return current_user
    return checker

def require_permission(permission_name: str):
    def checker(current_user: User = Depends(get_current_active_user)) -> User:
        user_permissions: Set[str] = {
            perm.name for role in current_user.roles for perm in role.permissions
        }
        if permission_name not in user_permissions:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Kullanıcı gerekli '{permission_name}' iznine sahip değil"
            )
        return current_user
    return checker
