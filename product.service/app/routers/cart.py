# app/routers/cart.py
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.deps import get_current_active_user
from app.crud.cart import get_or_create_cart, clear_cart
from app.crud.cart_item import add_item, update_item, remove_item, list_items
from app.crud.product import get as get_product
from app.schemas.cart import CartOut, CartItemCreate, CartItemUpdate

router = APIRouter(prefix="/cart", tags=["Cart"])

@router.get("/", response_model=CartOut)
def read_cart(
    current_user = Depends(get_current_active_user),
    db: Session    = Depends(get_db),
):
    """
    Giriş yapmış kullanıcının sepetini getirir.
    Eğer yoksa yeni bir sepet oluşturur.
    """
    cart = get_or_create_cart(db, current_user.user_id)
    return cart

@router.post(
    "/items",
    response_model=CartOut,
    status_code=status.HTTP_201_CREATED,
)
def add_to_cart(
    item_in :CartItemCreate,# or: item_in: CartItemCreate
    current_user = Depends(get_current_active_user),
    db: Session    = Depends(get_db),
):
    """
    Sepete ürün ekler. 
    Stok ve ürün varlığı kontrolü yapılır.
    """
    # Ürün kontrolü
    product = get_product(db, item_in.product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    if product.stock < item_in.quantity:
        raise HTTPException(status_code=400, detail="Insufficient stock")

    cart = get_or_create_cart(db, current_user.user_id)
    updated = add_item(db, cart, item_in.product_id, item_in.quantity)
    return updated



@router.put("/items/{product_id}", response_model=CartOut)
def update_cart_item(
    product_id: int,
    item_up: CartItemUpdate,
    current_user = Depends(get_current_active_user),
    db: Session    = Depends(get_db),
):
    """
    Sepetteki ürün miktarını günceller.
    Stok ve varlık kontrolü yapılır.
    """
    # Ürün kontrolü
    product = get_product(db, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    if product.stock < item_up.quantity:
        raise HTTPException(status_code=400, detail="Insufficient stock")

    cart = get_or_create_cart(db, current_user.user_id)
    updated = update_item(db, cart, product_id, item_up.quantity)
    return updated



@router.delete("/items/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_cart_item(
    product_id: int,
    current_user = Depends(get_current_active_user),
    db: Session    = Depends(get_db),
):
    """
    Sepetten belirli bir ürünü kaldırır.
    """
    cart = get_or_create_cart(db, current_user.user_id)
    success = remove_item(db, cart, product_id)
    if not success:
        raise HTTPException(status_code=404, detail="Item not found in cart")
    return None


@router.delete("/", status_code=status.HTTP_204_NO_CONTENT)
def clear_user_cart(
    current_user = Depends(get_current_active_user),
    db: Session    = Depends(get_db),
):
    """
    Kullanıcının sepetini tamamen temizler.
    """
    cart = get_or_create_cart(db, current_user.user_id)
    clear_cart(db, cart)
    return None