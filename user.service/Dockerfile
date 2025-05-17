# user.service/Dockerfile

FROM python:3.9-slim

WORKDIR /app

# Önce bağımlılıkları kur (Docker katman önbelleğinden faydalanmak için)
COPY ./requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

# Uygulama kodunu, Alembic yapılandırmasını ve scriptleri kopyala
COPY ./app /app/app
COPY ./alembic.ini /app/alembic.ini
COPY ./alembic /app/alembic  
COPY ./bootstrap_admin.py /app/bootstrap_admin.py
COPY ./entrypoint.sh /app/entrypoint.sh

# alembic/versions klasörünün var olduğundan emin ol (boş bile olsa)
# Bu, --autogenerate'in sorunsuz çalışmasına yardımcı olabilir.
RUN mkdir -p /app/alembic/versions

# ---- YENİ ADIM: İMAJ OLUŞTURULURKEN İLK MIGRATION'I OLUŞTUR ----
# Bu komut, modellerde değişiklik varsa bir migration dosyası oluşturur.
# Eğer veritabanı bağlantısı gerektiriyorsa, bu adım build sırasında sorun çıkarabilir.
# Bu durumda, bu adımı atlayıp migration dosyasını manuel olarak versions klasörüne ekleyip
# imaja kopyalamak daha iyi bir seçenek olabilir. Şimdilik deneyelim.
#
# ÖNEMLİ NOT: Eğer bu adım "could not connect to server" gibi bir hata verirse,
# bunun nedeni build sırasında veritabanının çalışmıyor olmasıdır.
# Bu durumda, bu RUN komutunu kaldırın ve bir sonraki adıma (Adım 2.2) geçin.
#
# RUN alembic revision --autogenerate -m "initial_tables_from_dockerfile"
# --------------------------------------------------------------------

RUN chmod +x /app/entrypoint.sh

EXPOSE 8000

# entrypoint.sh, container başladığında alembic upgrade head'i çalıştıracak
CMD ["/app/entrypoint.sh"]
