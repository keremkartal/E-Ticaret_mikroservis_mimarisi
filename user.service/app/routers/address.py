from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.address import Address, AddressCreate, AddressUpdate
from app.crud import address as crud_address
from app.deps import get_current_active_user

router = APIRouter(prefix="/users/me/addresses", tags=["Addresses"])

@router.get("/", response_model=list[Address])
def list_addresses(current_user=Depends(get_current_active_user),
                   db: Session = Depends(get_db)):
    return crud_address.list_by_user(db, current_user.id)

@router.post("/", response_model=Address, status_code=status.HTTP_201_CREATED)
def create_address(addr_in: AddressCreate,
                   current_user=Depends(get_current_active_user),
                   db: Session = Depends(get_db)):
    return crud_address.create(db, user_id=current_user.id, obj_in=addr_in)

@router.get("/{addr_id}", response_model=Address)
def get_address(addr_id: int,
                current_user=Depends(get_current_active_user),
                db: Session = Depends(get_db)):
    addr = crud_address.get(db, addr_id)
    if not addr or addr.user_id != current_user.id:
        raise HTTPException(404, "Address not found")
    return addr

@router.put("/{addr_id}", response_model=Address)
def update_address(addr_id: int, addr_in: AddressUpdate,
                   current_user=Depends(get_current_active_user),
                   db: Session = Depends(get_db)):
    addr = crud_address.get(db, addr_id)
    if not addr or addr.user_id != current_user.id:
        raise HTTPException(404, "Address not found")
    return crud_address.update(db, db_obj=addr, obj_in=addr_in)

@router.delete("/{addr_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_address(addr_id: int,
                   current_user=Depends(get_current_active_user),
                   db: Session = Depends(get_db)):
    addr = crud_address.get(db, addr_id)
    if not addr or addr.user_id != current_user.id:
        raise HTTPException(404, "Address not found")
    crud_address.remove(db, address_id=addr_id)
