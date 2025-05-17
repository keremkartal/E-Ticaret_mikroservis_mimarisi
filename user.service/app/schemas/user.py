# from typing import List, Optional
# from pydantic import BaseModel, EmailStr
# from pydantic import Field

# class UserBase(BaseModel):
#     username: str
#     email: EmailStr

# class UserCreate(UserBase):
#     password: str

# class UserUpdate(BaseModel):
#     username: Optional[str] = None
#     email: Optional[EmailStr] = None
#     is_active: Optional[bool] = None

# class UserOut(UserBase):
#     id: int
#     is_active: bool
#     roles: List[str] = Field(default_factory=list)
#     must_change:int
#     # Pydantic v2 ayarı ↓↓↓
#     model_config = {"from_attributes": True}
# class ForgotPasswordRequest(BaseModel):
#     username: str
#     email: EmailStr

# class ForgotPasswordResponse(BaseModel):
#     detail: str
#     temporary_password: Optional[str] = None
# user.service/app/schemas/user.py

from typing import List, Optional # List ve Optional import edildiğinden emin olun
from pydantic import BaseModel, EmailStr, Field # Field import edildiğinden emin olun

class UserBase(BaseModel):
    username: str
    email: EmailStr

class UserCreate(UserBase):
    password: str # Şifre oluşturma sırasında istenir

class UserUpdate(BaseModel):
    # Güncelleme sırasında tüm alanlar opsiyoneldir
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    is_active: Optional[bool] = None
    # Şifre güncellemesi genellikle ayrı bir endpoint ve şema ile yapılır (örn: PasswordChange)
    # password: Optional[str] = None # Eğer burada şifre güncellemesi de yapılacaksa

class UserOut(UserBase): # API yanıtları için kullanılacak şema
    id: int
    is_active: bool
    # Roller için List[str] tipi kullanıldı ve varsayılan olarak boş liste atandı.
    roles: List[str] = Field(default_factory=list)
    # must_change alanı modelinizde varsa ve int ise doğru.
    # Eğer bool ise Optional[bool] = False gibi bir tanım daha uygun olabilir.
    must_change: int # Bu alanın amacına göre tipi (örn: bool) ve varsayılanı gözden geçirilebilir.

    # Pydantic V2 için model_config kullanılır, bu zaten doğru.
    model_config = {"from_attributes": True}

class ForgotPasswordRequest(BaseModel):
    username: str
    email: EmailStr

class ForgotPasswordResponse(BaseModel):
    detail: str
    temporary_password: Optional[str] = None # Optional[str] zaten doğru kullanılmış
