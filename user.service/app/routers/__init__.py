# app/routers/__init__.py
from .auth import router as auth_router
from .authz import router as authz_router
from .user import router as users_router
from .address import router as addresses_router
from .contact import router as contacts_router
from .roles import router as roles_router
from .permissions import router as permissions_router

__all__ = [
    "auth_router", "authz_router", "users_router",
    "addresses_router", "contacts_router", "roles_router",
    "permissions_router",
]
