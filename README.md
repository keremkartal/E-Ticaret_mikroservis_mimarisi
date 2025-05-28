# E-Ticaret Mikroservis Projesi

Bu proje, Python (FastAPI) kullanılarak geliştirilmiş backend mikroservisleri (Kullanıcı Servisi ve Ürün Servisi) ile React ve TypeScript kullanılarak geliştirilmiş bir frontend arayüzünden oluşan kapsamlı bir e-ticaret platformudur. Uygulama, Docker ve Docker Compose kullanılarak containerize edilmiştir ve modern e-ticaret işlevlerini mikroservis mimarisi prensiplerine uygun olarak sunmayı hedefler.

## Projeye Genel Bakış

Bu platform, aşağıdaki temel özellikleri içerir:

* **Kapsamlı Kullanıcı Yönetimi:** Güvenli kayıt, giriş/çıkış işlemleri, detaylı profil yönetimi, adres ve iletişim bilgileri kaydı.
* **Gelişmiş Kimlik Doğrulama ve Yetkilendirme:** JWT (JSON Web Token) tabanlı kimlik doğrulama ve rol/izin bazlı yetkilendirme mekanizmaları.
* **Güvenli Şifre Yönetimi:** Endüstri standardı hashleme teknikleriyle şifre saklama, kullanıcı tarafından şifre değiştirme, "şifremi unuttum" akışı ve admin tarafından şifre sıfırlama.
* **Detaylı Ürün Yönetimi:** Ürünlerin listelenmesi, ürün detaylarının görüntülenmesi, kategori bazlı filtreleme (geliştirilebilir), admin tarafından ürün ekleme, mevcut ürünleri güncelleme ve ürünleri görünürlükten kaldırma (soft delete).
* **Kategori Yönetimi:** Admin paneli üzerinden ürün kategorileri oluşturma, güncelleme ve silme.
* **Alışveriş Sepeti İşlevselliği:** Kullanıcıların sepetlerine ürün eklemesi, sepetteki ürünlerin miktarını güncellemesi, sepetten ürün çıkarması ve sepeti görüntüleyip tamamen temizlemesi.
* **Sipariş Süreçleri:** Kullanıcıların sepetlerindeki ürünleri kullanarak sipariş oluşturması ve kendi sipariş geçmişlerini görüntüleyebilmesi.
* **Admin Paneli Fonksiyonları:** Kullanıcıların, ürünlerin, kategorilerin ve roller ile izinlerin merkezi olarak yönetilmesi.

##  Proje Yapısı

Proje, modüler bir yaklaşımla aşağıdaki ana klasörlerden oluşmaktadır:

