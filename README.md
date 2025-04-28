<div align="center">
  
![React](https://img.shields.io/badge/-React-61DAFB?style=flat-square&logo=react&logoColor=black)
![RTK Query](https://img.shields.io/badge/-RTK%20Query-764ABC?style=flat-square&logo=redux&logoColor=white)
![Node.js](https://img.shields.io/badge/-Node.js-339933?style=flat-square&logo=Node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/-Express.js-000000?style=flat-square&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/-MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white)
![JWT](https://img.shields.io/badge/-JWT-000000?style=flat-square&logo=json-web-tokens&logoColor=white)
# Akademik Başvuru Sistemi

</div>

<div align="justify">
  
Bu proje, Yazılım Geliştirme Laboratuvarı - II dersi kapsamında akademik personel atama sürecini yönetmek amacıyla geliştirilmiştir.
Adminlerin ilan oluşturabildiği, adayların başvuru yapabildiği, yöneticilerin süreçleri yönetebildiği ve jüri üyelerinin değerlendirme
yapabildiği uçtan uca bir sistem sunmak hedeflenmiştir. 

Proje raporuna [buradan](grup28_rapor.pdf) ulaşabilirsiniz.

</div>

### Servisler
- **TC Kimlik Doğrulama:** Nüfus Vatandaşlık İşleri KPS
- **Dosya Depolama:** AWS S3

## Kurulum
1. Projeyi klonlayın:

```bash
git clone https://github.com/miraygurbuz/Academic-Recruitment-Portal.git
cd Academic-Recruitment-Portal
```

2. Bağımlılıkları yükleyin:

```bash
npm install
```
 - Ardından frontend bağımlılıklarını yükleyin:

```bash
cd frontend
npm install
```

3. Kök dizinde `.env` dosyası oluşturun ve gerekli değişkenleri tanımlayın:

```bash
NODE_ENV=development
PORT=5000
JWT_SECRET=jwt-anahtar-degeri

# NVI Servis Bağlantısı
NVI_SERVICE_URL=https://tckimlik.nvi.gov.tr/service/kpspublic.asmx?WSDL

# MongoDB Bağlantısı
MONGO_URI=mongodb://localhost:27017/veritabaniadi  # Yerel MongoDB için
# MONGO_URI=mongodb+srv://kullaniciadi:sifre@cluster.mongodb.net/veritabaniadi  # MongoDB Atlas için

# AWS S3 Yapılandırması
AWS_ACCESS_KEY_ID=aws-access-key-id-degeri
AWS_SECRET_ACCESS_KEY=aws-secret-access-key-degeri
AWS_REGION=eu-central-1  # Kullandığınız AWS bölgesi
AWS_S3_BUCKET_NAME=bucket-adi
```
4. Uygulamayı çalıştırın:

```bash
npm run dev
```

## Sistem Akışı

- Kullanıcı, sisteme kayıt olmadan önce NVI KPS servisi üzerinden ad, soyad, doğum yılı ve TC kimlik numarası kontrol edilerek kimlik doğrulamasından geçer.

![image](https://github.com/user-attachments/assets/72f4d5c3-cc5e-463c-9f25-fa8b0c9a93c2)

#### Aday

- Kayıt sonrası giriş yaparak aday paneline ulaşır.

![image](https://github.com/user-attachments/assets/d4970a28-899e-46a1-816a-27338fdd7d13)

- Aday, açılmış ilanlara başvuru yapabilir, profil bilgilerini düzenleyebilir ve başvuru durumu hakkında bildirim alabilir.
  
#### Admin

![image](https://github.com/user-attachments/assets/a65ee4e9-bd14-4577-a907-01c15c012406)

- Admin, yeni ilan oluşturabilir, mevcut ilanları düzenleyebilir ve adayların başvuru detaylarını görüntüleyebilir.

![image](https://github.com/user-attachments/assets/0b69d391-7570-4be8-9a85-81336263cb8b)

- Admin ayrıca akademik alanlar (fakülte, bölüm) ekleyebilir ve sistemdeki kullanıcıların rolleri üzerinde yetkiye sahiptir.
  
#### Yönetici

- Yönetici, sisteme admin tarafından yeni bir ilan eklendiğinde ilgili ilana jüri ataması yapması için bildirim alır.

![image](https://github.com/user-attachments/assets/5820917e-e2eb-41db-ba3c-6252a78148cc)

- Başvuruların detaylarını görüntüleyebilir, jüri değerlendirmelerine ulaşır ve başvuruya özel PDF raporuna erişebilir.
  
- Akademik alanlara göre başvuru kriterleri ve özel kadro şartlarını tanımlayabilir.

![image](https://github.com/user-attachments/assets/3f3dedf7-71d0-43dd-baf7-554d9a067334)

- Jüri değerlendirmeleri tamamlandığında başvuru için nihai kararı verir.

#### Jüri Üyesi

- Jüri üyeleri, jüri olarak atandıkları ilanlar için bildirim alır.

![bildirimler](https://github.com/user-attachments/assets/10a34d45-691f-4f43-bce0-bcf905b003e3)

- İlan başvurularını görüntüleyip değerlendirme yapabilirler.

![image](https://github.com/user-attachments/assets/c14dd161-7727-4ccb-b54e-f573676ce7bf)

<div align="center">

### Grup 28
  
❤️ 

***Miray Gürbüz - 221307031***
  
***Zeynep Yılmaz - 221307012***

***Hilal Yüce - 221307070***

<a href="https://github.com/miraygurbuz/Academic-Recruitment-Portal/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=miraygurbuz/Academic-Recruitment-Portal" />
</a>

</div>
