# ----- Build Aşaması -----
# Node.js'in LTS (Long Term Support) versiyonunu temel alıyoruz. Alpine sürümü daha küçüktür.
# 'AS build' ile bu aşamaya bir isim veriyoruz, bu sayede sonraki aşamalarda buradan dosya kopyalayabiliriz.
FROM node:18-alpine AS build

# Uygulama için çalışma dizinini ayarlıyoruz. Sonraki komutlar bu dizin içinde çalışacaktır.
WORKDIR /app

# ÖNEMLİ KONTROL NOKTASI:
# Docker build'ı çalıştırmadan ÖNCE:
# 1. 'react-bootstrap-icons' paketinin 'package.json' dosyanızdaki 'dependencies' bölümünde olduğundan emin olun.
# 2. Lokal makinenizde 'npm install' komutunu çalıştırarak 'package-lock.json' dosyasının
#    'package.json' ile tam olarak senkronize ve güncel olduğundan emin olun.
# 3. Hem 'package.json' hem de güncellenmiş 'package-lock.json' dosyalarını GIT'e commit'leyin.
# Docker build işlemi, bu commit'lenmiş son halleri kullanacaktır.

# Bağımlılıkları yüklemeden önce SADECE package.json ve package-lock.json dosyalarını kopyalıyoruz.
# Bu sayede, sadece bu dosyalar değiştiğinde 'npm ci' adımı tekrar çalışır,
# Docker katman önbelleklemesi daha verimli kullanılır ve build süreleri kısalır.
COPY package.json ./
COPY package-lock.json ./
# Eğer yarn kullanıyorsanız:
# COPY yarn.lock ./

# Bağımlılıkları 'package-lock.json' dosyasına göre KESİNLİKLE ve TEMİZ bir şekilde kurar.
# Bu komut, 'react-bootstrap-icons' dahil tüm bağımlılıkların Docker imajı içinde
# 'node_modules' klasörüne kurulmasını sağlar.
RUN npm ci
# Eğer yarn kullanıyorsanız:
# RUN yarn install --frozen-lockfile

# Proje dosyalarının geri kalanını kopyalıyoruz.
# ÖNEMLİ KONTROL NOKTASI:
# Projenizin ana dizininde bir '.dockerignore' dosyası olduğundan ve bu dosyanın
# 'node_modules' satırını içerdiğinden emin olun. Bu, lokal 'node_modules' klasörünüzün
# Docker imajına kopyalanmasını ve 'npm ci' ile oluşturulanın üzerine yazılmasını engeller.
COPY . .

# React uygulamasını production için build ediyoruz.
# 'npm run build' script'iniz (package.json içinde tanımlı) 'tsc -b && vite build' komutunu çalıştırır.
# Bu adımda TypeScript, 'node_modules' içindeki 'react-bootstrap-icons' modülünü bulabilmelidir.
RUN npm run build

# ----- Sunum Aşaması -----
# Nginx'in hafif bir Alpine tabanlı versiyonunu temel alıyoruz.
FROM nginx:1.25-alpine

# Nginx için özel bir konfigürasyon dosyası kopyalıyoruz.
# Bu genellikle Single Page Application (SPA) yönlendirmelerini (örn: tüm istekleri index.html'e yönlendirme)
# doğru şekilde yapmak için gereklidir.
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Build aşamasında ('build' olarak adlandırdığımız aşama) oluşturulan statik dosyaları
# Nginx'in web içeriğini sunacağı '/usr/share/nginx/html' dizinine kopyalıyoruz.
# Vite, varsayılan olarak çıktılarını '/app/dist' klasörüne yazar (WORKDIR /app olduğu için).
# Eğer vite.config.js dosyanızda 'build.outDir' ayarı farklıysa, buradaki '/app/dist' yolunu güncellemeniz gerekir.
COPY --from=build /app/dist /usr/share/nginx/html

# Nginx'in 80 portunu dışarıya açtığını belirtiyoruz.
EXPOSE 80

# Container başladığında Nginx'i ön planda çalıştıracak komut.
# 'daemon off;' Nginx'in Docker container'ı içinde doğru şekilde çalışmasını sağlar.
CMD ["nginx", "-g", "daemon off;"]
