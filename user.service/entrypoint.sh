#!/bin/sh

# Betik içinde herhangi bir komut başarısız olursa hemen çık
set -e

echo "Running Alembic migrations for user_service..."
# Alembic migration'larını uygula
# Bu komut, user.service/.env dosyasındaki DATABASE_URL'i kullanarak
# (alembic/env.py üzerinden) veritabanına bağlanır.
# DATABASE_URL'in 'user_db:5432' şeklinde Docker network'üne uygun olması gerekir.
alembic upgrade head

echo "Running admin bootstrap script for user_service..."
# Admin kullanıcısını veya başlangıç verilerini oluşturan Python script'ini çalıştır
# Bu script de user.service/.env dosyasındaki DATABASE_URL'i kullanır.
python bootstrap_admin.py

echo "Starting Uvicorn server for user_service..."
# Ana FastAPI uygulamasını Uvicorn ile başlat (exec OLMADAN)
# Bu, entrypoint.sh script'inin Uvicorn çalışırken aktif kalmasını sağlar
# ve 'docker-compose exec' komutlarının çalışmasına izin verir.
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
