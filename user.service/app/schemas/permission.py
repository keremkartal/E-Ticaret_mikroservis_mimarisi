# # app/schemas/permission.py
# from pydantic import BaseModel

# class PermissionBase(BaseModel):
#     name: str
#     description: str | None = None

# class PermissionCreate(PermissionBase): pass
# class PermissionUpdate(PermissionBase): pass

# class Permission(PermissionBase):
#     id: int
#     class Config:
#         orm_mode = True
# user.service/app/schemas/permission.py
from typing import Optional
from pydantic import BaseModel

class PermissionBase(BaseModel):
    name: str
    # Python 3.9 uyumluluğu için Optional kullanıldı
    description: Optional[str] = None

class PermissionCreate(PermissionBase):
    pass

class PermissionUpdate(PermissionBase):
    # Güncelleme sırasında alanlar opsiyonel olabilir
    name: Optional[str] = None
    description: Optional[str] = None

class Permission(PermissionBase): # Bu şema API yanıtları için kullanılacaksa
    id: int

    class Config:
        # Pydantic V2 için 'orm_mode = True' yerine 'from_attributes = True'
        from_attributes = True
