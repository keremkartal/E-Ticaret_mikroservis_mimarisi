# # app/schemas/password.py
# from pydantic import BaseModel, constr

# class PasswordChange(BaseModel):
#     old_password: constr(min_length=6)
#     new_password: constr(min_length=6)
# user.service/app/schemas/password.py
from pydantic import BaseModel, constr, Field
from typing import Optional, Any # Any, validator'daki 'values' için eklendi

# constr Pydantic V1'den kalmadır, V2'de Field kullanımı daha yaygındır ve önerilir.
# İki şekilde de çalışabilir, ancak Field daha esnektir.

# user.service/app/schemas/user.py

class PasswordChange(BaseModel):
    old_password: Optional[str] = Field(None, min_length=6)  # Opsiyonel yapıldı
    new_password: str = Field(..., min_length=6)