# product.service/app/main.py

from fastapi import FastAPI
from app.routers.products import router as products_router
from app.routers.categories import router as categories_router  
from app.routers.cart import router as   carts_router
from app.routers.orders import router as   orders_router
from app.db.base import Base
from app.db.session import engine

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
Base.metadata.create_all(bind=engine)

app = FastAPI(title="User Service")
origins = [
    "http://localhost:5173",   # React geliştirme sunucun
    "http://127.0.0.1:5173",
    # prod ortam için kendi domainlerini de ekle
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,            # izin verilen kaynaklar
    allow_credentials=True,           # cookie/header izinleri
    allow_methods=["*"],              # izin verilen HTTP metotları
    allow_headers=["*"],              # izin verilen header’lar
)
app.include_router(products_router)
app.include_router(categories_router) 
app.include_router(carts_router) 
app.include_router(orders_router)