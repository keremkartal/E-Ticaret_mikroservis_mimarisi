# # app/schemas/auth.py
# from typing import Optional
# from pydantic import BaseModel, EmailStr

# # -----------------------
# # Token şemaları
# # -----------------------
# class Token(BaseModel):
#     access_token: str
#     token_type: str = "bearer"

# class TokenData(BaseModel):
#     username: Optional[str] = None

# # -----------------------

# # Kullanıcı DTO’ları

# # -----------------------
# class UserBase(BaseModel):
#     username: str
#     email: EmailStr

# class UserCreate(UserBase):
#     password: str

# class UserOut(UserBase):
#     id: int
#     roles: list[str] = []

#     class Config:
#         orm_mode = True

# user.service/app/schemas/auth.py
from typing import Optional, List # List import edildi
from pydantic import BaseModel, EmailStr

# -----------------------
# Token şemaları
# -----------------------
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class TokenData(BaseModel):
    username: Optional[str] = None
    # Python 3.9'da 'str | None' yerine 'Optional[str]' zaten doğru kullanılmış.

# -----------------------
# Kullanıcı DTO’ları
# (Bu dosyadaki UserOut şeması, ayrıca sağladığınız user.py dosyasındaki UserOut'tan farklı görünüyor.
# İhtiyacınıza göre birini veya diğerini kullanabilir veya birleştirebilirsiniz.)
# -----------------------
class UserBase(BaseModel):
    username: str
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserOut(UserBase):
    id: int
    roles: List[str] = [] # list[str] yerine List[str] kullanıldı

    class Config:
        # Pydantic V2 için 'orm_mode = True' yerine 'from_attributes = True'
        from_attributes = True

