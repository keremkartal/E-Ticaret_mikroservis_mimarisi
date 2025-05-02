# app/schemas/role.py
from pydantic import BaseModel

class RoleBase(BaseModel):
    name: str
    description: str | None = None

class RoleCreate(RoleBase): pass
class RoleUpdate(RoleBase): pass

class Role(RoleBase):
    id: int
    permissions: list[str] = []

    class Config:
        orm_mode = True
