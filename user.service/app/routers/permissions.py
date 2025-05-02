from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.deps import require_roles
from app.schemas.permission import Permission, PermissionCreate, PermissionUpdate
from app.crud import permission as crud_perm

router = APIRouter(
    prefix="/permissions",
    tags=["Permissions"],
    dependencies=[Depends(require_roles("admin"))]
)

@router.get("/", response_model=list[Permission])
def list_perms(db: Session = Depends(get_db)):
    return crud_perm.list_permissions(db)

@router.post("/", response_model=Permission, status_code=status.HTTP_201_CREATED)
def create_perm(obj_in: PermissionCreate, db: Session = Depends(get_db)):
    if crud_perm.get_by_name(db, obj_in.name):
        raise HTTPException(400, "Permission name exists")
    return crud_perm.create(db, obj_in=obj_in)

@router.get("/{perm_id}", response_model=Permission)
def get_perm(perm_id: int, db: Session = Depends(get_db)):
    perm = crud_perm.get(db, perm_id)
    if not perm:
        raise HTTPException(404, "Permission not found")
    return perm

@router.put("/{perm_id}", response_model=Permission)
def update_perm(perm_id: int, obj_in: PermissionUpdate, db: Session = Depends(get_db)):
    perm = crud_perm.get(db, perm_id)
    if not perm:
        raise HTTPException(404, "Permission not found")
    return crud_perm.update(db, db_obj=perm, obj_in=obj_in)

@router.delete("/{perm_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_perm(perm_id: int, db: Session = Depends(get_db)):
    perm = crud_perm.get(db, perm_id)
    if not perm:
        raise HTTPException(404, "Permission not found")
    crud_perm.remove(db, perm_id)
