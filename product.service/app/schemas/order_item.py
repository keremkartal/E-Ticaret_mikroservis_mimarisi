from pydantic import BaseModel, condecimal

class OrderItemBase(BaseModel):
    product_id: int
    quantity: int
    price_at_order: condecimal(max_digits=10, decimal_places=2)

class OrderItemOut(OrderItemBase):
    id: int
    model_config = {"from_attributes": True}
