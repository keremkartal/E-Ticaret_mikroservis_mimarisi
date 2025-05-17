# user.service/app/core/config.py

from pydantic_settings import BaseSettings
from typing import Optional # Optional kullanmak için import ettik

class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # .env dosyasından okunacak yeni alan
    # Eğer bu değer her zaman olmak zorunda değilse Optional[str] = None kullanabilirsiniz.
    # Şimdilik zorunlu bir alan olarak ekliyorum.
    USER_SERVICE_INTERNAL_URL: str

    class Config:
        env_file = ".env"
        # Pydantic v2'de env_file_encoding varsayılan olarak utf-8'dir,
        # bu satır isteğe bağlıdır.
        # env_file_encoding = "utf-8"

        # Eğer .env dosyasında modelde olmayan ekstra alanlara izin vermek isterseniz:
        # extra = "ignore"
        # Ancak genellikle tanımlı alanların olması daha güvenlidir.

settings = Settings()
