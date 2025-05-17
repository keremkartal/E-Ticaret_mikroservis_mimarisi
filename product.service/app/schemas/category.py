from pydantic import BaseModel
from typing import Optional

class CategoryBase(BaseModel):
    name: str
    description: Optional[str] = None

class CategoryCreate(CategoryBase):
    pass

class CategoryUpdate(BaseModel):
    name: Optional[str]
    description: Optional[str]

class CategoryOut(CategoryBase):
    id: int
    model_config = {"from_attributes": True}

