from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.address import Address, AddressCreate, AddressUpdate
from app.crud.address import get as get_address, list_by_user, create as create_address,update as update_address, remove as remove_address
from app.deps import get_current_active_user

router = APIRouter(
    prefix="/users/me/addresses",
    tags=["Addresses"],
)

@router.get("/", response_model=list[Address])
def list_addresses(
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    return list_by_user(db, current_user.id)


@router.get("/{address_id}", response_model=Address)
def get_addr(
    address_id: int,
    current_user = Depends(get_current_active_user),
    db: Session   = Depends(get_db),
):
    
    addr = get_address(db, address_id)
    if not addr or addr.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Address not found",
        )
    return addr

@router.post("/", response_model=Address, status_code=status.HTTP_201_CREATED)
def create_addr(
    addr_in: AddressCreate,
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Create a new address for the current user."""
    return create_address(db, user_id=current_user.id, obj_in=addr_in)

@router.put("/{address_id}", response_model=Address)
def update_addr(
    address_id: int,
    addr_in: AddressUpdate,
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    addr = get_address(db, address_id)
    if not addr or addr.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Address not found",
        )
    return update_address(db, db_obj=addr, obj_in=addr_in)

@router.delete("/{address_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_addr(
    address_id: int,
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    addr = get_address(db, address_id)
    if not addr or addr.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Address not found",
        )
    success = remove_address(db, address_id=address_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete address",
        )
