
from .user import User
from .role import Role
from .address import Address
from .contact import Contact
from .permission import Permission
from .revoked_token import RevokedToken      # ← EKLENDİ
__all__ = ["User", "Role", "Permission", "Address", "Contact","RevokedToken"]
