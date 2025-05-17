from sqlalchemy import Column, Integer, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.base import Base

class Cart(Base):
    __tablename__ = "carts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    items = relationship("CartItem", back_populates="cart", cascade="all, delete-orphan")
