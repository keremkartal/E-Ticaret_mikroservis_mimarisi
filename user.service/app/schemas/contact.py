# # app/schemas/contact.py

# from typing import Optional
# from pydantic import BaseModel, validator

# class ContactBase(BaseModel):
#     category: str = "personal"
#     type: str
#     detail: str

#     @validator("detail")
#     def detail_must_match_type(cls, v, values):
#         t = values.get("type")
#         if t == "email":
#             if not v.endswith("@gmail.com"):
#                 raise ValueError("Email must end with @gmail.com")
#         elif t == "phone":
#             if not (v.isdigit() and len(v) == 11):
#                 raise ValueError("Phone number must be 11 digits")
#         return v

# class ContactCreate(ContactBase):
#     pass

# class ContactUpdate(BaseModel):
#     category: Optional[str] = None
#     type:     Optional[str] = None
#     detail:   Optional[str] = None

#     @validator("detail")
#     def update_detail_must_match_type(cls, v, values):
#         t = values.get("type")
#         # Eğer hem type hem detail gelmişse, beraber doğrula
#         if t and v is not None:
#             if t == "email":
#                 if not v.endswith("@gmail.com"):
#                     raise ValueError("Email must end with @gmail.com")
#             elif t == "phone":
#                 if not (v.isdigit() and len(v) == 11):
#                     raise ValueError("Phone number must be 11 digits")
#         return v

# class Contact(ContactBase):
#     id:      int
#     user_id: int

#     class Config:
#         orm_mode = True
# user.service/app/schemas/contact.py

from typing import Optional, Any # Any, validator'daki 'values' için eklendi
from pydantic import BaseModel, validator

class ContactBase(BaseModel):
    category: str = "personal"
    type: str # Örneğin "email", "phone"
    detail: str

    # Pydantic V2'de validator kullanımı değişmiştir (@field_validator, @model_validator).
    # Eski @validator yapısı bazı durumlarda çalışmaya devam edebilir (özellikle Pydantic V1 uyumluluk modu açıksa)
    # veya uyarı verebilir. Güvenli olması için Pydantic V2'nin yeni validator'larını kullanmak daha iyidir.
    # Şimdilik mevcut yapıyı koruyarak tip ipuçlarını ekliyorum.
    @validator("detail")
    def detail_must_match_type(cls, v: str, values: Any) -> str:
        t = values.get("type") # Pydantic V2'de values.data.get("type") daha uygun olabilir
        if t == "email":
            # Örnek validator, belirli bir domain zorunluluğu genellikle iş mantığına göre değişir.
            # Daha genel bir e-posta formatı kontrolü daha uygun olabilir.
            if not v.endswith("@gmail.com"): # Bu kuralı projenizin gereksinimlerine göre ayarlayın
                raise ValueError("E-posta @gmail.com ile bitmelidir.")
        elif t == "phone":
            # Telefon numarası formatı bölgeye göre değişir, bu basit bir örnektir.
            if not (v.isdigit() and len(v) == 11): # Bu kuralı projenizin gereksinimlerine göre ayarlayın
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
        if v is None: # Eğer detail güncellenmiyorsa (None ise) validasyondan geç
            return v
            
        t = values.get("type") # Pydantic V2'de values.data.get("type") daha uygun olabilir
        # Eğer type da güncelleniyorsa veya mevcutsa ve detail None değilse, beraber doğrula
        if t:
            if t == "email":
                if not v.endswith("@gmail.com"): # Bu kuralı projenizin gereksinimlerine göre ayarlayın
                    raise ValueError("E-posta @gmail.com ile bitmelidir.")
            elif t == "phone":
                if not (v.isdigit() and len(v) == 11): # Bu kuralı projenizin gereksinimlerine göre ayarlayın
                    raise ValueError("Telefon numarası 11 haneli ve sadece rakamlardan oluşmalıdır.")
        # Not: Eğer sadece 'detail' güncelleniyor ve 'type' istekte yoksa,
        # bu validator mevcut 'type'ı bilemez. Daha kapsamlı bir validasyon için
        # ya 'type' da güncellenmeli ya da mevcut 'type' veritabanından okunup validasyona dahil edilmelidir.
        return v

class Contact(ContactBase):
    id: int
    user_id: int

    class Config:
        # Pydantic V2 için 'orm_mode = True' yerine 'from_attributes = True'
        from_attributes = True
