# product.service/alembic/env.py
import os
import sys
from logging.config import fileConfig

from sqlalchemy import engine_from_config
from sqlalchemy import pool

from alembic import context

# 1) Proje klasörünü (product.service) Python path’e ekle
# Bu, `from app.core.config import settings` gibi importların çalışmasını sağlar
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.append(PROJECT_ROOT)

# 2) Ortam değişkenlerini ve modelleri Pydantic ayarları ve Base üzerinden yükle
from app.core.config import settings # app/core/config.py içindeki settings (Pydantic BaseSettings)
                                     # Bu, product.service/.env dosyasını yükler.
from app.db.base import Base         # app/db/base.py içindeki Base'i import et
import app.models                    # app/models/__init__.py (veya içindeki tüm model dosyaları) import edilerek
                                     # modellerin Base.metadata'ya kaydedilmesi sağlanır.

# Alembic config objesi
config = context.config

# alembic.ini dosyasındaki logging ayarlarını yükle
# Bu satırın bir kere çağrılması yeterlidir.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)
# Not: Kodunuzda iki tane fileConfig çağrısı vardı, biri kaldırıldı.

# 3) target_metadata’i modellerinizin metadata’sı yapın
# SQLAlchemy Base üzerinden tüm modellerin bilgisini Alembic'e ver
target_metadata = Base.metadata

# 4) sqlalchemy.url’i .env’den (Pydantic settings aracılığıyla) gelen PRODUCT_DATABASE_URL ile değiştirin
# Bu, alembic.ini dosyasındaki sqlalchemy.url değerini override eder.
# settings.PRODUCT_DATABASE_URL Pydantic tarafından string'e çevrilmiş olmalı,
# emin olmak için str() kullanılabilir ama genellikle Pydantic bunu halleder.
db_url = str(settings.PRODUCT_DATABASE_URL)
if not db_url:
    raise RuntimeError("PRODUCT_DATABASE_URL .env dosyasında eksik veya Pydantic ayarlarından yüklenemedi.")
config.set_main_option("sqlalchemy.url", db_url)


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode.
    """
    # Offline modda kullanılacak URL'yi Pydantic settings'den alınan db_url olarak ayarla
    # config.get_main_option("sqlalchemy.url") yerine doğrudan db_url kullanmak daha direkt.
    context.configure(
        url=db_url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode.
    """
    # config.set_main_option ile "sqlalchemy.url" zaten ayarlandığı için
    # engine_from_config bu ayarı kullanacaktır.
    connectable = engine_from_config(
        config.get_section(config.config_ini_section), # sqlalchemy.url'yi buradan okur
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
        # URL'yi burada tekrar override etmek isterseniz:
        # url=db_url # Bu satır eklenebilir ama set_main_option yeterli olmalı.
    )

    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
