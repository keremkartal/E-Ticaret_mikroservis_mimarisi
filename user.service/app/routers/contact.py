from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.contact import Contact as ContactSchema, ContactCreate, ContactUpdate
from app.crud import contact as crud_contact
from app.deps import get_current_active_user

router = APIRouter(
    prefix="/users/me/contacts",
    tags=["Contacts"],
)

@router.get("/", response_model=list[ContactSchema])
def list_contacts(
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """List all contacts of the current user."""
    return crud_contact.list_by_user(db, current_user.id)

@router.post("/", response_model=ContactSchema, status_code=status.HTTP_201_CREATED)
def create_contact(
    contact_in: ContactCreate,
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Create a new contact for the current user."""
    return crud_contact.create(db, user_id=current_user.id, obj_in=contact_in)

@router.get("/{contact_id}", response_model=ContactSchema)
def get_contact(
    contact_id: int,
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Get details of a specific contact."""
    contact = crud_contact.get(db, contact_id)
    if not contact or contact.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contact not found",
        )
    return contact

@router.put("/{contact_id}", response_model=ContactSchema)
def update_contact(
    contact_id: int,
    contact_in: ContactUpdate,
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Update an existing contact."""
    contact = crud_contact.get(db, contact_id)
    if not contact or contact.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contact not found",
        )
    return crud_contact.update(db, db_obj=contact, obj_in=contact_in)

@router.delete("/{contact_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_contact(
    contact_id: int,
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Delete a contact."""
    contact = crud_contact.get(db, contact_id)
    if not contact or contact.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contact not found",
        )
    success = crud_contact.remove(db, contact_id=contact_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete contact",
        )
