from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.product import ProductOut, ProductCreate, ProductUpdate
from app.crud.product import get as get_product, list as list_products_crud, create as create_product, update as update_product,   soft_delete as delete_product
from app.deps import get_current_active_user, require_roles

router = APIRouter(
    prefix="/products",
    tags=["Products"]
)

# ─────────────────────────────────────────
# Public/List & Read Endpoints (User, Admin)
# ─────────────────────────────────────────
@router.get(
    "/",
    response_model=List[ProductOut],
)
def list_products(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """List all visible products with pagination."""
    return list_products_crud(db, skip=skip, limit=limit, only_visible=True)

@router.get(
    "/{product_id}",
    response_model=ProductOut
)
def get_product_detail(
    product_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """Retrieve product details. Only visible products for users, all for admin."""
    prod = get_product(db, product_id)
    if not prod:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    # Eğer ürün görünür değilse ve kullanıcı 'admin' değilse 404 dön
    if not prod.is_visible and "admin" not in current_user.roles:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    return prod


# ─────────────────────────────────────────
# Admin-only Endpoints
# ─────────────────────────────────────────
@router.post(
    "/",
    response_model=ProductOut,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_roles("admin"))]
)
def create_new_product(
    obj_in: ProductCreate,
    db: Session = Depends(get_db)
):
    """Create a new product."""
    return create_product(db, obj_in=obj_in)

@router.post(
    "/bulk",
    response_model=List[ProductOut],
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_roles("admin"))]
)
def bulk_create_products(
    objs_in: List[ProductCreate],
    db: Session = Depends(get_db)
):
    """Bulk create products."""
    created = []
    for obj in objs_in:
        created.append(create_product(db, obj_in=obj))
    return created

@router.put(
    "/{product_id}",
    response_model=ProductOut,
    dependencies=[Depends(require_roles("admin"))]
)
def update_product_admin(
    product_id: int,
    obj_in: ProductUpdate,
    db: Session = Depends(get_db)
):
    """Update an existing product."""
    prod = get_product(db, product_id)
    if not prod:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    return update_product(db, db_obj=prod, obj_in=obj_in)

@router.delete(
    "/{product_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_roles("admin"))],
)
def delete_product_endpoint(
    product_id: int,
    db: Session = Depends(get_db),
):
    """
    Ürünü gerçekten silme; sadece is_visible=False yap.
    """
    ok = delete_product(db, product_id=product_id)
    if not ok:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    return None
@router.patch(
    "/{product_id}/visibility",
    response_model=ProductOut,
    dependencies=[Depends(require_roles("admin"))]
)
def set_product_visibility(
    product_id: int,
    is_visible: bool,
    db: Session = Depends(get_db)
):
    """Toggle product visibility."""
    prod = get_product(db, product_id)
    if not prod:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    prod.is_visible = is_visible
    db.commit(); db.refresh(prod)
    return prod
