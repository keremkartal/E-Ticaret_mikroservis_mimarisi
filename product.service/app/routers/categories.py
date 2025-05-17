from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.category import Category as CategoryModel
from app.schemas.category import CategoryOut, CategoryCreate, CategoryUpdate
from app.crud.category import get as get_category, list as list_categories_crud, create as create_category, update as update_category, remove as remove_category
from app.deps import get_current_active_user, require_roles

router = APIRouter(
    prefix="/categories",
    tags=["Categories"]
)

# ─────────────────────────────────────────
# Public Endpoint (User & Admin)
# ─────────────────────────────────────────
@router.get(
    "/",
    response_model=List[CategoryOut]
)
def list_categories(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """List all product categories."""
    # Only pass db to CRUD list function
    return list_categories_crud(db)

# ─────────────────────────────────────────
# Admin-only Endpoints
# ─────────────────────────────────────────
@router.post(
    "/",
    response_model=CategoryOut,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_roles("admin"))]
)
def create_category_admin(
    obj_in: CategoryCreate,
    db: Session = Depends(get_db)
):
    """Create a new category."""
    # Conflict check
    exists = db.query(CategoryModel).filter(CategoryModel.name == obj_in.name).first()
    if exists:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Category already exists")
    return create_category(db, obj_in=obj_in)

@router.put(
    "/{cat_id}",
    response_model=CategoryOut,
    dependencies=[Depends(require_roles("admin"))]
)
def update_category_admin(
    cat_id: int,
    obj_in: CategoryUpdate,
    db: Session = Depends(get_db)
):
    """Update an existing category."""
    cat = get_category(db, cat_id)
    if not cat:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    # Name conflict if changing name
    if obj_in.name and obj_in.name != cat.name:
        duplicate = db.query(CategoryModel).filter(CategoryModel.name == obj_in.name).first()
        if duplicate:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Category name conflict")
    return update_category(db, db_obj=cat, obj_in=obj_in)

@router.delete(
    "/{cat_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_roles("admin"))]
)
def delete_category_admin(
    cat_id: int,
    db: Session = Depends(get_db)
):
    """Delete a category."""
    cat = get_category(db, cat_id)
    if not cat:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    remove_category(db, category_id=cat_id)
