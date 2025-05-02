# app/schemas/__init__.py
from .user import UserCreate, UserUpdate, UserOut
from .auth import Token, TokenData
from .password import PasswordChange
from .address import AddressCreate, AddressUpdate, Address
from .contact import ContactCreate, ContactUpdate, Contact
from .role import RoleCreate, RoleUpdate, Role
from .permission import PermissionCreate, PermissionUpdate, Permission
