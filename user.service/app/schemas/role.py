from pydantic import BaseModel
from typing import Optional, List

class RoleBase(BaseModel):
    name: str
    description: Optional[str] = None

class RoleCreate(RoleBase):
    pass

class RoleUpdate(RoleBase):
    name: Optional[str] = None
    description: Optional[str] = None

class Role(RoleBase):
    id: int
    permissions: List[str] = []

    class Config:
        from_attributes = True
