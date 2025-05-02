from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base

class Contact(Base):
    __tablename__ = "contacts"

    id      = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    category = Column(String, default="personal")  # "personal" / "business"
    type    = Column(String)   # phone, email, …
    detail  = Column(String)

    user = relationship("User", back_populates="contacts")
