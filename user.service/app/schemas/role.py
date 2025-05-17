# # app/schemas/role.py
# from pydantic import BaseModel

# class RoleBase(BaseModel):
#     name: str
#     description: str | None = None

# class RoleCreate(RoleBase): pass
# class RoleUpdate(RoleBase): pass

# class Role(RoleBase):
#     id: int
#     permissions: list[str] = []

#     class Config:
#         orm_mode = True
# user.service/app/schemas/role.py

from pydantic import BaseModel
from typing import Optional, List # Optional ve List import edildi

class RoleBase(BaseModel):
    name: str
    description: Optional[str] = None # Python 3.9 için Optional kullanıldı

class RoleCreate(RoleBase):
    pass

class RoleUpdate(RoleBase):
    # Güncelleme sırasında alanlar opsiyonel olabilir, bu yüzden Optional eklenebilir
    name: Optional[str] = None
    description: Optional[str] = None

class Role(RoleBase): # Bu şema API yanıtları için kullanılacak
    id: int
    # permissions alanı, router'da manuel olarak eklendiği için burada string listesi olarak kalabilir.
    # Eğer ORM'den direkt map edilecekse ve Permission objeleri olacaksa tipi farklı olurdu.
    permissions: List[str] = []

    class Config:
        # Pydantic V2 için 'orm_mode' yerine 'from_attributes'
        # Bu, SQLAlchemy modellerinden Pydantic modellerine dönüşüm için gereklidir.
        from_attributes = True