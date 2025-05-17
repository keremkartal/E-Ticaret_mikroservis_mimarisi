from pydantic import BaseModel
from typing import Optional, List # List import edildi

class AddressOut(BaseModel):
    id: int
    street:      Optional[str] = None
    city:        Optional[str] = None
    country:    Optional[str] = None
    postal_code:Optional[str] = None
    category:    Optional[str] = None

    model_config = {"from_attributes": True}
