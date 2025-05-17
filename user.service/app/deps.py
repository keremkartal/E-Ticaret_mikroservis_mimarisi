# from fastapi import Depends, HTTPException, status
# from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
# from jose import JWTError, jwt
# from sqlalchemy.orm import Session

# from app.core.config import settings
# from app.db.session import get_db
# from app.crud.user import get_user_by_username
# from app.crud.revoked_token import is_revoked

# # ─────────────────────────────────────────────
# # 1)  Şema tanımı  → HTTPBearer
# #    (ismi aynı kalsın ki diğer modüller etkilenmesin)
# # ─────────────────────────────────────────────
# oauth2_scheme = HTTPBearer(auto_error=False)   # Bearer <token>

# # ─────────────────────────────────────────────
# # 2)  Ortak yardımcı
# # ─────────────────────────────────────────────
# from app.crud.revoked_token import is_revoked
# # ...

# def _get_user(token: str, db: Session):
#     creds_exc = HTTPException(
#         status_code=status.HTTP_401_UNAUTHORIZED,
#         detail="Invalid token",
#         headers={"WWW-Authenticate": "Bearer"},
#     )
#     try:
#         payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
#         if is_revoked(db, payload.get("jti")):         # ← yeni kontrol
#             raise creds_exc
#         username: str = payload.get("sub")
#         if not username:
#             raise creds_exc
#     except JWTError:
#         raise creds_exc

#     user = get_user_by_username(db, username)
#     if not user:
#         raise creds_exc
#     return user

# # ─────────────────────────────────────────────
# # 3)  Dependency zinciri
# # ─────────────────────────────────────────────
# def get_current_user(
#     creds: HTTPAuthorizationCredentials = Depends(oauth2_scheme),
#     db: Session = Depends(get_db),
# ):
#     if creds is None:
#         raise HTTPException(
#             status_code=status.HTTP_401_UNAUTHORIZED,
#             detail="Not authenticated",
#             headers={"WWW-Authenticate": "Bearer"},
#         )
#     return _get_user(creds.credentials, db)


# def get_current_active_user(current_user=Depends(get_current_user)):
#     if not current_user.is_active:
#         raise HTTPException(status_code=400, detail="Inactive user")
#     return current_user


# # ─────────────────────────────────────────────
# # 4)  Rol / izin yardımcıları (değişmedi)
# # ─────────────────────────────────────────────
# def require_roles(*roles: str):
#     def checker(current_user=Depends(get_current_active_user)):
#         if not {r.name for r in current_user.roles}.intersection(roles):
#             raise HTTPException(403, "Insufficient role")
#         return current_user

#     return checker


# def has_permission(perm: str):
#     def checker(current_user=Depends(get_current_active_user)):
#         perms = {p.name for r in current_user.roles for p in r.permissions}
#         if perm not in perms:
#             raise HTTPException(403, "Insufficient permission")
#         return current_user

#     return checker
# user.service/app/deps.py

from typing import Optional, Set, List # Python 3.9 uyumluluğu için importlar

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.session import get_db
from app.crud.user import get_user_by_username
# User modelinin app.models.user içinde tanımlandığını varsayıyoruz.
# Eğer User modeli doğrudan get_user_by_username tarafından döndürülüyorsa
# ve rol/izin yapılarını içeriyorsa, tip belirleme için import etmek iyidir.
from app.models.user import User  # User modelinin yolunu projenize göre ayarlayın
from app.models.role import Role # Role modelinin de import edildiğini varsayalım (require_roles için)
from app.models.permission import Permission # Permission modelinin de import edildiğini varsayalım (require_permission için)
from app.crud.revoked_token import is_revoked

# ─────────────────────────────────────────────
# 1)  Şema tanımı  → HTTPBearer
# ─────────────────────────────────────────────
# auto_error=False ile HTTPBearer, token sağlanmazsa creds'in None olabileceği anlamına gelir.
oauth2_scheme = HTTPBearer(auto_error=False)

# ─────────────────────────────────────────────
# 2)  Ortak yardımcı
# ─────────────────────────────────────────────

