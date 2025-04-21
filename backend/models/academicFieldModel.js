import mongoose from 'mongoose';

const pointsSchema = mongoose.Schema({
  A1: { type: Number, default: 60 },          // SCI-E, SSCI, AHCI (Q1)
  A2: { type: Number, default: 55 },          // SCI-E, SSCI, AHCI (Q2)
  A3: { type: Number, default: 40 },          // SCI-E, SSCI, AHCI (Q3)
  A4: { type: Number, default: 30 },          // SCI-E, SSCI, AHCI (Q4)
  A5: { type: Number, default: 25 },          // ESCI
  A6: { type: Number, default: 20 },          // Scopus
  A7: { type: Number, default: 15 },          // Diğer Uluslararası İndeks
  A8: { type: Number, default: 10 },          // TR Dizin
  A9: { type: Number, default: 8 },           // Diğer ulusal hakemli dergiler
  
  D1: { type: Number, default: 4 },           // SCI-E, SSCI, AHCI ve uluslararası kitap atıfları
  D2: { type: Number, default: 3 },           // ESCI atıfları
  D3: { type: Number, default: 2 },           // Diğer uluslararası indeks ve uluslararası kitap bölümü atıfları
  D4: { type: Number, default: 1 },           // Ulusal hakemli dergi ve kitap atıfları
  D5: { type: Number, default: 3 },           // Güzel sanatlar uluslararası atıf
  D6: { type: Number, default: 1 },           // Güzel sanatlar ulusal atıf

  F1: { type: Number, default: 40 },          // Doktora/Sanatta Yeterlik Tez Yönetimi
  F2: { type: Number, default: 15 },          // Yüksek Lisans Tez Yönetimi
  F3: { type: Number, default: 9 },           // Doktora/Sanatta Yeterlik (Eş Danışman)
  F4: { type: Number, default: 4 },           // Yüksek Lisans Tez Yönetimi (Eş Danışman)

  H1: { type: Number, default: 250 },         // AB Çerçeve/NSF/ERC koordinatör
  H2: { type: Number, default: 150 },         // AB Çerçeve/NSF/ERC yürütücü
  H3: { type: Number, default: 100 },         // AB Çerçeve/NSF/ERC araştırmacı
  H4: { type: Number, default: 150 },         // Diğer uluslararası proje koordinatör
  H5: { type: Number, default: 120 },         // Diğer uluslararası proje yürütücü
  H6: { type: Number, default: 70 },          // Diğer uluslararası proje araştırmacı
  H7: { type: Number, default: 30 },          // Diğer uluslararası proje danışman
  H8: { type: Number, default: 100 },         // TÜBİTAK ARGE yürütücü
  H9: { type: Number, default: 50 },          // Diğer TÜBİTAK yürütücü
  H10: { type: Number, default: 40 },         // Kamu kurumları proje yürütücü
  H11: { type: Number, default: 40 },         // Sanayi projeleri yürütücü
  H12: { type: Number, default: 20 },         // Diğer özel kuruluş projeleri yürütücü
  H13: { type: Number, default: 50 },         // TÜBİTAK ARGE araştırmacı
  H14: { type: Number, default: 25 },         // Diğer TÜBİTAK araştırmacı
  H15: { type: Number, default: 20 },         // Kamu kurumları proje araştırmacı
  H16: { type: Number, default: 20 },         // Sanayi projeleri araştırmacı
  H17: { type: Number, default: 10 },         // Diğer özel kuruluş projeleri araştırmacı
  H18: { type: Number, default: 25 },         // TÜBİTAK ARGE danışman
  H19: { type: Number, default: 12 },         // Diğer TÜBİTAK danışman
  H20: { type: Number, default: 10 },         // Kamu kurumları proje danışman
  H21: { type: Number, default: 10 },         // Sanayi projeleri danışman
  H22: { type: Number, default: 10 },         // Diğer özel kuruluş projeleri danışman
  H23: { type: Number, default: 8 },          // BAP projeleri yürütücü
  H24: { type: Number, default: 6 },          // BAP projeleri araştırmacı
  H25: { type: Number, default: 3 },          // BAP projeleri danışman
  H26: { type: Number, default: 100 },        // Yurtdışı araştırma (4+ ay)
  H27: { type: Number, default: 50 },         // Yurtiçi araştırma (4+ ay)
  H28: { type: Number, default: 10 },         // TÜBİTAK 2209 danışmanlık

  E1: { type: Number, default: 2 },           // Önlisans/lisans dersleri
  E2: { type: Number, default: 3 },           // Önlisans/lisans dersleri (Yabancı dilde)
  E3: { type: Number, default: 3 },           // Lisansüstü dersleri
  E4: { type: Number, default: 4 },           // Lisansüstü dersleri (Yabancı dilde)

  K1: { type: Number, default: 15 },          // Dekan/Enstitü/Yüksekokul/MYO/Merkez Müdürü
  K2: { type: Number, default: 12 },          // Enstitü Müdür Yrd./Dekan Yrd./Yüksekokul Müdür Yrd./MYO Müdür Yrd./Merkez Müdürü Yrd./Bölüm Başkanı
  K3: { type: Number, default: 10 },          // Bölüm Başkan Yrd./Anabilim Dalı Başkanı
  K4: { type: Number, default: 8 },           // Rektörlükçe görevlendirilen Koordinatörlük
  K5: { type: Number, default: 7 },           // Rektörlükçe görevlendirilen Koordinatör Yardımcıları
  K6: { type: Number, default: 6 },           // Rektörlükçe görevlendirilen üniversite düzeyinde Komisyon/Kurul üyelikleri
  K7: { type: Number, default: 5 },           // Dekanlık/Y.O. Müdürlüğü/MYO Müdürlüğü /Konservatuvar Müdürlüğü tarafından görevlendirilen Komisyon/Kurul üyelikleri
  K8: { type: Number, default: 4 },           // Bölüm Başkanlıkları tarafından görevlendirilen Komisyon/Kurul üyelikleri
  K9: { type: Number, default: 3 },           // Rektörlük/Dekanlık/Y.O. Müdürlüğü/MYO Müdürlüğü /Konservatuvar Müdürlüğü/ Bölüm Başkanlığı görevlendirmeleriyle kurum içi ve dışı eğitim, işbirliği vb konularda katkı sağlamak
  K10: { type: Number, default: 5 },          // Uluslararası nitelikteki bilimsel ve mesleki kurum/kuruluşların yönetimlerinde, kurullarında, komisyon veya komitelerinde görev almak
  K11: { type: Number, default: 4 },          // Ulusal nitelikteki bilimsel ve mesleki kurum/kuruluşların yönetimlerinde, kurullarında, komisyon veya komitelerinde görev almak
});