* **`user.service/`**: Kullanıcı kaydı, girişi, kimlik doğrulama, yetkilendirme, profil, adres ve iletişim bilgileri gibi kullanıcı odaklı tüm işlemleri yöneten FastAPI tabanlı mikroservis.
* **`product.service/`**: Ürünler, kategoriler, alışveriş sepeti ve siparişlerle ilgili tüm e-ticaret fonksiyonlarını yöneten FastAPI tabanlı mikroservis.
* **`frontend/`**: React ve TypeScript kullanılarak geliştirilmiş, kullanıcı dostu ve interaktif web arayüzü.
* **`docker-compose.yml`**: Tüm servislerin (backend API'leri, frontend uygulaması ve PostgreSQL veritabanları) Docker container'ları olarak tanımlandığı, yapılandırıldığı ve yönetildiği ana yapılandırma dosyası. 
* Her servis kendi `Dockerfile` dosyasına sahiptir, bu da servislerin bağımsız olarak build edilmesini ve containerize edilmesini sağlar.

##  Kurulum ve Çalıştırma Adımları

Bu bölüm, projeyi yerel geliştirme ortamınızda kurmak ve çalıştırmak için izlemeniz gereken adımları detaylı bir şekilde açıklamaktadır.

### 1. Proje Dosyalarının Alınması (Klonlama)

1.  Bilgisayarınızda projeyi saklamak istediğiniz uygun bir ana dizin seçin (örneğin, `Belgelerim/Projelerim` veya `~/projects`). 
2.  Seçtiğiniz dizine gitmek için bir terminal veya komut istemcisi açın.
3.  Aşağıdaki `git clone` komutunu kullanarak projenin GitHub reposundaki en güncel kaynak kodlarını bilgisayarınıza indirin: 
    ```bash
    git clone https://github.com/keremkartal/E-Ticaret_mikroservis_mimarisi.git
    ```
4.  Klonlama işlemi tamamlandığında, proje dosyalarını içeren `E-Ticaret_mikroservis_mimarisi` adında bir klasör oluşacaktır.Bu klasörün içine girin:
    ```bash
    cd E-Ticaret_mikroservis_mimarisi
    ```
    Bundan sonraki tüm komutlar, bu ana proje dizininden (`E-Ticaret_mikroservis_mimarisi/`) çalıştırılacaktır. 

### 2\. Docker Servislerinin Başlatılması

Projenin ana dizininde (`E-Ticaret_mikroservis_mimarisi/`) aşağıdaki komutu çalıştırarak tüm servisleri oluşturun ve başlatın: 

```bash
docker-compose up --build -d
```

  * `--build`: İmajları yeniden oluşturur (ilk çalıştırmada veya değişikliklerde gereklidir).
  * `-d`: Servisleri arka planda (detached mode) başlatır.

Bu işlem, özellikle ilk çalıştırmada imajların indirilmesi ve build edilmesi nedeniyle birkaç dakika sürebilir.

### 3\. İlk Kurulum ve Veritabanı Hazırlığı (Otomatik İşlemler)

`docker-compose up --build -d` komutu çalıştıktan sonra: 

  * PostgreSQL veritabanları (`user_db`, `product_db`) otomatik olarak oluşturulur. 
  * `user.service` başlatılırken, `entrypoint.sh` betiği aracılığıyla Alembic veritabanı migration'ları uygulanır ve varsayılan bir admin kullanıcısı (`username: admin`, `password: Admin123!`) oluşturulur. 
  * `product.service` (eğer `entrypoint.sh` ile Alembic migration'ları tanımlandıysa) ve `frontend` servisleri de başlatılır. 

Servislerin durumunu ve loglarını kontrol etmek için: 

```bash
docker-compose ps                 # Çalışan servisleri listeler 
docker-compose logs user_service  # User service logları 
docker-compose logs product_service # Product service logları
docker-compose logs frontend      # Frontend service logları 
```

Loglarda servislerin başarıyla başladığına dair mesajlar görmelisiniz (örn: "Uvicorn running on [şüpheli bağlantı kaldırıldı]").

### 4\. Uygulamaya Erişim

Tüm servisler başarıyla başladıktan sonra uygulamaya aşağıdaki varsayılan adreslerden erişebilirsiniz:

  * **Frontend (React Uygulaması):** `http://localhost:5173` 
  * **User Service API Dokümantasyonu (Swagger):** `http://localhost:8000/docs` 
  * **Product Service API Dokümantasyonu (Swagger):** `http://localhost:8001/docs` 

Varsayılan admin kullanıcı bilgileri ile giriş yapabilirsiniz: 

  * Kullanıcı Adı: `admin`
  * Şifre: `Admin123!`

### 5\. Servisleri Durdurma

Çalışan tüm Docker servislerini durdurmak için projenin ana dizininde aşağıdaki komutu çalıştırın: 

```bash
docker-compose down
```

Eğer veritabanı verilerini içeren volume'leri de tamamen kaldırarak sistemi sıfırlamak isterseniz (dikkatli olun, bu işlem veritabanındaki tüm verileri siler): 

```bash
docker-compose down --volumes
```
##  API Endpoint Listesi

Projenin backend servisleri tarafından sunulan API endpoint'lerinin detaylı listesi ve açıklamaları için lütfen servislerin Swagger dokümantasyonlarına başvurun:

  * **User Service Swagger UI:** [`http://localhost:8000/docs`](https://www.google.com/search?q=http://localhost:8000/docs) 
  * **Product Service Swagger UI:** [`http://localhost:8001/docs`](https://www.google.com/search?q=http://localhost:8001/docs) 

Bu arayüzler üzerinden tüm endpoint'leri interaktif olarak test edebilir ve detaylı istek/yanıt şemalarını inceleyebilirsiniz.

