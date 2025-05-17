from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings


engine = create_engine(
    str(settings.PRODUCT_DATABASE_URL),  # <-- burada str() ekledik
    pool_pre_ping=True,
)
SessionLocal = sessionmaker(
     autocommit=False,
     autoflush=False,
     expire_on_commit=False,
     bind=engine
 )
def get_db():
    db=SessionLocal()
    try:
        yield db
    finally:
        db.close()

    