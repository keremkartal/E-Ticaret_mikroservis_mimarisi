from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base

class Address(Base):
    __tablename__ = "addresses"

    id          = Column(Integer, primary_key=True, index=True)
    user_id     = Column(Integer, ForeignKey("users.id"))
    category    = Column(String, default="home")   # "home" / "work"
    street      = Column(String)
    city        = Column(String)
    country     = Column(String)
    postal_code = Column(String)

    user = relationship("User", back_populates="addresses")
