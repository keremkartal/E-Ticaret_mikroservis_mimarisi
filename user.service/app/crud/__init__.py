
# app/crud/__init__.py (güncelleme)
from .user import (
    get_user, get_user_by_username, list_users, create_user,
    update_user, deactivate, authenticate_user,
    update_password, reset_password, set_user_roles
)
from .role import (
    get as get_role, list_roles, create as create_role,
    update as update_role, remove as remove_role
)
from .permission import (
    get as get_permission, get_by_name as get_permission_by_name,
    list_permissions, create as create_permission,
    update as update_permission, remove as remove_permission
)
from .address import (
    get as get_address, list_by_user as list_addresses,
    create as create_address, update as update_address,
    remove as remove_address
)
from .contact import (
    get as get_contact, list_by_user as list_contacts,
    create as create_contact, update as update_contact,
    remove as remove_contact
)
