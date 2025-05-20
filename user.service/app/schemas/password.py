
from pydantic import BaseModel, constr, Field
from typing import Optional, Any 

class PasswordChange(BaseModel):
    old_password: Optional[str] = Field(None, min_length=6)  
    new_password: str = Field(..., min_length=6)