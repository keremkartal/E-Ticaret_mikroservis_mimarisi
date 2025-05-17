# user.service/Dockerfile (ve product.service/Dockerfile için benzer şekilde)

# Python'un resmi imajını temel al
FROM python:3.9-slim

# Çalışma dizinini ayarla
WORKDIR /app

# Bağımlılıkları kopyala ve kur
# requirements.txt dosyasının Dockerfile ile aynı dizinde olduğundan emin ol
COPY ./requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

# Uygulama kodunu kopyala
# .dockerignore dosyası kullanarak gereksiz dosyaların kopyalanmasını engelleyebilirsin
COPY ./app /app/app
COPY ./alembic.ini /app/alembic.ini
COPY ./alembic /app/alembic
# user.service için bootstrap_admin.py varsa onu da kopyala
# COPY ./bootstrap_admin.py /app/bootstrap_admin.py

# .env dosyasını docker-compose.yml üzerinden mount edeceğimiz için
# Dockerfile içinde kopyalamaya gerek yok.
# Eğer mount etmek yerine build sırasında kullanmak istersen ARG ve ENV kullanılabilir.

# Uygulamanın çalışacağı port (uvicorn komutundaki port ile aynı olmalı)
EXPOSE 8001
# product.service için 8001 olacak

# Container başladığında çalışacak varsayılan komut
# Bu komut docker-compose.yml dosyasında override edilebilir/edildi.
# CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
