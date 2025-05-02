from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.deps import require_roles
from app.schemas.role import Role, RoleCreate, RoleUpdate
from app.crud import role as crud_role
from app.crud import permission as crud_perm

router = APIRouter(
    prefix="/roles",
    tags=["Roles"],
    dependencies=[Depends(require_roles("admin"))]
)

@router.get("/", response_model=list[Role])
def list_roles(db: Session = Depends(get_db)):
    return crud_role.list_roles(db)

@router.post("/", response_model=Role, status_code=status.HTTP_201_CREATED)
def create_role(obj_in: RoleCreate, db: Session = Depends(get_db)):
    if crud_role.get_by_name(db, obj_in.name):
        raise HTTPException(400, "Role name already exists")
    return crud_role.create(db, obj_in=obj_in)

@router.get("/{role_id}", response_model=Role)
def get_role(role_id: int, db: Session = Depends(get_db)):
    role = crud_role.get(db, role_id)
    if not role:
        raise HTTPException(404, "Role not found")
    return role

@router.put("/{role_id}", response_model=Role)
def update_role(role_id: int, obj_in: RoleUpdate, db: Session = Depends(get_db)):
    role = crud_role.get(db, role_id)
    if not role:
        raise HTTPException(404, "Role not found")
    return crud_role.update(db, db_obj=role, obj_in=obj_in)

@router.delete("/{role_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_role(role_id: int, db: Session = Depends(get_db)):
    role = crud_role.get(db, role_id)
    if not role:
        raise HTTPException(404, "Role not found")
    crud_role.remove(db, role_id)


# ──────────────────────── İzin Atama / Güncelleme ────────────────────────
@router.put("/{role_id}/permissions", response_model=Role)
def set_role_permissions(
    role_id: int,
    perm_ids: list[int],
    db: Session = Depends(get_db)
):
    role = crud_role.get(db, role_id)
    if not role:
        raise HTTPException(404, "Role not found")

    # izinleri role bağla
    perms = [crud_perm.get(db, pid) for pid in perm_ids]
    if any(p is None for p in perms):
        raise HTTPException(400, "Some permission IDs invalid")

    role.permissions = perms
    db.commit(); db.refresh(role)
    return role