def _get_user(token: str, db: Session) -> User:
    """
    JWT token'ını çözer, iptal edilip edilmediğini kontrol eder ve kullanıcıyı alır.
    Geçersiz token'lar, iptal edilmiş token'lar veya var olmayan kullanıcılar için HTTPException fırlatır.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Geçersiz kimlik doğrulama bilgileri", # Daha genel bir mesaj
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        
        jti_from_payload: Optional[str] = payload.get("jti")
        # is_revoked fonksiyonu, jti_from_payload'un None olma ihtimalini de ele almalıdır.
        # Güvenlik için, jti varsa ve iptal edilmişse hata fırlatılır.
        if jti_from_payload and is_revoked(db, jti_from_payload):
            raise credentials_exception # Token iptal edilmiş

        username_from_payload: Optional[str] = payload.get("sub")
        if username_from_payload is None: 
            raise credentials_exception # 'sub' (konu/kullanıcı adı) talebi eksik
            
    except JWTError: # Süresi dolmuş token'lar, geçersiz imza vb. durumları kapsar.
        raise credentials_exception

    # get_user_by_username fonksiyonunun Optional[User] döndürdüğünü varsayarak tip belirleme
    user: Optional[User] = get_user_by_username(db, username=username_from_payload) 
    if user is None:
        raise credentials_exception # Kullanıcı bulunamadı
    return user

# ─────────────────────────────────────────────
# 3)  Dependency zinciri
# ─────────────────────────────────────────────
def get_current_user(
    creds: Optional[HTTPAuthorizationCredentials] = Depends(oauth2_scheme), # creds None olabilir
    db: Session = Depends(get_db),
) -> User: # Dönüş tipi eklendi
    """
    Token'dan mevcut kullanıcıyı almak için ana dependency.
    Token sağlanmadığı durumları ele alır.
    """
    if creds is None:
        # Bu durum, 'Authorization' başlığı yoksa veya Bearer token değilse oluşur.
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Kimlik doğrulanmadı",
            headers={"WWW-Authenticate": "Bearer"},
        )
    # creds.credentials token string'idir
    user = _get_user(token=creds.credentials, db=db)
    return user


def get_current_active_user(current_user: User = Depends(get_current_user)) -> User: # current_user ve dönüş tipi eklendi
    """
    Mevcut aktif kullanıcıyı almak için dependency.
    get_current_user'dan alınan kullanıcının aktif olmasını sağlar.
    """
    if not current_user.is_active:
        # Aktif olmayan bir hesapla işlem yapmaya çalışmak genellikle 400 Bad Request'tir.
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Aktif olmayan kullanıcı")
    return current_user


# ─────────────────────────────────────────────
# 4)  Rol / izin yardımcıları
# ─────────────────────────────────────────────
# Bu yardımcı fonksiyonlar standart görünüyor.
# get_current_active_user'a bağlı oldukları için tip güvenliği yayılır.

def require_roles(*roles: str):
    """
    Mevcut aktif kullanıcının belirtilen rollerden en az birine sahip olup olmadığını kontrol eden dependency.
    """
    required_role_set: Set[str] = set(roles) # Verimlilik için bir kez set'e çevir

    def checker(current_user: User = Depends(get_current_active_user)) -> User:
        # current_user.roles'un, her biri 'name' özelliğine sahip Role nesnelerinden oluşan
        # bir liste/set olduğunu varsayıyoruz.
        # SQLAlchemy modelinizde User.roles ilişkisi ve Role.name alanı olmalıdır.
        user_role_names: Set[str] = {role.name for role in current_user.roles}
        
        if not user_role_names.intersection(required_role_set):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, 
                detail=f"Kullanıcının gerekli rolleri yok. Gerekli: {', '.join(required_role_set)}" # Daha açıklayıcı mesaj
            )
        return current_user
    return checker


def require_permission(permission_name: str): # Tutarlılık için require_roles gibi yeniden adlandırıldı (önceki has_permission)
    """
    Mevcut aktif kullanıcının belirli bir izne sahip olup olmadığını kontrol eden dependency.
    İzinlerin rollere bağlı olduğu varsayılır.
    """
    def checker(current_user: User = Depends(get_current_active_user)) -> User:
        # current_user.roles'un Role nesnelerinden oluşan bir liste/set olduğunu,
        # her Role nesnesinin 'permissions' adında Permission nesnelerinden oluşan bir liste/set içerdiğini,
        # ve her Permission nesnesinin 'name' özelliğine sahip olduğunu varsayıyoruz.
        # SQLAlchemy modellerinizde User.roles, Role.permissions ve Permission.name alanları olmalıdır.
        user_permissions: Set[str] = {
            perm.name for role in current_user.roles for perm in role.permissions
        }
        
        if permission_name not in user_permissions:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, 
                detail=f"Kullanıcı gerekli '{permission_name}' iznine sahip değil" # Daha açıklayıcı mesaj
            )
        return current_user
    return checker
