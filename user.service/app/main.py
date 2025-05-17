

from fastapi import FastAPI
from app.db.base import Base
from app.db.session import engine
from app.routers import (
    auth, authz, user,
    address, contact,
    roles, permissions
)
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

app.include_router(auth.router)
app.include_router(authz.router)
app.include_router(user.router)
app.include_router(address.router)
app.include_router(contact.router)
app.include_router(roles.router)
app.include_router(permissions.router)
