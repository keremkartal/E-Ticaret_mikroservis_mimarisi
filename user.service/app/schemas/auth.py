# app/schemas/auth.py
from typing import Optional
from pydantic import BaseModel, EmailStr

# -----------------------
# Token şemaları
# -----------------------
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class TokenData(BaseModel):
    username: Optional[str] = None

# -----------------------
# Kullanıcı DTO’ları
# -----------------------
class UserBase(BaseModel):
    username: str
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserOut(UserBase):
    id: int
    roles: list[str] = []

    class Config:
        orm_mode = True
