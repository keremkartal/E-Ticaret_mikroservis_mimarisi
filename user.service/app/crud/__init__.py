# app/crud/__init__.py
from .user import (
    get_user, get_user_by_username, create_user, list_users,
    update_user, deactivate, set_user_roles,
    authenticate_user, update_password, reset_password,
)
from .role import get as get_role, list_roles, create as create_role
from .permission import get as get_permission, list_permissions
from .address import create as create_address
from .contact import create as create_contact
