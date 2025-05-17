# app/db/base.py

from sqlalchemy.orm import declarative_base

# Tüm modeller bu Base’e kayıt olacak,
# Alembic de buradan metadata’yı alacak.
Base = declarative_base()
