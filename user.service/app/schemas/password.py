# app/schemas/password.py
from pydantic import BaseModel, constr

class PasswordChange(BaseModel):
    old_password: constr(min_length=6)
    new_password: constr(min_length=6)
