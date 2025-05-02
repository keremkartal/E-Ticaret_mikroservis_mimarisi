# app/models/__init__.py
from .user import User
from .role import Role
from .permission import Permission
from .address import Address
from .contact import Contact

__all__ = ["User", "Role", "Permission", "Address", "Contact"]
