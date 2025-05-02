from fastapi import APIRouter, Depends
from app.deps import get_current_active_user

router = APIRouter(prefix="/authz", tags=["AuthZ"])

@router.get("/me")
def me(user = Depends(get_current_active_user)): return user

@router.get("/roles")
def my_roles(user = Depends(get_current_active_user)):
    return [r.name for r in user.roles]

@router.get("/permissions")
def my_perms(user = Depends(get_current_active_user)):
    return list({p.name for r in user.roles for p in r.permissions})

@router.get("/hasRole/{role}")
def has_role(role: str, user = Depends(get_current_active_user)):
    return {"hasRole": role in {r.name for r in user.roles}}

@router.get("/hasPermission/{perm}")
def has_perm(perm: str, user = Depends(get_current_active_user)):
    perms = {p.name for r in user.roles for p in r.permissions}
    return {"hasPermission": perm in perms}
