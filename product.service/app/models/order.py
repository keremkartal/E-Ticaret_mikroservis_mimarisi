# app/models/order.py
from sqlalchemy import Column, Integer, ForeignKey, Numeric, String, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.base import Base

class Order(Base):
    __tablename__ = "orders"

    id           = Column(Integer, primary_key=True, index=True)
    user_id      = Column(Integer, index=True, nullable=False)
    address_id   = Column(Integer, nullable=True)         
    total_amount = Column(Numeric(10, 2), nullable=False)
    status       = Column(String, default="pending")
    created_at   = Column(DateTime, default=datetime.utcnow)
    street       = Column(String, nullable=True)
    city         = Column(String, nullable=True)
    country      = Column(String, nullable=True)
    postal_code  = Column(String, nullable=True)

    items = relationship("OrderItem", back_populates="order")


