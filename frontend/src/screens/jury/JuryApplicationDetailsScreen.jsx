import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Button, Tabs, Tab, Alert } from 'react-bootstrap';
import { useParams, Link } from 'react-router-dom';
import { 
  useGetJuryApplicationDetailsQuery, 
  useEvaluateApplicationMutation,
  useUpdateEvaluationMutation
} from '../../slices/juryApiSlice';
import { FaInfo, FaFile, FaDownload, FaEdit } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import Loader from '../../components/common/Loader';
import BackButton from '../../components/common/BackButton';

const JuryApplicationDetailsScreen = () => {
  const { applicationId } = useParams();
  const { userInfo } = useSelector((state) => state.auth);
  
  const [activeTab, setActiveTab] = useState('overview');
  const [result, setResult] = useState('');
  const [comments, setComments] = useState('');
  const [hasExistingEvaluation, setHasExistingEvaluation] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [existingResult, setExistingResult] = useState('');
  const [reportFile, setReportFile] = useState(null);
  const [reportFileName, setReportFileName] = useState('');
  
  const { data: application, isLoading, refetch, error } = useGetJuryApplicationDetailsQuery(applicationId);
  const [evaluateApplication, { isLoading: isEvaluating }] = useEvaluateApplicationMutation();
  const [updateEvaluation, { isLoading: isUpdating }] = useUpdateEvaluationMutation();
  
  useEffect(() => {
    if (application) {
      const myEvaluation = application.juryEvaluations.find(
        evaluation => evaluation.juryMember._id === userInfo._id
      );
      
      if (myEvaluation) {
        setResult(myEvaluation.result);
        setExistingResult(myEvaluation.result);
        setComments(myEvaluation.comments || '');
        setHasExistingEvaluation(true);
        
        if (myEvaluation.reportFileUrl) {
          const fileName = myEvaluation.reportFileUrl.split('/').pop();
          setReportFileName(myEvaluation.reportOriginalName || fileName);
        }
      } else {
        setIsEditing(true);
      }
    }
  }, [application, userInfo._id]);

  const downloadFile = (filename) => {
    const downloadUrl = `/api/applications/download-file/${filename}`;
    fetch(downloadUrl)
      .then(response => {
        if (!response.ok) {
          throw new Error('Dosya indirilemedi');
        }
        const suggestedFilename = response.headers
          .get('Content-Disposition')
          ?.split('filename=')[1]
          ?.replace(/"/g, '') || filename;
        return response.blob().then(blob => ({ blob, suggestedFilename }));
      })
      .then(({ blob, suggestedFilename }) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = suggestedFilename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      })
      .catch(error => {
        toast.error('Dosya indirilemedi');
      });
  };

  const handleToggleEdit = () => {
    setIsEditing(!isEditing);
  };
  
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setReportFile(file);
    setReportFileName(file.name);
  };
  
  const handleRemoveFile = () => {
    setReportFile(null);
    setReportFileName('');
  };
  
  const handleSubmitEvaluation = async (e) => {
    e.preventDefault();
    
    if (!result) {
      toast.error('Lütfen bir değerlendirme sonucu seçiniz');
      return;
    }
    
    try {
      const formData = new FormData();
      formData.append('result', result);
      formData.append('comments', comments);
      
      if (reportFile) {
        formData.append('evaluationFile', reportFile);
      }
      
      if (hasExistingEvaluation) {
        await updateEvaluation({
          applicationId,
          evaluation: formData
        }).unwrap();
        toast.success('Değerlendirmeniz başarıyla güncellendi');
      } else {
        await evaluateApplication({
          applicationId,
          evaluation: formData
        }).unwrap();
        toast.success('Değerlendirmeniz başarıyla kaydedildi');
      }
      
      setIsEditing(false);
      await refetch();
    } catch (err) {
      toast.error(err?.data?.message || 'Değerlendirme yapılırken bir hata oluştu');
    }
  };
  
  if (isLoading) {
    return (
      <Container className='d-flex justify-content-center mt-5'>
        <Loader />
      </Container>
    );
  }
  
  if (error) {
    return (
      <Container className='mt-4'>
        <Alert variant='danger'>
          Başvuru yüklenirken bir hata oluştu: {error.data?.message || 'Bilinmeyen hata'}
        </Alert>
      </Container>
    );
  }
  
  if (!application) {
    return (
      <Container className='mt-4'>
        <Alert variant='warning'>Başvuru bulunamadı</Alert>
      </Container>
    );
  }
  
  return (
    <Container className='mt-4 mb-5'>
      <Row className='mb-3'>
        <Col>
          <BackButton />
          <h2 className='mb-0'>
            Başvuru Değerlendirme - #{application._id.substring(0, 8)}
          </h2>
          <p className='text-muted'>
            {application.positionType} - {new Date(application.createdAt).toLocaleDateString('tr-TR')}
          </p>
        </Col>
        <Col xs='auto' className='d-flex align-items-center'>
          <Badge 
            bg={
              application.status === 'Onaylandı' ? 'success' : 
              application.status === 'Reddedildi' ? 'danger' : 
              'warning'
            } 
            className='fs-6 me-2'
          >
            {application.status}
          </Badge>
        </Col>
      </Row>
      
      <Card className='mb-4 border-0 shadow-sm'>
        <Card.Body>
          <style>
            {`
              .nav-tabs .nav-link:not(.active) {
                color:rgb(0, 76, 40);
              }
            `}
          </style>
          <Tabs
            activeKey={activeTab}
            onSelect={(k) => setActiveTab(k)}
            className='mb-3'
          >
            <Tab eventKey='overview' title='Genel Bakış'>
              <Row>
                <Col md={6}>
                  <Card className='mb-3'>
                    <Card.Header>Aday Bilgileri</Card.Header>
                    <Card.Body>
                      <Table responsive borderless>
                        <tbody>
                          <tr>
                            <td className='fw-bold' width='40%'>TC Kimlik No:</td>
                            <td>{application.candidateId?.tcKimlik}</td>
                          </tr>
                          <tr>
                            <td className='fw-bold' width='40%'>İsim:</td>
                            <td>{application.candidateId?.name} {application.candidateId?.surname}</td>
                          </tr>
                          <tr>
                            <td className='fw-bold'>Akademik Alan:</td>
                            <td>{application.academicFieldId?.name}</td>
                          </tr>
                          <tr>
                            <td className='fw-bold'>Bölüm:</td>
                            <td>{application.jobId?.department?.name}</td>
                          </tr>
                          <tr>
                            <td className='fw-bold'>Başvuru Pozisyonu:</td>
                            <td>{application.positionType}</td>
                          </tr>
                          <tr>
                            <td className='fw-bold'>İlan:</td>
                            <td>
                              <Link 
                                to={`/jury/jobs/${application.jobId?._id}`}
                                className='text-success fw-bold'
                              >
                                {application.jobId?.title || 'İlan bilgisi bulunamadı'}
                              </Link>
                            </td>
                          </tr>
                          <tr>
                            <td className='fw-bold'>Başvuru Tarihi:</td>
                            <td>
                              {application.submittedAt 
                                ? new Date(application.submittedAt).toLocaleDateString('tr-TR') 
                                : 'Henüz tamamlanmadı'}
                            </td>
                          </tr>
                        </tbody>
                      </Table>
                    </Card.Body>
                  </Card>

                  <Card className='mb-3'>
                    <Card.Header>Puan Özeti</Card.Header>
                    <Card.Body>
                      <Table responsive bordered hover size='sm'>
                        <thead>
                          <tr>
                            <th>Kategori</th>
                            <th>Puan</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>Yayınlar</td>
                            <td>{application.pointsSummary?.publications || 0}</td>
                          </tr>
                          <tr>
                            <td>Atıflar</td>
                            <td>{application.pointsSummary?.citations || 0}</td>
                          </tr>
                          <tr>
                            <td>Projeler</td>
                            <td>{application.pointsSummary?.projects || 0}</td>
                          </tr>
                          <tr>
                            <td>Tezler</td>
                            <td>{application.pointsSummary?.theses || 0}</td>
                          </tr>
                          <tr>
                            <td>Diğer</td>
                            <td>{application.pointsSummary?.other || 0}</td>
                          </tr>
                          <tr className='fw-bold'>
                            <td>Toplam</td>
                            <td>{application.pointsSummary?.total || 0}</td>
                          </tr>
                        </tbody>
                      </Table>
                    </Card.Body>
                  </Card>
                </Col>
                
                <Col md={6}>
                  <Card className='mb-3'>
                    <Card.Header>Kriter Kontrolü</Card.Header>
                    <Card.Body>
                      <Table responsive bordered size='sm'>
                        <tbody>
                          <tr>
                            <td>Toplam Puan Sağlandı mı?</td>
                            <td>
                              <Badge bg={application.criteriaCheck?.totalPointsMet ? 'success' : 'danger'}>
                                {application.criteriaCheck?.totalPointsMet ? 'Evet' : 'Hayır'}
                              </Badge>
                            </td>
                          </tr>
                          <tr>
                            <td>Toplam Makale Sayısı Yeterli mi?</td>
                            <td>
                              <Badge bg={application.criteriaCheck?.totalArticlesMet ? 'success' : 'danger'}>
                                {application.criteriaCheck?.totalArticlesMet ? 'Evet' : 'Hayır'}
                              </Badge>
                            </td>
                          </tr>
                          <tr>
                            <td>Ana Yazar Kriteri Sağlandı mı?</td>
                            <td>
                              <Badge bg={application.criteriaCheck?.mainAuthorMet ? 'success' : 'danger'}>
                                {application.criteriaCheck?.mainAuthorMet ? 'Evet' : 'Hayır'}
                              </Badge>
                            </td>
                          </tr>
                          <tr>
                            <td>A1-A4 Makale Kriteri Sağlandı mı?</td>
                            <td>
                              <Badge bg={application.criteriaCheck?.a1a4Met ? 'success' : 'danger'}>
                                {application.criteriaCheck?.a1a4Met ? 'Evet' : 'Hayır'}
                              </Badge>
                            </td>
                          </tr>
                          <tr>
                            <td>Proje Kriteri Sağlandı mı?</td>
                            <td>
                              <Badge bg={application.criteriaCheck?.projectMet ? 'success' : 'danger'}>
                                {application.criteriaCheck?.projectMet ? 'Evet' : 'Hayır'}
                              </Badge>
                            </td>
                          </tr>
                          <tr>
                            <td>Tez Kriteri Sağlandı mı?</td>
                            <td>
                              <Badge bg={application.criteriaCheck?.thesisMet ? 'success' : 'danger'}>
                                {application.criteriaCheck?.thesisMet ? 'Evet' : 'Hayır'}
                              </Badge>
                            </td>
                          </tr>
                          <tr>
                            <td>Asgari Puan Kriteri Sağlandı mı?</td>
                            <td>
                              <Badge bg={application.criteriaCheck?.minPointsMet ? 'success' : 'danger'}>
                                {application.criteriaCheck?.minPointsMet ? 'Evet' : 'Hayır'}
                              </Badge>
                            </td>
                          </tr>
                          <tr className='fw-bold'>
                            <td>Genel Sonuç</td>
                            <td>
                              <Badge 
                                bg={application.criteriaCheck?.overallResult ? 'success' : 'danger'}
                                className='fs-6'
                              >
                                {application.criteriaCheck?.overallResult ? 'Kriterleri Karşılıyor' : 'Kriterleri Karşılamıyor'}
                              </Badge>
                            </td>
                          </tr>
                        </tbody>
                      </Table>
                    </Card.Body>
                  </Card>
                  
                  <Card className='mb-3'>
                    <Card.Header>Jüri Değerlendirmesi</Card.Header>
                    <Card.Body>
                        {hasExistingEvaluation && !isEditing ? (
                        <div>
                            <Alert variant="info" className="mb-3">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                <h5 className="mb-1">Değerlendirme Sonucunuz</h5>
                                <div className="mb-2">
                                    <Badge bg={existingResult === 'Olumlu' ? 'success' : 'danger'} className="fs-6">
                                    {existingResult}
                                    </Badge>
                                </div>
                                
                                {reportFileName && (
                                    <div className="mt-3">
                                    <h5 className="mb-1">Değerlendirme Raporunuz</h5>
                                    <div className="d-flex align-items-center">
                                        <FaFile className="text-success me-2" />
                                        <span>{reportFileName}</span>
                                        {application.juryEvaluations?.find(e => e.juryMember._id === userInfo._id)?.reportFileUrl && (
                                          <Button 
                                            variant="outline-success" 
                                            size="sm" 
                                            className="ms-2"
                                            onClick={() => {
                                              const evaluation = application.juryEvaluations.find(e => e.juryMember._id === userInfo._id);
                                              if (evaluation?.reportFileUrl) {
                                                const fileName = evaluation.reportFileUrl.split('/').pop();
                                                downloadFile(fileName);
                                              }
                                            }}
                                          >
                                            <FaDownload /> İndir
                                          </Button>
                                        )}
                                    </div>
                                    </div>
                                )}
                                </div>
                                
                                <Button 
                                variant="success" 
                                className="align-self-start"
                                onClick={handleToggleEdit}
                                >
                                <FaEdit className="me-2"/>
                                 Düzenle
                                </Button>
                            </div>
                            </Alert>
                        </div>
                        ) : (
                        <form onSubmit={handleSubmitEvaluation}>
                            <div className='mb-3'>
                            <label className='fw-bold mb-2'>Değerlendirme Sonucu</label>
                            <div className='mb-2'>
                                <div className='form-check mb-2'>
                                <input
                                    className='form-check-input'
                                    type='radio'
                                    id='result-positive'
                                    value='Olumlu'
                                    checked={result === 'Olumlu'}
                                    onChange={(e) => setResult(e.target.value)}
                                />
                                <label className='form-check-label' htmlFor='result-positive'>
                                    Olumlu
                                </label>
                                </div>
                                <div className='form-check'>
                                <input
                                    className='form-check-input'
                                    type='radio'
                                    id='result-negative'
                                    value='Olumsuz'
                                    checked={result === 'Olumsuz'}
                                    onChange={(e) => setResult(e.target.value)}
                                />
                                <label className='form-check-label' htmlFor='result-negative'>
                                    Olumsuz
                                </label>
                                </div>
                            </div>
                            </div>
                            
                            <div className='mb-3'>
                            <label className='fw-bold mb-2'>Değerlendirme Raporu</label>
                            {reportFileName ? (
                                <div className='border rounded p-3 mb-3'>
                                <div className='d-flex justify-content-between align-items-center'>
                                    <div className='d-flex align-items-center'>
                                    <FaFile className='text-success me-2' />
                                    <span className='text-truncate' style={{ maxWidth: '200px' }}>
                                        {reportFileName}
                                    </span>
                                    </div>
                                    <Button
                                    variant='outline-danger'
                                    size='sm'
                                    onClick={handleRemoveFile}
                                    >
                                    Değiştir
                                    </Button>
                                </div>
                                </div>
                            ) : (
                                <div className='border rounded p-3 mb-3'>
                                <input
                                    type='file'
                                    id='report-file'
                                    accept='.pdf,.doc,.docx'
                                    onChange={handleFileChange}
                                    className='form-control'
                                />
                                <small className='text-muted d-block mt-2'>
                                    PDF veya Word dosyası seçiniz.
                                </small>
                                </div>
                            )}
                            </div>
                            
                            <Alert variant='info' className='d-flex align-items-center mb-3'>
                            <FaInfo className='text-primary me-2' />
                            <div>
                                {hasExistingEvaluation 
                                ? 'Değerlendirmenizi güncelleyebilirsiniz.' 
                                : 'Lütfen rapor hazırlayarak yükleyiniz.'}
                            </div>
                            </Alert>
                            
                            <div className="d-flex gap-2">
                            {hasExistingEvaluation && (
                                <Button 
                                variant='secondary' 
                                className='flex-grow-1'
                                onClick={handleToggleEdit}
                                >
                                İptal
                                </Button>
                            )}
                            
                            <Button 
                                variant='success' 
                                type='submit' 
                                className='flex-grow-1'
                                disabled={isEvaluating || isUpdating || (!hasExistingEvaluation && !reportFile)}
                            >
                                {isEvaluating || isUpdating
                                ? 'Kaydediliyor...' 
                                : hasExistingEvaluation ? 'Değerlendirmeyi Güncelle' : 'Değerlendirmeyi Kaydet'}
                            </Button>
                            </div>
                        </form>
                        )}
                    </Card.Body>
                    </Card>
                </Col>
              </Row>
            </Tab>
            
            <Tab eventKey='publications' title='Yayınlar'>
              {application.publications && application.publications.length > 0 ? (
                <Table responsive striped bordered hover>
                  <thead>
                    <tr>
                      <th>Kategori</th>
                      <th>Başlık</th>
                      <th>Yazarlar</th>
                      <th>Dergi</th>
                      <th>Yıl</th>
                      <th>Ana Yazar</th>
                      <th>Puan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {application.publications.map((pub, index) => (
                      <tr key={index}>
                        <td>
                          <Badge bg='info'>{pub.category}</Badge>
                        </td>
                        <td>{pub.title}</td>
                        <td>{pub.authors}</td>
                        <td>{pub.journal}</td>
                        <td>{pub.year}</td>
                        <td>
                          <Badge bg={pub.isMainAuthor ? 'success' : 'secondary'}>
                            {pub.isMainAuthor ? 'Evet' : 'Hayır'}
                          </Badge>
                        </td>
                        <td>{pub.points}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <Alert variant='info'>Yayın eklenmemiş</Alert>
              )}
            </Tab>
            
            <Tab eventKey='citations' title='Atıflar'>
              {application.citations && application.citations.length > 0 ? (
                <Table responsive striped bordered hover>
                  <thead>
                    <tr>
                      <th>Kategori</th>
                      <th>Yayın Başlığı</th>
                      <th>Atıf Sayısı</th>
                      <th>Puan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {application.citations.map((citation, index) => (
                      <tr key={index}>
                        <td>
                          <Badge bg='info'>{citation.category}</Badge>
                        </td>
                        <td>{citation.publicationTitle}</td>
                        <td>{citation.count}</td>
                        <td>{citation.points}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <Alert variant='info'>Atıf eklenmemiş</Alert>
              )}
            </Tab>
            
            <Tab eventKey='projects' title='Projeler'>
              {application.projects && application.projects.length > 0 ? (
                <Table responsive striped bordered hover>
                  <thead>
                    <tr>
                      <th>Kategori</th>
                      <th>Başlık</th>
                      <th>Fon Kaynağı</th>
                      <th>Yıl</th>
                      <th>Bütçe</th>
                      <th>Puan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {application.projects.map((project, index) => (
                      <tr key={index}>
                        <td>
                          <Badge bg='info'>{project.category}</Badge>
                        </td>
                        <td>{project.title}</td>
                        <td>{project.fundingAgency}</td>
                        <td>{project.year}</td>
                        <td>{project.budget ? `${project.budget.toLocaleString('tr-TR')} TL` : '-'}</td>
                        <td>{project.points}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <Alert variant='info'>Proje eklenmemiş</Alert>
              )}
            </Tab>
            
            <Tab eventKey='theses' title='Tezler'>
              {application.theses && application.theses.length > 0 ? (
                <Table responsive striped bordered hover>
                  <thead>
                    <tr>
                      <th>Kategori</th>
                      <th>Öğrenci</th>
                      <th>Başlık</th>
                      <th>Yıl</th>
                      <th>Puan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {application.theses.map((thesis, index) => (
                      <tr key={index}>
                        <td>
                          <Badge bg='info'>{thesis.category}</Badge>
                        </td>
                        <td>{thesis.studentName}</td>
                        <td>{thesis.title}</td>
                        <td>{thesis.year}</td>
                        <td>{thesis.points}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <Alert variant='info'>Tez eklenmemiş</Alert>
              )}
            </Tab>
            
            <Tab eventKey='documents' title='Belgeler'>
              {application.documents && application.documents.length > 0 ? (
                <Table responsive striped bordered hover>
                  <thead>
                    <tr>
                      <th>Belge Adı</th>
                      <th>Yükleme Tarihi</th>
                      <th>İşlem</th>
                    </tr>
                  </thead>
                  <tbody>
                    {application.documents.map((doc, index) => (
                      <tr key={index}>
                        <td>{doc.type}</td>
                        <td>{new Date(doc.uploadedAt).toLocaleDateString('tr-TR')}</td>
                        <td>
                        <Button 
                        variant="outline-success" 
                        size="sm"
                        onClick={() => {
                          const fileName = doc.fileUrl.split('/').pop().split('\\').pop();
                          downloadFile(fileName);
                        }}
                        >
                          <FaDownload className="me-1" /> İndir
                        </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <Alert variant='info'>Belge eklenmemiş</Alert>
              )}
            </Tab>
          </Tabs>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default JuryApplicationDetailsScreen;