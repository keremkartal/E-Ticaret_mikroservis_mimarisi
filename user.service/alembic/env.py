# user.service/alembic/env.py
# --------------------------------------------------------------
#  Alembic env.py  ––  user.service
# --------------------------------------------------------------
from __future__ import annotations      # <-- ❶ Her şeyden önce!
import os
import sys
from pathlib import Path
from logging.config import fileConfig
from alembic import context
from sqlalchemy import engine_from_config, pool
from dotenv import load_dotenv  # .env dosyasını yüklemek için
# --------------------------------------------------------------
# 1)  Proje kökünü ve .env'i yükle
# __file__ -> user.service/alembic/env.py
# .parent -> user.service/alembic
# .parent.parent -> user.service/
BASE_DIR = Path(__file__).resolve().parent.parent
# user.service/.env dosyasını yükler
load_dotenv(BASE_DIR / ".env")

# PYTHONPATH'e user.service/ klasörünü ekle
# Bu, `import app.db.base` gibi importların çalışmasını sağlar
sys.path.insert(0, str(BASE_DIR))
# --------------------------------------------------------------
# 2)  Alembic config
config = context.config

# alembic.ini dosyasındaki logging ayarlarını yükle
if config.config_file_name is not None:
    fileConfig(config.config_file_name)
# --------------------------------------------------------------
# 3)  Modelleri import et
# SQLAlchemy Base ve modellerin Alembic tarafından bulunabilmesi için
from app.db.base import Base  # app/db/base.py içindeki Base'i import et
import app.models  # app/models/__init__.py (veya içindeki tüm model dosyaları) import edilerek
                   # modellerin Base.metadata'ya kaydedilmesi sağlanır.

# Modellerin metadata'sını Alembic'e hedef olarak göster
target_metadata = Base.metadata
# --------------------------------------------------------------
# 4)  Veritabanı URL'sini .env dosyasından al
# load_dotenv ile yüklenen .env dosyasındaki DATABASE_URL değişkeni
database_url = os.getenv("DATABASE_URL")

# ----- DEBUG SATIRI BAŞLANGICI -----
print(f"DEBUG [alembic/env.py]: Kullanılan DATABASE_URL = '{database_url}'")
# ----- DEBUG SATIRI SONU -----
if not database_url:
    # .env dosyasında DATABASE_URL yoksa veya boşsa hata fırlat
    raise RuntimeError("DATABASE_URL .env dosyasında eksik veya tanımsız.")

# Alembic konfigürasyonunda sqlalchemy.url'yi .env'den gelen değerle ayarla
# Bu, alembic.ini dosyasındaki sqlalchemy.url değerini override eder (eğer varsa)
config.set_main_option("sqlalchemy.url", database_url)
# --------------------------------------------------------------

def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode.

    This configures the context with just a URL
    and not an Engine, though an Engine is acceptable
    here as well.  By skipping the Engine creation
    we don't even need a DBAPI to be available.

    Calls to context.execute() here emit the given string to the
    script output.

    """
    # Offline modda kullanılacak URL'yi .env'den alınan database_url olarak ayarla
    context.configure(
        url=database_url, # Doğrudan database_url değişkenini kullanmak daha net
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode.

    In this scenario we need to create an Engine
    and associate a connection with the context.

    """
    # config.get_section ile alembic.ini'deki [alembic] section'ını alır.
    # config.set_main_option ile "sqlalchemy.url" zaten ayarlandığı için
    # engine_from_config bu ayarı kullanacaktır.
    # Eğer section içinde ayrıca sqlalchemy.url set etmek isterseniz:
    # section = config.get_section(config.config_ini_section)
    # section['sqlalchemy.url'] = database_url # Bu satır eklenebilir, ama set_main_option yeterli olmalı.

    connectable = engine_from_config(
        config.get_section(config.config_ini_section), # sqlalchemy.url'yi buradan okur
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)

        with context.begin_transaction():
            context.run_migrations()

# --------------------------------------------------------------
if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()