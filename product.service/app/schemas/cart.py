# product.service/app/schemas/cart.py

from pydantic import BaseModel
from datetime import datetime
from typing import List
from app.schemas.product import ProductOut
class CartBase(BaseModel):
    user_id: int

class CartItemBase(BaseModel):
    product_id: int
    quantity: int

class CartItemCreate(CartItemBase):
    """
    POST /cart/items için kullanılır.
    """
    pass

class CartItemUpdate(BaseModel):
    """
    PUT /cart/items/{product_id} için kullanılır.
    """
    quantity: int

class CartItemOut(CartItemBase):
    """
    GET /cart ve diğer endpoint’lerde dönen sepet öğesi yapısı.
    """
    id: int
    product: ProductOut
    model_config = {"from_attributes": True}


class CartOut(CartBase):
    """
    GET /cart ile dönen sepet yapısı.
    """
    id: int
    created_at: datetime
    items: List[CartItemOut] = []

    model_config = {"from_attributes": True}
