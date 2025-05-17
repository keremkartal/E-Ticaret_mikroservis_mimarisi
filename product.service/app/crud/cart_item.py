
# # product.service/app/crud/cart_item.py

# from sqlalchemy.orm import Session
# from app.models.cart import Cart      # Seviyenize göre import yollarını kontrol edin
# from fastapi import HTTPException

# # app/crud/cart_item.py
# from sqlalchemy.orm import Session
# from app.models.cart_item import CartItem
# from app.crud.cart import get_or_create_cart
# from app.models.product import Product
# from app.models.cart import Cart           # ← Bunları ekleyin

# # ─────────────────────────────────────────
# # CRUD Fonksiyonları for CartItem
# # ─────────────────────────────────────────

# def get_item(db: Session, cart_id: int, product_id: int) -> CartItem | None:
#     """
#     Return a single CartItem for the given cart_id and product_id, or None if not found.
#     """
#     return (
#         db.query(CartItem)
#         .filter(
#             CartItem.cart_id == cart_id,
#             CartItem.product_id == product_id
#         )
#         .first()
#     )


# def list_items(db: Session, cart_id: int) -> list[CartItem]:
#     """
#     List all CartItem entries for the specified cart_id.
#     """
#     return db.query(CartItem).filter(CartItem.cart_id == cart_id).all()

# # app/crud/cart_item.py

# def add_item(db: Session, cart: Cart, product_id: int, quantity: int) -> Cart:
#     """
#     Var olan satırı günceller veya yeni CartItem ekler.
#     """
#     # 1) Sepette bu ürün var mı?
#     item = (
#         db.query(CartItem)
#           .filter(CartItem.cart_id == cart.id,
#                   CartItem.product_id == product_id)
#           .first()
#     )
#     if item:
#         item.quantity += quantity
#     else:
#         item = CartItem(cart_id=cart.id, product_id=product_id, quantity=quantity)
#         db.add(item)

#     db.commit()
#     db.refresh(cart)        # cart.items listesini güncelle
#     return cart



# def update_item(
#     db: Session,
#     cart: Cart,           # Artık user_id değil, doğrudan Cart nesnesi
#     product_id: int,
#     quantity: int
# ) -> Cart:
#     """
#     Sepetteki bir CartItem'ın miktarını günceller.
#     Eğer öğe yoksa 404 fırlatır.
#     """
#     # 1) Sepet öğesini çek
#     item = (
#         db.query(CartItem)
#           .filter(
#              CartItem.cart_id    == cart.id,
#              CartItem.product_id == product_id
#           )
#           .first()
#     )
#     if not item:
#         # Sepette o ürün yoksa
#         raise HTTPException(status_code=404, detail="Item not found in cart")

#     # 2) Miktarı güncelle
#     item.quantity = quantity

#     # 3) Commit & refresh
#     db.commit()
#     db.refresh(cart)   # cart.items listesini yeniler

#     # 4) Güncel Cart objesini dön
#     return cart


# def remove_item(db: Session, cart: Cart, product_id: int) -> bool:
   
#     # 1) Sepet öğesini bul
#     item = (
#         db.query(CartItem)
#           .filter(
#               CartItem.cart_id    == cart.id,
#               CartItem.product_id == product_id
#           )
#           .first()
#     )
#     if not item:
#         return False

#     # 2) Sil, commit
#     db.delete(item)
#     db.commit()
#     return True



# def clear_cart_items(db: Session, user_id: int) -> None:
#     """
#     Remove all CartItem entries for the user's cart in a single operation.
#     """
#     cart = get_or_create_cart(db, user_id)
#     # Bulk delete for efficiency
#     db.query(CartItem).filter(CartItem.cart_id == cart.id).delete(synchronize_session=False)
#     db.commit()
#     return
# product.service/app/crud/cart_item.py

from sqlalchemy.orm import Session
from typing import Optional, List # Optional ve List import edildiğinden emin olun

# app.models.cart_item modülünden CartItem modelini import ettiğinizi varsayıyoruz
from app.models.cart_item import CartItem
# app.models.cart modülünden Cart modelini import ettiğinizi varsayıyoruz
from app.models.cart import Cart
# app.crud.cart modülünden get_or_create_cart fonksiyonunu import ettiğinizi varsayıyoruz
# Bu import, dosyanın başında zaten vardı, ancak kullanılmıyorsa kaldırılabilir.
# from app.crud.cart import get_or_create_cart
# app.models.product import Product # Bu import, bu dosyada doğrudan kullanılmıyor gibi görünüyor.

from fastapi import HTTPException # HTTPException, update_item içinde kullanılıyor

# ─────────────────────────────────────────
# CRUD Fonksiyonları for CartItem
# ─────────────────────────────────────────

def get_item(db: Session, cart_id: int, product_id: int) -> Optional[CartItem]: # DEĞİŞİKLİK: CartItem | None -> Optional[CartItem]
    """
    Return a single CartItem for the given cart_id and product_id, or None if not found.
    """
    return (
        db.query(CartItem)
        .filter(
            CartItem.cart_id == cart_id,
            CartItem.product_id == product_id
        )
        .first()
    )


def list_items(db: Session, cart_id: int) -> List[CartItem]: # DEĞİŞİKLİK: list[CartItem] -> List[CartItem]
    """
    List all CartItem entries for the specified cart_id.
    """
    return db.query(CartItem).filter(CartItem.cart_id == cart_id).all()


