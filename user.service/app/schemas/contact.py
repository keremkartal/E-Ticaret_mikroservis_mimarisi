# app/schemas/contact.py
from typing import Optional
from pydantic import BaseModel

class ContactBase(BaseModel):
    category: str = "personal"
    type: str
    detail: str

class ContactCreate(ContactBase): pass

class ContactUpdate(BaseModel):
    category: Optional[str] = None
    type: Optional[str] = None
    detail: Optional[str] = None

class Contact(ContactBase):
    id: int
    user_id: int
    class Config: orm_mode = True
