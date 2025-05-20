from typing import List, Optional
from pydantic import BaseModel, EmailStr, Field

class UserBase(BaseModel):
    username: str
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    is_active: Optional[bool] = None

class UserOut(UserBase):
    id: int
    is_active: bool
    roles: List[str] = Field(default_factory=list)
    must_change: int

    model_config = {"from_attributes": True}

class ForgotPasswordRequest(BaseModel):
    username: str
    email: EmailStr

class ForgotPasswordResponse(BaseModel):
    detail: str
    temporary_password: Optional[str] = None
