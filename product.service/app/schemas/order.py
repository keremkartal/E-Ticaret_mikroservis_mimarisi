from pydantic import BaseModel, condecimal
from datetime import datetime
from decimal import Decimal
from typing import List, Optional
from app.schemas.order_item import OrderItemOut

class OrderBase(BaseModel):
    user_id: int
    total_amount: condecimal(max_digits=10, decimal_places=2)
    status: str
    # Adres alanları (nullable)
    street:      Optional[str] = None
    city:        Optional[str] = None
    country:     Optional[str] = None
    postal_code: Optional[str] = None

class OrderCreate(BaseModel):
    address_id: int           # ← artık zorunlu (Optional kaldırıldı)

class OrderOut(OrderBase):
    id: int
    created_at: datetime
    items: List[OrderItemOut] = []
    model_config = {"from_attributes": True}
