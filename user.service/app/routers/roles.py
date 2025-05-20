from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.db.session import get_db
from app.deps import require_roles
from app.schemas.role import Role as RoleSchema, RoleCreate, RoleUpdate
from app.crud import role as crud_role
from app.crud import permission as crud_perm

router = APIRouter(
    prefix="/roles",
    tags=["Roles"],
    dependencies=[Depends(require_roles("admin"))]
)

@router.get("/", response_model=List[RoleSchema])
def list_roles(db: Session = Depends(get_db)):

    roles_from_db = crud_role.list_roles(db)
    result = []
    for r in roles_from_db:
        permission_names = [p.name for p in r.permissions] if r.permissions else []
        role_data = {
            "id": r.id,
            "name": r.name,
            "description": r.description,
            "permissions": permission_names
        }
        result.append(RoleSchema.model_validate(role_data))
    return result

@router.post("/", response_model=RoleSchema, status_code=status.HTTP_201_CREATED)
def create_role(obj_in: RoleCreate, db: Session = Depends(get_db)):
   
    existing_role = crud_role.get_by_name(db, name=obj_in.name)
    if existing_role:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Bu rol adı zaten mevcut."
        )
    created_role = crud_role.create(db, obj_in=obj_in)
    role_data = {
        "id": created_role.id,
        "name": created_role.name,
        "description": created_role.description,
        "permissions": []
    }
    return RoleSchema.model_validate(role_data)

@router.get("/{role_id}", response_model=RoleSchema)
def get_role(role_id: int, db: Session = Depends(get_db)):
    db_role = crud_role.get(db, role_id=role_id)
    if db_role is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Rol bulunamadı")
    permission_names = [p.name for p in db_role.permissions] if db_role.permissions else []
    role_data = {
        "id": db_role.id,
        "name": db_role.name,
        "description": db_role.description,
        "permissions": permission_names
    }
    return RoleSchema.model_validate(role_data)

@router.put("/{role_id}", response_model=RoleSchema)
def update_role(role_id: int, obj_in: RoleUpdate, db: Session = Depends(get_db)):
    db_role = crud_role.get(db, role_id=role_id)
    if db_role is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Rol bulunamadı")
    if obj_in.name and obj_in.name != db_role.name:
        existing = crud_role.get_by_name(db, name=obj_in.name)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Bu rol adı zaten başka bir rol tarafından kullanılıyor."
            )
    updated = crud_role.update(db, db_obj=db_role, obj_in=obj_in)
    permission_names = [p.name for p in updated.permissions] if updated.permissions else []
    role_data = {
        "id": updated.id,
        "name": updated.name,
        "description": updated.description,
        "permissions": permission_names
    }
    return RoleSchema.model_validate(role_data)

@router.delete("/{role_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_role(role_id: int, db: Session = Depends(get_db)):
    db_role = crud_role.get(db, role_id=role_id)
    if db_role is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Rol bulunamadı")
    crud_role.remove(db, role_id=role_id)
    return None

@router.put("/{role_id}/permissions", response_model=RoleSchema)
def set_role_permissions(role_id: int, permission_ids: List[int], db: Session = Depends(get_db)):
    db_role = crud_role.get(db, role_id=role_id)
    if not db_role:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Rol bulunamadı")
    permissions_to_assign = []
    for p_id in permission_ids:
        perm = crud_perm.get(db, permission_id=p_id)
        if not perm:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"İzin ID {p_id} geçersiz.")
        permissions_to_assign.append(perm)
    db_role.permissions = permissions_to_assign
    db.add(db_role)
    db.commit()
    db.refresh(db_role)
    permission_names = [p.name for p in db_role.permissions] if db_role.permissions else []
    role_data = {
        "id": db_role.id,
        "name": db_role.name,
        "description": db_role.description,
        "permissions": permission_names
    }
    return RoleSchema.model_validate(role_data)

@router.post("/{role_id}/permissions/{permission_id}", response_model=RoleSchema)
def add_permission_to_role(role_id: int, permission_id: int, db: Session = Depends(get_db)):
   
    db_role = crud_role.get(db, role_id=role_id)
    db_permission = crud_perm.get(db, permission_id=permission_id)
    if not db_role:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Rol bulunamadı")
    if not db_permission:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="İzin bulunamadı")
    if db_permission not in db_role.permissions:
        db_role.permissions.append(db_permission)
        db.add(db_role)
        db.commit()
        db.refresh(db_role)
    permission_names = [p.name for p in db_role.permissions] if db_role.permissions else []
    role_data = {
        "id": db_role.id,
        "name": db_role.name,
        "description": db_role.description,
        "permissions": permission_names
    }
    return RoleSchema.model_validate(role_data)