// Tablo 2. Öğretim Üyesi Kadrolarına Başvuru için Asgari/Azami Puan Kriterleri
const minPointsRequirementsSchema = mongoose.Schema({
  A1A4: { type: Number, default: 0 },
  A1A5: { type: Number, default: 0 },
  F1F2: { type: Number, default: 0 },
  H1H17: { type: Number, default: 0 },
  H1H22: { type: Number, default: 0 },
  K1K11: { type: Number, default: 0 },
});
const maxPointsRequirementsSchema = mongoose.Schema({
D1D6: { type: Number, default: 0 },
E1E4: { type: Number, default: 0 },
K1K11: { type: Number, default: 0 },
});

// Tablo 1. Öğretim Üyesi Kadrolarına Başvuru için Asgari Yayın/Etkinlik Sayısı Kriterleri
const requirementsSchema = mongoose.Schema({
  requiredPoints: { type: Number, required: true },
  totalArticles: { type: Number, required: true }, 
  asMainAuthor: { type: Number, required: true },
  A1A2: { type: Number, default: 0 },
  A1A4: { type: Number, default: 0 },
  A1A5: { type: Number, default: 0 }, 
  A1A6: { type: Number, default: 0 }, 
  A1A8: { type: Number, default: 0 },
  F1orF2: { type: Boolean, default: false },          
  F1orF2Description: { type: String },               
  H1H12orH13H17: { type: Boolean, default: false },
  H1H12orH13H22: { type: Boolean, default: false },
  projectRequirementDescription: { type: String },
  minPoints: minPointsRequirementsSchema,
  maxPoints: maxPointsRequirementsSchema,
});

const academicFieldSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String
  },
 
  points: pointsSchema,
  
  criteria: {
    professorCriteria: requirementsSchema,
    docentCriteria: requirementsSchema,
    drOgrUyesiCriteria: requirementsSchema
  },
}, {timestamps: true});

const AcademicField = mongoose.model('AcademicField', academicFieldSchema);
export default AcademicField;