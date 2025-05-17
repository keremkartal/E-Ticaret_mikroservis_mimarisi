from decimal import Decimal
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.crud.order_item import create_item
from app.schemas.order import OrderOut, OrderCreate
from app.db.session import get_db
from app.deps import get_current_active_user
from app.crud.cart import get_or_create_cart, clear_cart
from app.crud.cart_item import list_items
from app.crud.product  import get as  get_product
from app.crud.order import (
    create as create_order,
    list_by_user,
    get as get_order,
)
# app/routers/orders.py
from decimal import Decimal
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import httpx                                             # User‑service çağrısı için

from app.db.session import get_db
from app.deps import get_current_active_user
from app.crud.cart import get_or_create_cart, clear_cart
from app.crud.cart_item import list_items
from app.crud.order import create as create_order, list_by_user, get as get_order
from app.crud.order_item import create_item
from app.schemas.order import OrderOut, OrderCreate

USER_SERVICE_URL = "http://127.0.0.1:8000"               # gerekirse .env’den çekin

router = APIRouter(prefix="/orders", tags=["Orders"])

# ───────────────────────── POST /orders ──────────────────────────
# app/routers/orders.py  (yalnızca place_order fonksiyonu)




from decimal import Decimal
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import httpx                                              # ★
from app.core.config import settings                      # USER_SERVICE_URL buradan

from app.db.session import get_db
from app.deps import get_current_active_user
from app.crud.cart import get_or_create_cart, clear_cart
from app.crud.cart_item import list_items
from app.crud.order import create as create_order
from app.crud.order_item import create_item
from app.schemas.order import OrderCreate, OrderOut
# app/utils/user_service.py
import requests
from fastapi import HTTPException, status

def fetch_address(address_id: int, user_token: str, user_service_url: str) -> dict:
    """
    User‑Service’teki /users/me/addresses/{id} endpoint’ini çağırır.
    """
    url = f"{user_service_url}/users/me/addresses/{address_id}"
    headers = {"Authorization": f"Bearer {user_token}"}
    resp = requests.get(url, headers=headers, timeout=5)
    if resp.status_code == 404:
        raise HTTPException(status_code=400, detail="Address not found")
    if resp.status_code != 200:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY,
                            detail="User‑Service error")
    return resp.json()   # {street, city, country, postal_code, ...}

USER_SERVICE_URL = settings.USER_SERVICE_URL  # örn. "http://localhost:8000"


from app.core.config import settings   # USER_SERVICE_URL burada

router = APIRouter(prefix="/orders", tags=["Orders"])


@router.post("/", response_model=OrderOut, status_code=status.HTTP_201_CREATED)
def place_order(
    body: OrderCreate,
    current_user = Depends(get_current_active_user),
    db: Session    = Depends(get_db),
):
    # 1) Sepeti kontrol et
    cart = get_or_create_cart(db, current_user.user_id)
    cart_items = list_items(db, cart.id)
    if not cart_items:
        raise HTTPException(400, "Cart is empty")

    # 2) Stok + toplam tutar
    total = Decimal("0.00")
    for ci in cart_items:
        prod = get_product(db, ci.product_id)
        if not prod or not prod.is_visible:
            raise HTTPException(400, f"Product {ci.product_id} unavailable")
        if prod.stock < ci.quantity:
            raise HTTPException(400, f"Insufficient stock for product {prod.id}")
        total += prod.price * ci.quantity

    # 3) Adresi User‑Service’ten getir
    addr = fetch_address(
        body.address_id,
        user_token=current_user.token,
        user_service_url=settings.USER_SERVICE_URL,
    )

    # 4) Siparişi oluştur
    order = create_order(
        db,
        user_id=current_user.user_id,
        total_amount=total,
        status="pending",
    )
    # adres kolonlarını doldur
    order.street       = addr["street"]
    order.city         = addr["city"]
    order.country      = addr["country"]
    order.postal_code  = addr["postal_code"]

    # 5) OrderItem + stok düşümü
    for ci in cart_items:
        prod = get_product(db, ci.product_id)
        prod.stock -= ci.quantity
        create_item(
            db,
            order_id=order.id,
            product_id=ci.product_id,
            quantity=ci.quantity,
            price_at_order=prod.price,
        )
    db.commit()

    # 6) Sepeti temizle
    clear_cart(db, cart)

    db.refresh(order)
    return order
# ───────────────────────── GET /orders ──────────────────────────

from app.schemas.address import AddressOut

from app.schemas.order import OrderOut
from app.schemas.address import AddressOut

def orm_to_order_out(order) -> OrderOut:
    # Eğer ilişkili Address objesi varsa kullan, yoksa None geç
    addr_obj = getattr(order, "address", None)  # relationship varsa
    addr     = AddressOut.model_validate(addr_obj, from_attributes=True) if addr_obj else None

    return OrderOut.model_validate(
        {
            **order.__dict__,
            "items":   order.items,
            "address": addr,          # None veya AddressOut
        },
        from_attributes=True,
    )

# ─────────────────────────  GET /orders  ──────────────────────────
@router.get("/", response_model=list[OrderOut])
def list_my_orders(
    skip: int = 0,
    limit: int = 100,
    current_user = Depends(get_current_active_user),
    db: Session    = Depends(get_db),
):
    orders = list_by_user(db, current_user.user_id, skip, limit)
    return [orm_to_order_out(o) for o in orders]



# ─────────────────────  GET /orders/{id}  ─────────────────────────
@router.get("/{order_id}", response_model=OrderOut)
def get_order_detail(
    order_id: int,
    current_user = Depends(get_current_active_user),
    db: Session    = Depends(get_db),
):
    order = get_order(db, order_id)
    if not order:
        raise HTTPException(404, "Order not found")
    if order.user_id != current_user.user_id:
        raise HTTPException(403, "Forbidden")
    return orm_to_order_out(order)



