from sqlalchemy import Column, Integer, String, Boolean, Table, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base

user_roles = Table(
  "user_roles", Base.metadata,
  Column("user_id", Integer, ForeignKey("users.id")),
  Column("role_id", Integer, ForeignKey("roles.id")),
)

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    must_change      = Column(Integer, default=0, nullable=False) 
    roles = relationship("Role", secondary=user_roles, back_populates="users")
    addresses = relationship("Address", back_populates="user")
    contacts = relationship("Contact", back_populates="user")
    
