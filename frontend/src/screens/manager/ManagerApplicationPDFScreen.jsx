import React, { useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Button, Alert } from 'react-bootstrap';
import { FaFilePdf, FaArrowLeft, FaPrint } from 'react-icons/fa';
import { useGetApplicationPDFQuery } from '../../slices/applicationsApiSlice';
import { formatDate } from '../../utils/helpers';
import BackButton from '../../components/common/BackButton';
import Loader from '../../components/common/Loader';

const ManagerApplicationPDFScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const reportRef = useRef(null);
  
  useEffect(() => {
    if (!id) {
      console.error("Geçersiz başvuru ID'si");
      navigate('/manager/applications');
    }
  }, [id, navigate]);

  const { data: application, isLoading, error } = useGetApplicationPDFQuery(id, {
    skip: !id
  });

  const openPrintWindow = (showPdfGuidance = false) => {
    const printWindow = window.open('', '_blank', 'left=200,top=200,width=900,height=900');
    
    printWindow.document.write('<html><head><title>Değerlendirme Formu</title>');
    printWindow.document.write('<style>');
    printWindow.document.write(`
      body { font-family: Arial, sans-serif; padding: 20px; }
      table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }
      th, td { border: 1px solid #000; padding: 8px; }
      th { background-color: #f2f2f2; }
      .text-center { text-align: center; }
      .fw-bold { font-weight: bold; }
      .mb-4 { margin-bottom: 1.5rem; }
      .mb-2 { margin-bottom: 0.5rem; }
      .h4 { font-size: 1.5rem; }
      .small { font-size: 0.875rem; }
      .text-uppercase { text-transform: uppercase; }
      
      .pdf-guidance {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background-color: #f8d7da;
        color: #721c24;
        border: 1px solid #f5c6cb;
        padding: 15px;
        margin-bottom: 20px;
        text-align: center;
        z-index: 9999;
        font-size: 16px;
        font-weight: bold;
      }
      .pdf-guidance img {
        max-width: 100%;
        border: 1px solid #ddd;
        margin-top: 10px;
      }
      @media print {
        .pdf-guidance {
          display: none;
        }
      }
    `);
    printWindow.document.write('</style>');
    printWindow.document.write('</head><body>');
    
    if (showPdfGuidance) {
      printWindow.document.write(`
        <div class='pdf-guidance'>
          <p>PDF OLARAK İNDİRMEK İÇİN:</p>
          <p>1. Yazdırma penceresinde 'Hedef' olarak 'PDF'e Kaydet' seçeneğini seçin</p>
          <p>2. 'Kaydet' butonuna tıklayın</p>
        </div>
      `);
    }
    
    printWindow.document.write(reportRef.current.innerHTML);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    
    printWindow.onload = function() {
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 500);
    };
  };

  const handlePrint = () => {
    openPrintWindow(false);
  };
  
  const handleDownload = () => {
    openPrintWindow(true);
  };

  const handleBack = () => {
    navigate(-1);
  };

  const styles = {
    tableStyle: {
      border: '2px solid #000',
      borderCollapse: 'collapse',
      width: '100%',
      marginBottom: '20px'
    },
    cellStyle: {
      border: '1px solid #000',
      padding: '8px'
    },
    headerStyle: {
      backgroundColor: '#cbcbcb',
      border: '1px solid #000',
      padding: '8px',
      fontWeight: 'bold',
      textAlign: 'center'
    }
  };

  if (isLoading) {
    return (
      <Container className='text-center py-5'>
        <Loader/>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className='py-5'>
        <Alert variant='danger'>
          <Alert.Heading>Hata</Alert.Heading>
          <p>Başvuru verileri yüklenirken bir hata oluştu.</p>
          <p>{error?.data?.message || error?.error || 'Bilinmeyen hata'}</p>
        </Alert>
        <BackButton />
      </Container>
    );
  }

  if (!application) {
    return (
      <Container className='py-5'>
        <Alert variant='warning'>
          <Alert.Heading>Başvuru Bulunamadı</Alert.Heading>
          <p>İstenen başvuru bulunamadı veya erişim izniniz yok.</p>
        </Alert>
        <BackButton />
      </Container>
    );
  }

  return (
    <Container className='py-4'>
      <div className='mb-4 d-flex justify-content-between align-items-center'>
        <h1 className='h4 fw-bold'>Değerlendirme Formu (Tablo 5)</h1>
        <div>
          <Button variant='secondary' className='me-2' onClick={handleBack}>
            <FaArrowLeft className='me-1' /> Geri
          </Button>
          <Button variant='primary' className='me-2' onClick={handlePrint}>
            <FaPrint className='me-1' /> Yazdır
          </Button>
          <Button variant='success' onClick={handleDownload}>
            <FaFilePdf className='me-1' /> PDF İndir
          </Button>
        </div>
      </div>
      
      <div className='mb-4'>
        <div className='bg-white p-4 border'>
          <h5 className='mb-3'>Özet Bilgiler</h5>
          
          <table className='table table-bordered'>
            <thead>
              <tr className='bg-light'>
                <th colSpan='2' className='text-center'>GENEL PUANLAMA BİLGİLERİ</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td width='33%'><strong>Adı Soyadı:</strong></td>
                <td>{application.candidateId?.name} {application.candidateId?.surname}</td>
              </tr>
              <tr>
                <td><strong>Başvurduğu Kadro:</strong></td>
                <td>{application.positionType}</td>
              </tr>
              <tr>
                <td><strong>Toplam Puan:</strong></td>
                <td>{application.pointsSummary?.total || 0}</td>
              </tr>
            </tbody>
          </table>
          
          <div className='alert alert-info mt-3'>
            <small>
              <FaPrint className='me-1' /> Belgeyi yazdırmak için 'Yazdır' butonunu kullanabilirsiniz.
              <br />
              <FaFilePdf className='me-1' /> Belgeyi PDF olarak indirmek için 'PDF İndir' butonunu kullanabilirsiniz.
            </small>
          </div>
        </div>
      </div>
      
      <div style={{ display: 'none' }}>
        <div ref={reportRef}>
          <div className='text-center mb-4'>
            <h1 className='h4 fw-bold mb-2'>TABLO 5</h1>
            <p className='small fw-bold text-uppercase'>
              ÖĞRETİM ÜYELİKLERİNE ATAMA İÇİN YAPILAN BAŞVURULARDA ADAYLARIN YAYIN, EĞİTİM-ÖĞRETİM VE 
              DİĞER FAALİYETLERİNİN DEĞERLENDİRİLMESİNE İLİŞKİN GENEL PUANLAMA BİLGİLERİ
            </p>
          </div>
          
          <table style={styles.tableStyle}>
            <thead>
              <tr>
                <th colSpan='2' style={{...styles.headerStyle, textAlign: 'center'}}>
                  GENEL PUANLAMA BİLGİLERİ
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{...styles.cellStyle, fontWeight: 'bold', width: '33%'}}>Adı Soyadı (Ünvanı):</td>
                <td style={styles.cellStyle}>{application.candidateId?.name} {application.candidateId?.surname}</td>
              </tr>
              <tr>
                <td style={{...styles.cellStyle, fontWeight: 'bold'}}>Tarih:</td>
                <td style={styles.cellStyle}>{formatDate(application.createdAt, false)}</td>
              </tr>
              <tr>
                <td style={{...styles.cellStyle, fontWeight: 'bold'}}>Bulunduğu Kurum:</td>
                <td style={styles.cellStyle}>{application.jobId?.department?.name}</td>
              </tr>
              <tr>
                <td style={{...styles.cellStyle, fontWeight: 'bold'}}>Başvurduğu Akademik Kadro:</td>
                <td style={styles.cellStyle}>{application.positionType}</td>
              </tr>
              <tr>
                <td style={{...styles.cellStyle, fontWeight: 'bold'}}>İmza:</td>
                <td style={styles.cellStyle}></td>
              </tr>
            </tbody>
          </table>
          
          <table style={styles.tableStyle}>
            <tbody>
              <tr>
                <td style={{...styles.cellStyle, fontWeight: 'bold'}}>Puanlanan Faaliyet Dönemi</td>
              </tr>
              <tr>
                <td style={styles.cellStyle}>Profesör (Doçent ünvanını aldıktan sonraki faaliyetleri esas alınacaktır)</td>
                <td style={{...styles.cellStyle, width: '40px', textAlign: 'center'}}>
                  {application.positionType === 'Profesör' ? '☑' : '☐'}
                </td>
              </tr>
              <tr>
                <td style={styles.cellStyle}>Doçent (Doktora / Sanatta yeterlik/ tıp/diş uzmanlık ünvanını aldıktan sonraki faaliyetleri esas alınacaktır)</td>
                <td style={{...styles.cellStyle, width: '40px', textAlign: 'center'}}>
                  {application.positionType === 'Doçent' ? '☑' : '☐'}
                </td>
              </tr>
              <tr>
                <td style={styles.cellStyle}>Dr. Öğretim Üyesi (Yeniden Atama: Son atama tarihinden başvuru tarihine kadar olmak üzere dönem faaliyetleri esas alınacaktır)</td>
                <td style={{...styles.cellStyle, width: '40px', textAlign: 'center'}}>
                  {application.positionType === 'Dr. Öğr. Üyesi' ? '☑' : '☐'}
                </td>
              </tr>
            </tbody>
          </table>
          
          <table style={styles.tableStyle}>
            <thead>
              <tr>
                <th colSpan='4' style={{...styles.cellStyle, textAlign: 'center'}}>
                  ETKİNLİK
                </th>
              </tr>
              <tr>
                <th colSpan='4' style={{...styles.headerStyle, fontWeight: 'bold', textAlign: 'left'}}>
                  A. Makaleler (Başvurulan bilim alanı ile ilgili tam araştırma ve derleme makaleleri)
                </th>
              </tr>
              <tr>
                <th colSpan='2' style={{...styles.headerStyle, fontWeight: 'bold', textAlign: 'center'}}>Yazar/Yazarlar, Makale adı, Dergi adı, Cilt No., Sayfa, Yıl</th>
                <th style={{...styles.headerStyle, width: '100px', textAlign: 'center'}}>Puan Hesabı</th>
                <th style={{...styles.headerStyle, width: '100px', textAlign: 'center'}}>Nihai Puan</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan='4' style={{...styles.cellStyle, fontWeight: 'bold'}}>
                  1) SCI-E, SSCI veya AHCI kapsamındaki dergilerde yayınlanmış makale (Q1 olarak tanınan dergide)
                </td>
              </tr>
            
              {application.publications?.filter(pub => pub?.category === 'A1').length > 0 ? (
                application.publications
                  .filter(pub => pub.category === 'A1')
                  .map((pub, index) => (
                    <tr key={`A1-${index}`}>
                      <td colSpan='2' style={styles.cellStyle}>
                        {pub.authors}, {pub.title}, {pub.journal}, {pub.year}
                      </td>
                      <td style={{...styles.cellStyle, textAlign: 'center'}}>{pub.points}</td>
                      <td style={{...styles.cellStyle, textAlign: 'center'}}>{pub.points}</td>
                    </tr>
                  ))
              ) : (
                <tr>
                  <td colSpan='4' style={{...styles.cellStyle, textAlign: 'center'}}>-</td>
                </tr>
              )}
              
            <tr>
              <td colSpan='4' style={{...styles.cellStyle, fontWeight: 'bold'}}>
                2) SCI-E, SSCI veya AHCI kapsamındaki dergilerde yayınlanmış makale (Q2 olarak tanınan dergide)
              </td>
            </tr>
            
            {application.publications?.filter(pub => pub?.category === 'A2').length > 0 ? (
              application.publications
                .filter(pub => pub.category === 'A2')
                .map((pub, index) => (
                  <tr key={`A2-${index}`}>
                    <td colSpan='2' style={styles.cellStyle}>
                      {pub.authors}, {pub.title}, {pub.journal}, {pub.year}
                    </td>
                    <td style={{...styles.cellStyle, textAlign: 'center'}}>{pub.points}</td>
                    <td style={{...styles.cellStyle, textAlign: 'center'}}>{pub.points}</td>
                  </tr>
                ))
            ) : (
              <tr>
                <td colSpan='4' style={{...styles.cellStyle, textAlign: 'center'}}>-</td>
              </tr>
            )}
            
            <tr>
              <td colSpan='4' style={{...styles.cellStyle, fontWeight: 'bold'}}>
                3) SCI-E, SSCI veya AHCI kapsamındaki dergilerde yayınlanmış makale (Q3 olarak tanınan dergide)
              </td>
            </tr>

            {application.publications?.filter(pub => pub?.category === 'A3').length > 0 ? (
              application.publications
                .filter(pub => pub.category === 'A3')
                .map((pub, index) => (
                  <tr key={`A3-${index}`}>
                    <td colSpan='2' style={styles.cellStyle}>
                      {pub.authors}, {pub.title}, {pub.journal}, {pub.year}
                    </td>
                    <td style={{...styles.cellStyle, textAlign: 'center'}}>{pub.points}</td>
                    <td style={{...styles.cellStyle, textAlign: 'center'}}>{pub.points}</td>
                  </tr>
                ))
            ) : (
              <tr>
                <td colSpan='4' style={{...styles.cellStyle, textAlign: 'center'}}>-</td>
              </tr>
            )}
            
            <tr>
              <td colSpan='4' style={{...styles.cellStyle, fontWeight: 'bold'}}>
                4) SCI-E, SSCI veya AHCI kapsamındaki dergilerde yayınlanmış makale (Q4 olarak tanınan dergide)
              </td>
            </tr>
            {application.publications?.filter(pub => pub?.category === 'A4').length > 0 ? (
              application.publications
                .filter(pub => pub.category === 'A4')
                .map((pub, index) => (
                  <tr key={`A4-${index}`}>
                    <td colSpan='2' style={styles.cellStyle}>
                      {pub.authors}, {pub.title}, {pub.journal}, {pub.year}
                    </td>
                    <td style={{...styles.cellStyle, textAlign: 'center'}}>{pub.points}</td>
                    <td style={{...styles.cellStyle, textAlign: 'center'}}>{pub.points}</td>
                  </tr>
                ))
            ) : (
              <tr>
                <td colSpan='4' style={{...styles.cellStyle, textAlign: 'center'}}>-</td>
              </tr>
            )}
            
            {['A5', 'A6', 'A7', 'A8', 'A9'].map((category, idx) => (
              <React.Fragment key={category}>
                <tr>
                  <td colSpan='4' style={{...styles.cellStyle, fontWeight: 'bold'}}>
                    {idx + 5}) {category === 'A5' ? 'ESCI tarafından taranan dergilerde yayımlanmış makale' :
                      category === 'A6' ? 'Scopus tarafından taranan dergilerde yayımlanmış makale' :
                      category === 'A7' ? 'Uluslararası diğer indekslerde taranan dergilerde yayımlanmış makale' :
                      category === 'A8' ? 'ULAKBİM TR Dizin tarafından taranan ulusal hakemli dergilerde yayımlanmış makale' :
                      '8. madde dışındaki ulusal hakemli dergilerde yayımlanmış makale'}
                  </td>
                </tr>
                {application.publications?.filter(pub => pub?.category === category).length > 0 ? (
                  application.publications
                    .filter(pub => pub.category === category)
                    .map((pub, index) => (
                      <tr key={`${category}-${index}`}>
                        <td colSpan='2' style={styles.cellStyle}>
                          {pub.authors}, {pub.title}, {pub.journal}, {pub.year}
                        </td>
                        <td style={{...styles.cellStyle, textAlign: 'center'}}>{pub.points}</td>
                        <td style={{...styles.cellStyle, textAlign: 'center'}}>{pub.points}</td>
                      </tr>
                    ))
                ) : (
                  <tr>
                    <td colSpan='4' style={{...styles.cellStyle, textAlign: 'center'}}>-</td>
                  </tr>
                )}
              </React.Fragment>
            ))}
            
            <tr>
              <td colSpan='2' style={{...styles.headerStyle, textAlign: 'right'}}>
                Asgari Koşula Dahil Toplam Puanı
              </td>
              <td colSpan='2' style={{...styles.headerStyle, textAlign: 'center'}}>
                {application.publications?.reduce((total, pub) => total + (pub.points || 0), 0) || 0}
              </td>
            </tr>
            <tr>
              <td colSpan='4' style={{...styles.cellStyle, textAlign: 'center', fontWeight: 'bold'}}>
                Bölüm A<br />
                <span style={{fontStyle: 'italic', fontWeight: 'normal', fontSize: '0.8rem'}}>* Asgari koşul gerektirmeleri altı çizili olarak gösterilmelidir.</span>
              </td>
            </tr>
            <tr>
              <td colSpan='2' style={{...styles.cellStyle, textAlign: 'right', fontWeight: 'bold'}}>
                Toplam Puan
              </td>
              <td colSpan='2' style={{...styles.cellStyle, textAlign: 'center', fontWeight: 'bold'}}>
                {application.publications?.reduce((total, pub) => total + (pub.points || 0), 0) || 0}
              </td>
            </tr>
          </tbody>
        </table>
        
        {application.citations && application.citations.length > 0 && (
          <table style={styles.tableStyle}>
            <thead>
              <tr>
                <th colSpan='4' style={{...styles.headerStyle, fontWeight: 'bold', textAlign: 'left'}}>
                  D. Atıflar
                </th>
              </tr>
              <tr>
                <th colSpan='2' style={{...styles.headerStyle, fontWeight: 'bold', textAlign: 'center'}}>Atıf Yapılan Eser</th>
                <th style={{...styles.headerStyle, width: '100px', textAlign: 'center'}}>Atıf Sayısı</th>
                <th style={{...styles.headerStyle, width: '100px', textAlign: 'center'}}>Nihai Puan</th>
              </tr>
            </thead>
            <tbody>
              {['D1', 'D2', 'D3', 'D4', 'D5', 'D6'].map((category, idx) => (
                <React.Fragment key={category}>
                  <tr>
                    <td colSpan='4' style={{...styles.cellStyle, fontWeight: 'bold'}}>
                      {idx + 1}) {
                        category === 'D1' ? 'SCI-E, SSCI ve AHCI tarafından taranan dergilerde; Uluslararası yayınevleri tarafından yayımlanmış kitaplarda yayımlanan ve adayın yazar olarak yer almadığı yayınlardan her birinde, metin içindeki atıf sayısına bakılmaksızın adayın atıf yapılan her eseri için' :
                        category === 'D2' ? 'E-SCI tarafından taranan dergilerde ve adayın yazar olarak yer almadığı yayınlardan her birinde, metin içindeki atıf sayısına bakılmaksızın adayın atıf yapılan her eseri için ' :
                        category === 'D3' ? 'SCI-E, SSCI, AHCI, E-SCI dışındaki diğer uluslararası indeksler tarafından taranan dergilerde; Uluslararası yayınevleri tarafından yayımlanmış kitaplarda bölüm yazarı olarak yayımlanan ve adayın yazar olarak yer almadığı yayınlardan her birinde, metin içindeki atıf sayısına bakılmaksızın adayın atıf yapılan her eseri için' :
                        category === 'D4' ? 'Ulusal hakemli dergilerde; Ulusal yayınevleri tarafından yayımlanmış kitaplarda yayımlanan ve adayın yazar olarak yer almadığı yayınlardan her birinde, metin içindeki atıf sayısına bakılmaksızın adayın atıf yapılan her eseri için ' :
                        category === 'D5' ? 'Güzel sanatlardaki eserlerin uluslararası kaynak veya yayın organlarında yer alması veya gösterime ya da dinletime girmesi ' :
                        ' Güzel sanatlardaki eserlerin ulusal kaynak veya yayın organlarında yer alması veya gösterime ya da dinletime girmesi '
                      }
                    </td>
                  </tr>
                  {application.citations?.filter(cit => cit?.category === category).length > 0 ? (
                    application.citations
                      .filter(cit => cit.category === category)
                      .map((cit, index) => (
                        <tr key={`${category}-${index}`}>
                          <td colSpan='2' style={styles.cellStyle}>
                            {cit.publicationTitle}
                          </td>
                          <td style={{...styles.cellStyle, textAlign: 'center'}}>{cit.count}</td>
                          <td style={{...styles.cellStyle, textAlign: 'center'}}>{cit.points}</td>
                        </tr>
                      ))
                  ) : (
                    <tr>
                      <td colSpan='4' style={{...styles.cellStyle, textAlign: 'center'}}>-</td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
              
              <tr>
                <td colSpan='2' style={{...styles.cellStyle, textAlign: 'right', fontWeight: 'bold'}}>
                  Toplam Puan
                </td>
                <td colSpan='2' style={{...styles.cellStyle, textAlign: 'center', fontWeight: 'bold'}}>
                  {application.citations?.reduce((total, cit) => total + (cit.points || 0), 0) || 0}
                </td>
              </tr>
            </tbody>
          </table>
        )}

        {application.theses && application.theses.length > 0 && (
          <table style={styles.tableStyle}>
            <thead>
              <tr>
                <th colSpan='4' style={{...styles.headerStyle, fontWeight: 'bold', textAlign: 'left'}}>
                  F. Lisansüstü Tez Danışmanlığı
                </th>
              </tr>
              <tr>
                <th colSpan='2' style={{...styles.headerStyle, fontWeight: 'bold', textAlign: 'center'}}>Öğrenci Adı, Tez Başlığı, Yıl</th>
                <th style={{...styles.headerStyle, width: '100px', textAlign: 'center'}}>Kategori</th>
                <th style={{...styles.headerStyle, width: '100px', textAlign: 'center'}}>Puan</th>
              </tr>
            </thead>
            <tbody>
              {['F1', 'F2', 'F3', 'F4'].map((category, idx) => (
                <React.Fragment key={category}>
                  <tr>
                    <td colSpan='4' style={{...styles.cellStyle, fontWeight: 'bold'}}>
                      {idx + 1}) {
                        category === 'F1' ? 'Doktora/Sanatta Yeterlilik veya Tıp/Diş Hekimliğinde Uzmanlık Tez Yönetimi' :
                        category === 'F2' ? 'Yüksek Lisans Tez Yönetimi' :
                        category === 'F3' ? 'Doktora/Sanatta Yeterlilik (Eş Danışman)' :
                        'Yüksek Lisans/Sanatta Yeterlilik (Eş Danışman)'
                      }
                    </td>
                  </tr>
                  {application.theses?.filter(thesis => thesis?.category === category).length > 0 ? (
                    application.theses
                      .filter(thesis => thesis.category === category)
                      .map((thesis, index) => (
                        <tr key={`${category}-${index}`}>
                          <td colSpan='2' style={styles.cellStyle}>
                            {thesis.studentName}, {thesis.title}, {thesis.year || ''}
                          </td>
                          <td style={{...styles.cellStyle, textAlign: 'center'}}>{thesis.category}</td>
                          <td style={{...styles.cellStyle, textAlign: 'center'}}>{thesis.points}</td>
                        </tr>
                      ))
                  ) : (
                    <tr>
                      <td colSpan='4' style={{...styles.cellStyle, textAlign: 'center'}}>-</td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
              
              <tr>
                <td colSpan='2' style={{...styles.cellStyle, textAlign: 'right', fontWeight: 'bold'}}>
                  Toplam Puan
                </td>
                <td colSpan='2' style={{...styles.cellStyle, textAlign: 'center', fontWeight: 'bold'}}>
                  {application.theses?.reduce((total, thesis) => total + (thesis.points || 0), 0) || 0}
                </td>
              </tr>
            </tbody>
          </table>
        )}
        
        {application.projects && application.projects.length > 0 && (
          <table style={styles.tableStyle}>
            <thead>
              <tr>
                <th colSpan='4' style={{...styles.headerStyle, fontWeight: 'bold', textAlign: 'left'}}>
                  H. Bilimsel Araştırma Projeleri
                </th>
              </tr>
              <tr>
                <th colSpan='2' style={{...styles.headerStyle, fontWeight: 'bold', textAlign: 'center'}}>Proje Adı, Kurum, Yıl</th>
                <th style={{...styles.headerStyle, width: '100px', textAlign: 'center'}}>Kategori</th>
                <th style={{...styles.headerStyle, width: '100px', textAlign: 'center'}}>Puan</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({length: 28}, (_, i) => `H${i+1}`).map((category, idx) => (
                <React.Fragment key={category}>
                  <tr>
                    <td colSpan='4' style={{...styles.cellStyle, fontWeight: 'bold'}}>
                      {idx + 1}) Proje Kategorisi {category}
                    </td>
                  </tr>
                  {application.projects?.filter(project => project?.category === category).length > 0 ? (
                     application.projects
                       .filter(project => project.category === category)
                       .map((project, index) => (
                         <tr key={`${category}-${index}`}>
                           <td colSpan='2' style={styles.cellStyle}>
                             {project.title}, {project.fundingAgency || ''}, {project.year || ''}
                           </td>
                           <td style={{...styles.cellStyle, textAlign: 'center'}}>{project.category}</td>
                           <td style={{...styles.cellStyle, textAlign: 'center'}}>{project.points}</td>
                         </tr>
                       ))
                   ) : (
                     <tr>
                       <td colSpan='4' style={{...styles.cellStyle, textAlign: 'center'}}>-</td>
                     </tr>
                   )}
                 </React.Fragment>
               ))}
               
               <tr>
                 <td colSpan='2' style={{...styles.cellStyle, textAlign: 'right', fontWeight: 'bold'}}>
                   Toplam Puan
                 </td>
                 <td colSpan='2' style={{...styles.cellStyle, textAlign: 'center', fontWeight: 'bold'}}>
                   {application.projects?.reduce((total, project) => total + (project.points || 0), 0) || 0}
                 </td>
               </tr>
             </tbody>
           </table>
         )}
         
         <table style={styles.tableStyle}>
           <thead>
             <tr>
               <th colSpan='2' style={{...styles.headerStyle, textAlign: 'center'}}>
                 ÖZET TABLOSU
               </th>
             </tr>
             <tr>
               <th style={{...styles.headerStyle, textAlign: 'left'}}>FAALİYET</th>
               <th style={{...styles.headerStyle, width: '100px', textAlign: 'center'}}>PUAN</th>
             </tr>
           </thead>
           <tbody>
             <tr>
               <td style={styles.cellStyle}>A. Makaleler</td>
               <td style={{...styles.cellStyle, textAlign: 'center'}}>{application.pointsSummary?.publications || 0}</td>
             </tr>
             <tr>
               <td style={styles.cellStyle}>D. Atıflar</td>
               <td style={{...styles.cellStyle, textAlign: 'center'}}>{application.pointsSummary?.citations || 0}</td>
             </tr>
             <tr>
               <td style={styles.cellStyle}>F. Tez Danışmanlığı</td>
               <td style={{...styles.cellStyle, textAlign: 'center'}}>{application.pointsSummary?.theses || 0}</td>
             </tr>
             <tr>
               <td style={styles.cellStyle}>H. Projeler</td>
               <td style={{...styles.cellStyle, textAlign: 'center'}}>{application.pointsSummary?.projects || 0}</td>
             </tr>
             <tr>
               <td style={styles.cellStyle}>Diğer Faaliyetler</td>
               <td style={{...styles.cellStyle, textAlign: 'center'}}>{application.pointsSummary?.other || 0}</td>
             </tr>
             <tr>
               <td style={{...styles.cellStyle, fontWeight: 'bold'}}>TOPLAM</td>
               <td style={{...styles.cellStyle, fontWeight: 'bold', textAlign: 'center'}}>{application.pointsSummary?.total || 0}</td>
             </tr>
           </tbody>
         </table>
       </div>
      </div>
    </Container>
  );
};

export default ManagerApplicationPDFScreen;