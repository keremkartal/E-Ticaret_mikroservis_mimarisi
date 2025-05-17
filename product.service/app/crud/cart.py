# # app/crud/cart.py
# from sqlalchemy.orm import Session
# from app.models.cart import Cart
# from app.models.cart_item import CartItem

# # ─────────────────────────────────────────
# # CRUD Fonksiyonları for Cart
# # ─────────────────────────────────────────

# def get_cart_by_user(db: Session, user_id: int) -> Cart | None:
#     """
#     Return the cart instance for the given user_id if it exists, otherwise None.
#     """
#     return db.query(Cart).filter(Cart.user_id == user_id).first()


# def create_cart(db: Session, user_id: int) -> Cart:
#     """
#     Create a new Cart for the specified user_id and return the Cart instance.
#     """
#     db_obj = Cart(user_id=user_id)
#     db.add(db_obj)
#     db.commit()
#     db.refresh(db_obj)
#     return db_obj


# def get_or_create_cart(db: Session, user_id: int) -> Cart:
#     """
#     Retrieve the existing Cart for user_id, or create a new one if not present.
#     """
#     cart = get_cart_by_user(db, user_id)
#     if not cart:
#         cart = create_cart(db, user_id)
#     return cart


# def clear_cart(db: Session, cart: Cart) -> None:
#     """
#     Delete all CartItem entries associated with the given Cart.
#     """
#     # Iterate through items to delete due to cascade configuration
#     for item in list(cart.items):
#         db.delete(item)
#     db.commit()
#     db.refresh(cart)
#     return

# product.service/app/crud/cart.py

from sqlalchemy.orm import Session
from typing import Optional # Optional import edildiğinden emin olun

# app.models.cart modülünden Cart modelini import ettiğinizi varsayıyoruz
# Eğer Cart modeli farklı bir yoldaysa, lütfen bu importu güncelleyin.
from app.models.cart import Cart
from app.models.cart_item import CartItem # CartItem da kullanılıyor olabilir (clear_cart içinde)

# ─────────────────────────────────────────
# CRUD Fonksiyonları for Cart
# ─────────────────────────────────────────

def get_cart_by_user(db: Session, user_id: int) -> Optional[Cart]: # DEĞİŞİKLİK: Cart | None -> Optional[Cart]
    """
    Return the cart instance for the given user_id if it exists, otherwise None.
    """
    return db.query(Cart).filter(Cart.user_id == user_id).first()


def create_cart(db: Session, user_id: int) -> Cart:
    """
    Create a new Cart for the specified user_id and return the Cart instance.
    """
    db_obj = Cart(user_id=user_id)
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj


def get_or_create_cart(db: Session, user_id: int) -> Cart:
    """
    Retrieve the existing Cart for user_id, or create a new one if not present.
    """
    cart = get_cart_by_user(db, user_id)
    if not cart:
        cart = create_cart(db, user_id)
    return cart


def clear_cart(db: Session, cart: Cart) -> None: # Dönüş tipi None ise belirtmek isteğe bağlıdır
    """
    Delete all CartItem entries associated with the given Cart.
    SQLAlchemy cascade ayarlarınıza bağlı olarak, bu işlem CartItem'ları da silebilir.
    Eğer cascade yoksa, CartItem'ları manuel olarak silmeniz gerekir.
    Mevcut kodunuzda 'list(cart.items)' kullanıldığı için 'items' ilişkisinin
    Cart modelinde tanımlı olduğunu ve CartItem'ları içerdiğini varsayıyorum.
    """
    # Eğer cart.items ilişkisi cascade delete yapmıyorsa,
    # ve CartItem'ları doğrudan silmek istiyorsanız:
    # db.query(CartItem).filter(CartItem.cart_id == cart.id).delete()
    # Ancak, mevcut kodunuzdaki gibi iterate etmek ve tek tek silmek de bir yöntemdir,
    # özellikle ORM event'lerini tetiklemek istiyorsanız.
    
    if cart.items: # Eğer sepetin item'ları varsa
        for item in list(cart.items): # cart.items'ın kopyası üzerinde iterate et (silme sırasında modifikasyondan kaçınmak için)
            db.delete(item)
    # Sadece CartItem'lar silindikten sonra commit yapın.
    # Eğer Cart objesinin kendisini silmek istemiyorsanız, db.delete(cart) yapmayın.
    db.commit()
    # db.refresh(cart) # Cart objesi silinmediği için refresh edilebilir.
    return # Açıkça None döndürmek için veya sadece return
