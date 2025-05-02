from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.contact import Contact, ContactCreate, ContactUpdate
from app.crud import contact as crud_contact
from app.deps import get_current_active_user

router = APIRouter(prefix="/users/me/contacts", tags=["Contacts"])

@router.get("/", response_model=list[Contact])
def list_contacts(current_user=Depends(get_current_active_user),
                  db: Session = Depends(get_db)):
    return crud_contact.list_by_user(db, current_user.id)

@router.post("/", response_model=Contact, status_code=status.HTTP_201_CREATED)
def create_contact(contact_in: ContactCreate,
                   current_user=Depends(get_current_active_user),
                   db: Session = Depends(get_db)):
    return crud_contact.create(db, user_id=current_user.id, obj_in=contact_in)

@router.get("/{contact_id}", response_model=Contact)
def get_contact(contact_id: int,
                current_user=Depends(get_current_active_user),
                db: Session = Depends(get_db)):
    contact = crud_contact.get(db, contact_id)
    if not contact or contact.user_id != current_user.id:
        raise HTTPException(404, "Contact not found")
    return contact

@router.put("/{contact_id}", response_model=Contact)
def update_contact(contact_id: int, contact_in: ContactUpdate,
                   current_user=Depends(get_current_active_user),
                   db: Session = Depends(get_db)):
    contact = crud_contact.get(db, contact_id)
    if not contact or contact.user_id != current_user.id:
        raise HTTPException(404, "Contact not found")
    return crud_contact.update(db, db_obj=contact, obj_in=contact_in)

@router.delete("/{contact_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_contact(contact_id: int,
                   current_user=Depends(get_current_active_user),
                   db: Session = Depends(get_db)):
    contact = crud_contact.get(db, contact_id)
    if not contact or contact.user_id != current_user.id:
        raise HTTPException(404, "Contact not found")
    crud_contact.remove(db, contact_id=contact_id)