def add_item(db: Session, cart: Cart, product_id: int, quantity: int) -> Cart:
    """
    Var olan satırı günceller veya yeni CartItem ekler.
    Güncellenmiş Cart nesnesini döndürür.
    """
    # Sepette bu ürün var mı kontrol et
    item = get_item(db, cart_id=cart.id, product_id=product_id) # get_item fonksiyonunu kullan

    if item:
        # Eğer ürün sepette varsa ve quantity > 0 ise miktarını artır
        # Eğer quantity <= 0 ise, bu durum farklı ele alınabilir (örn: hata fırlatmak veya item'ı silmek)
        # Şimdilik sadece pozitif quantity eklemesi varsayılıyor.
        if quantity > 0:
            item.quantity += quantity
        # Eğer gelen quantity 0 veya negatifse, mevcut item'ı silmek veya hata vermek daha mantıklı olabilir.
        # Bu kısım projenizin iş mantığına göre ayarlanmalı.
        # else if quantity == 0:
        #     db.delete(item) # Örnek: Miktar 0 ise sil
        # else: # quantity < 0
        #     raise ValueError("Quantity to add must be positive.")
    else:
        # Eğer ürün sepette yoksa ve quantity > 0 ise yeni bir item oluştur
        if quantity > 0:
            item = CartItem(cart_id=cart.id, product_id=product_id, quantity=quantity)
            db.add(item)
        # else: # quantity <= 0
            # raise ValueError("Cannot add a new item with zero or negative quantity.")


    db.commit()
    db.refresh(cart) # cart.items listesini (eğer varsa ve yüklendiyse) güncellemek için
                     # ve cart objesinin kendisindeki potansiyel değişiklikler için (örn: total_price)
    return cart


def update_item(
    db: Session,
    cart: Cart,
    product_id: int,
    quantity: int
) -> Cart:
    """
    Sepetteki bir CartItem'ın miktarını günceller.
    Eğer öğe yoksa 404 HTTPException fırlatır.
    Eğer miktar 0 veya daha az ise öğeyi siler.
    Güncellenmiş Cart nesnesini döndürür.
    """
    item = get_item(db, cart_id=cart.id, product_id=product_id) # get_item fonksiyonunu kullan

    if not item:
        # Sepette o ürün yoksa
        raise HTTPException(status_code=404, detail="Item not found in cart")

    if quantity > 0:
        item.quantity = quantity
    else:
        # Miktar 0 veya daha az ise, öğeyi sepetten kaldır
        db.delete(item)

    db.commit()
    db.refresh(cart) # cart.items listesini ve cart objesini yeniler
    return cart


def remove_item(db: Session, cart: Cart, product_id: int) -> bool:
    """
    Sepetten belirli bir ürünü (CartItem) kaldırır.
    Başarılı olursa True, öğe bulunamazsa False döner.
    """
    item = get_item(db, cart_id=cart.id, product_id=product_id) # get_item fonksiyonunu kullan

    if not item:
        return False # Öğe bulunamadı

    db.delete(item)
    db.commit()
    # db.refresh(cart) # İsteğe bağlı, eğer cart objesinin güncel halini hemen görmek isterseniz
    return True


# Bu fonksiyon, product.service/app/crud/cart.py içindeki clear_cart ile benzer işlevi görüyor.
# Projenizde hangisinin kullanılacağına karar vermeniz ve tutarlılığı sağlamanız önemlidir.
# Eğer bu fonksiyon kullanılacaksa, get_or_create_cart importu gereklidir.
# from app.crud.cart import get_or_create_cart # Eğer bu fonksiyon aktif edilecekse

def clear_cart_items(db: Session, user_id: int) -> None: # Dönüş tipi None ise belirtmek isteğe bağlıdır
    """
    Remove all CartItem entries for the user's cart in a single operation.
    Bu fonksiyon, önce kullanıcının sepetini bulur (veya oluşturur),
    ardından o sepete ait tüm CartItem'ları siler.
    """
    # get_or_create_cart fonksiyonunun crud.cart içinde olduğunu varsayıyoruz.
    # Eğer bu fonksiyon burada kullanılacaksa, yukarıdaki importu aktif edin.
    # Şimdilik, bu fonksiyonun çağrıldığı yerde cart objesinin zaten elde edildiği
    # veya user_id ile doğrudan CartItem'ların hedeflendiği varsayılabilir.
    # Eğer sadece user_id ile CartItem'lar silinecekse:
    # user_cart = db.query(Cart).filter(Cart.user_id == user_id).first()
    # if user_cart:
    #     db.query(CartItem).filter(CartItem.cart_id == user_cart.id).delete(synchronize_session=False)
    #     db.commit()

    # Mevcut implementasyon, get_or_create_cart'a bağlı. Eğer bu fonksiyon
    # bu dosyada kalacaksa ve kullanılacaksa, get_or_create_cart importu gereklidir.
    # Şimdilik, bu fonksiyonun crud/cart.py içindeki clear_cart ile çakışmaması için
    # farklı bir isim veya yaklaşım düşünülebilir.
    # Veya sadece bir tanesi kullanılmalıdır.
    
    # Örnek olarak, sadece user_id ile ilişkili CartItem'ları silmek için:
    user_cart = db.query(Cart).filter(Cart.user_id == user_id).first()
    if user_cart:
        # Bulk delete for efficiency
        db.query(CartItem).filter(CartItem.cart_id == user_cart.id).delete(synchronize_session=False)
        db.commit()
    return
