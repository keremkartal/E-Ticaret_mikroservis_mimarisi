# FRONTEND/Dockerfile

# ----- Build Aşaması -----
# Node.js'in LTS (Long Term Support) versiyonunu temel alıyoruz.
# 'AS build' ile bu aşamaya bir isim veriyoruz.
FROM node:18-alpine AS build

# Uygulama için çalışma dizinini ayarlıyoruz.
WORKDIR /app

# Bağımlılıkları yüklemeden önce package.json ve package-lock.json (veya yarn.lock) dosyalarını kopyalıyoruz.
COPY package.json ./
# Eğer yarn kullanıyorsanız:
# COPY yarn.lock ./
# Eğer package-lock.json kullanıyorsanız:
COPY package-lock.json ./

# Bağımlılıkları yüklüyoruz.
# Eğer yarn kullanıyorsanız: RUN yarn install --frozen-lockfile
RUN npm ci
# Veya eğer package-lock.json yoksa/güvenilir değilse:
# RUN npm install

# Proje dosyalarının geri kalanını kopyalıyoruz.
COPY . .

# React uygulamasını production için build ediyoruz.
# Komutunuz 'tsc -b && vite build' olduğu için bu satır doğru.
RUN npm run build

# ----- Sunum Aşaması -----
# Nginx'in hafif bir versiyonunu temel alıyoruz.
FROM nginx:1.25-alpine

# Nginx için özel bir konfigürasyon dosyası kopyalıyoruz (Single Page Application yönlendirmesi için).
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Build aşamasında oluşturulan statik dosyaları Nginx'in sunacağı dizine kopyalıyoruz.
# DEĞİŞİKLİK: Vite genellikle 'dist' klasörüne build eder.
# Eğer projeniz farklı bir klasöre build ediyorsa (örn: vite.config.js içinde outDir ayarı varsa),
# burayı ona göre güncelleyin.
COPY --from=build /app/dist /usr/share/nginx/html

# Nginx'in 80 portunu dışarıya açtığını belirtiyoruz.
EXPOSE 80

# Container başladığında Nginx'i başlatacak komut.
CMD ["nginx", "-g", "daemon off;"]
