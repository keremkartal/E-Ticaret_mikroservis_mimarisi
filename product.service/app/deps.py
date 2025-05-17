# from fastapi import Depends, HTTPException, status
# from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
# from jose import JWTError, jwt
# from app.core.config import settings
# from typing import List, Optional, Dict

# # Bearer şeması ile Authorization header'dan token alıyoruz
# bearer_scheme = HTTPBearer(auto_error=True)

# class TokenData:
#     username: Optional[str] = None
#     user_id: Optional[int] = None
#     roles: List[str] = []
#     permissions: List[str] = []
#     token: str | None = None        # ← eklendi


# def decode_token(token: str) -> Dict[str, any]:
#     """
#     JWT token'ı decode eder ve payload döner.
#     Eğer geçersizse HTTPException fırlatır.
#     """
#     credentials_exception = HTTPException(
#         status_code=status.HTTP_401_UNAUTHORIZED,
#         detail="Could not validate credentials",
#         headers={"WWW-Authenticate": "Bearer"},
#     )
#     try:
#         payload = jwt.decode(
#             token,
#             settings.SECRET_KEY,
#             algorithms=[settings.ALGORITHM]
#         )
#         return payload
#     except JWTError:
#         raise credentials_exception


# def get_current_user(
#     creds: HTTPAuthorizationCredentials = Depends(bearer_scheme)
# ) -> TokenData:
#     """
#     Header'dan gelen Bearer token'ı parse eder,
#     içine yerleştirilen kullanıcı bilgilerini TokenData olarak döner.
#     """
#     token = creds.credentials
#     payload = decode_token(token)

#     username: Optional[str] = payload.get("sub")
#     user_id: Optional[int] = payload.get("user_id")
#     if username is None or user_id is None:
#         raise HTTPException(
#             status_code=status.HTTP_401_UNAUTHORIZED,
#             detail="Invalid token payload",
#             headers={"WWW-Authenticate": "Bearer"},
#         )

#     # Payload'tan roller ve izinler
#     roles = payload.get("roles", [])
#     permissions = payload.get("permissions", [])

#     token_data = TokenData()
#     token_data.username = username
#     token_data.user_id = user_id
#     token_data.roles = roles
#     token_data.permissions = permissions
#     token_data.token = token        # ← ham JWT sakla

#     return token_data


# def get_current_active_user(
#     current_user: TokenData = Depends(get_current_user)
# ) -> TokenData:
#     """
#     Aktif kullanıcı kontrolü (is_active kontrolü burada yapılabilir).
#     Şu an direkt passthrough.
#     """
#     return current_user


# def require_roles(*required_roles: str):
#     """
#     Sadece belirtilen rollere sahip kullanıcılar erişebilir.
#     """
#     def role_checker(current_user: TokenData = Depends(get_current_active_user)):
#         if not set(current_user.roles).intersection(required_roles):
#             raise HTTPException(
#                 status_code=status.HTTP_403_FORBIDDEN,
#                 detail="Insufficient role"
#             )
#         return current_user
#     return role_checker


# def require_permissions(*required_perms: str):
#     """
#     Sadece belirtilen izinlere sahip kullanıcılar erişebilir.
#     """
#     def perm_checker(current_user: TokenData = Depends(get_current_active_user)):
#         if not set(current_user.permissions).intersection(required_perms):
#             raise HTTPException(
#                 status_code=status.HTTP_403_FORBIDDEN,
#                 detail="Insufficient permissions"
#             )
#         return current_user
#     return perm_checker
# product.service/app/deps.py

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from app.core.config import settings # settings'in doğru import edildiğini varsayıyoruz
from typing import List, Optional, Dict, Any # Any ve Optional import edildi

# Bearer şeması ile Authorization header'dan token alıyoruz
# auto_error=True, token yoksa veya geçersizse otomatik 401/403 hatası verir.
bearer_scheme = HTTPBearer(auto_error=True)

class TokenData:
    username: Optional[str] = None
    user_id: Optional[int] = None
    roles: List[str] = [] # Python 3.9 için List[str] doğru
    permissions: List[str] = [] # Python 3.9 için List[str] doğru
    # DEĞİŞİKLİK: str | None yerine Optional[str] kullanıldı
    token: Optional[str] = None


def decode_token(token: str) -> Dict[str, Any]: # Dönüş tipindeki 'any' yerine 'Any' kullanıldı
    """
    JWT token'ı decode eder ve payload döner.
    Eğer geçersizse HTTPException fırlatır.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials", # Kimlik bilgileri doğrulanamadı
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY, # settings.SECRET_KEY'in .env'den doğru yüklendiğinden emin olun
            algorithms=[settings.ALGORITHM] # settings.ALGORITHM'ın .env'den doğru yüklendiğinden emin olun
        )
        return payload
    except JWTError: # Bu, token süresi dolması, geçersiz imza vb. durumları kapsar.
        raise credentials_exception


def get_current_user(
    creds: HTTPAuthorizationCredentials = Depends(bearer_scheme)
) -> TokenData:
   
    token = creds.credentials
    payload = decode_token(token)

    username: Optional[str] = payload.get("sub") # Genellikle kullanıcı adı 'sub' (subject) claim'inde olur
    user_id: Optional[int] = payload.get("user_id") # user_id'nin token payload'ında olduğunu varsayıyoruz

    if username is None or user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload: missing username or user_id", # Daha açıklayıcı hata mesajı
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Payload'tan roller ve izinler (varsayılan olarak boş liste)
    roles: List[str] = payload.get("roles", [])
    permissions: List[str] = payload.get("permissions", [])

    # TokenData nesnesini oluştur ve doldur
    token_data = TokenData()
    token_data.username = username
    token_data.user_id = user_id
    token_data.roles = roles
    token_data.permissions = permissions
    token_data.token = token # Ham JWT'yi sakla

    return token_data


def get_current_active_user(
    current_user: TokenData = Depends(get_current_user)
) -> TokenData:
    
    return current_user


def require_roles(*required_roles: str):
    required_role_set = set(required_roles)

    def role_checker(current_user: TokenData = Depends(get_current_active_user)):
        if not required_role_set.intersection(current_user.roles): # Kullanıcının rollerinden herhangi biri eşleşiyor mu?
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Insufficient role. Required one of: {', '.join(required_role_set)}"
            )
        return current_user
    return role_checker


def require_permissions(*required_perms: str):
    
    required_perm_set = set(required_perms)
    
    def perm_checker(current_user: TokenData = Depends(get_current_active_user)):
        if not required_perm_set.intersection(current_user.permissions): # Kullanıcının izinlerinden herhangi biri eşleşiyor mu?
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Insufficient permissions. Required one of: {', '.join(required_perm_set)}"
            )
        return current_user
    return perm_checker
