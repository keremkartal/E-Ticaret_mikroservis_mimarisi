from pydantic import BaseModel, condecimal, Field
from typing import Optional

class ProductBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: condecimal(max_digits=10, decimal_places=2)
    stock: int = Field(ge=0)
    is_visible: bool = True
    category_id: Optional[int] = None

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str]
    description: Optional[str]
    price: Optional[condecimal(max_digits=10, decimal_places=2)]
    stock: Optional[int] = Field(None, ge=0)
    is_visible: Optional[bool]
    category_id: Optional[int]

class CategoryOut(BaseModel):
    id: int
    name: str
    description: Optional[str] = None

    model_config = {"from_attributes": True}

class ProductOut(ProductBase):
    id: int
    category: Optional[CategoryOut] = None

    model_config = {"from_attributes": True}