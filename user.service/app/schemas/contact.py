from typing import Optional, Any
from pydantic import BaseModel, validator

class ContactBase(BaseModel):
    category: str = "personal"
    type: str
    detail: str

    @validator("detail")
    def detail_must_match_type(cls, v: str, values: Any) -> str:
        t = values.get("type")
        if t == "email":
            if not v.endswith("@gmail.com"):
                raise ValueError("E-posta @gmail.com ile bitmelidir.")
        elif t == "phone":
            if not (v.isdigit() and len(v) == 11):
                raise ValueError("Telefon numarası 11 haneli ve sadece rakamlardan oluşmalıdır.")
        return v

class ContactCreate(ContactBase):
    pass

class ContactUpdate(BaseModel):
    category: Optional[str] = None
    type: Optional[str] = None
    detail: Optional[str] = None

    @validator("detail")
    def update_detail_must_match_type(cls, v: Optional[str], values: Any) -> Optional[str]:
        if v is None:
            return v
        t = values.get("type")
        if t:
            if t == "email":
                if not v.endswith("@gmail.com"):
                    raise ValueError("E-posta @gmail.com ile bitmelidir.")
            elif t == "phone":
                if not (v.isdigit() and len(v) == 11):
                    raise ValueError("Telefon numarası 11 haneli ve sadece rakamlardan oluşmalıdır.")
        return v

class Contact(ContactBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True
