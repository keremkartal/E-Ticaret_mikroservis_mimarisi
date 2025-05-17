# # app/schemas/address.py
# from typing import Optional
# from pydantic import BaseModel

# class AddressBase(BaseModel):
#     category: str = "home"
#     street: str
#     city: str
#     country: str
#     postal_code: str

# class AddressCreate(AddressBase): pass

# class AddressUpdate(BaseModel):
#     category: Optional[str] = None
#     street: Optional[str] = None
#     city: Optional[str] = None
#     country: Optional[str] = None
#     postal_code: Optional[str] = None

# class Address(AddressBase):
#     id: int
#     user_id: int
#     class Config: orm_mode = True
# user.service/app/schemas/address.py
from typing import Optional
from pydantic import BaseModel

class AddressBase(BaseModel):
    category: str = "home"
    street: str
    city: str
    country: str
    postal_code: str

class AddressCreate(AddressBase):
    pass

class AddressUpdate(BaseModel):
    category: Optional[str] = None
    street: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    postal_code: Optional[str] = None

class Address(AddressBase):
    id: int
    user_id: int

    class Config:
        # Pydantic V2 için 'orm_mode = True' yerine 'from_attributes = True'
        from_attributes = True
