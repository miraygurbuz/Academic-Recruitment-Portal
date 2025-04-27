import { useState } from 'react';
import { Container, Row, Col, Card, Table, Badge, Button, Tabs, Tab, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { 
  useGetApplicationByIdQuery, 
  useCalculateApplicationPointsQuery,
  useCheckApplicationCriteriaQuery 
} from '../../slices/applicationsApiSlice';
import ApplicationStatusActions from './ApplicationStatusActions';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import BackButton from '../../components/common/BackButton';
import Loader from '../common/Loader';
import { formatDate } from '../../utils/helpers';
import { FaDownload, FaEye } from 'react-icons/fa';
import PreviewModal from '../../components/common/PreviewModal';

const ApplicationDetails = ({ applicationId, onBack }) => {
  const id = applicationId;
  const { userInfo } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState('overview');
  const { data: application, isLoading, refetch, error } = useGetApplicationByIdQuery(id);
  const { refetch: refetchPoints } = useCalculateApplicationPointsQuery(id);
  const { refetch: refetchCriteria } = useCheckApplicationCriteriaQuery(id);
  
  const [isModalVisible, setModalVisible] = useState(false);
  const [modalFileUrl, setModalFileUrl] = useState('');
 
  const downloadFile = (fileUrl) => {
    const downloadUrl = `/api/applications/download?url=${encodeURIComponent(fileUrl)}`;
    
    fetch(downloadUrl)
      .then(response => {
        if (!response.ok) {
          throw new Error('Dosya indirilemedi');
        }
        return response.json();
      })
      .then(({ signedUrl }) => {
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = signedUrl;
        a.target = '_blank';
        document.body.appendChild(a);
        a.click();
        
        setTimeout(() => {
          document.body.removeChild(a);
        }, 100);
      })
      .catch(error => {
        toast.error('Dosya indirilemedi');
      });
  };
  
  const handlePreview = (fileUrl) => {
    setModalVisible(true);
    setModalFileUrl(fileUrl);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setModalFileUrl('');
  };

  const recalculatePoints = async () => {
    try {
      await refetchPoints();
      await refetchCriteria();
      await refetch();
      toast.success('Puanlar yeniden hesaplandı');
    } catch (err) {
      toast.error('Bir hata oluştu');
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await refetchPoints();
      await refetchCriteria();
      await refetch();
      toast.success(`Başvuru durumu "${newStatus}" olarak güncellendi`);
    } catch (error) {
      toast.error('Başvuru güncellenirken bir hata oluştu');
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
          Başvuru yüklenirken bir hata oluştu: {error.message || 'Bilinmeyen hata'}
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
            Başvuru Detayları - #{application._id.substring(0, 8)}
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
                            <Link to={`/${userInfo?.role === 'Admin' ? 'admin' : 
                                         userInfo?.role === 'Yönetici' ? 'manager' : 
                                         userInfo?.role === 'Jüri Üyesi' ? 'jury' : 'admin'}/jobs/${application.jobId?._id}`} 
                                    className='text-success fw-bold'>
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
                          <tr>
                            <td className='fw-bold'>Sonuçlanma Tarihi:</td>
                            <td>
                              {application.completedAt 
                                ? new Date(application.completedAt).toLocaleDateString('tr-TR') 
                                : 'Sonuçlanmadı'}
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
                      
                      <Button 
                        variant='outline-success' 
                        size='sm' 
                        className='mt-2'
                        onClick={recalculatePoints}
                      >
                        Puanları Hesapla
                      </Button>
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
                    <Card.Header>Jüri Değerlendirmeleri</Card.Header>
                    <Card.Body>
                      {application.juryEvaluations && application.juryEvaluations.length > 0 ? (
                        <Table responsive bordered size='sm'>
                          <thead>
                            <tr>
                              <th>Jüri Üyesi</th>
                              <th>Sonuç</th>
                              <th>Değerlendirme Tarihi</th>
                              <th>İşlemler</th>
                            </tr>
                          </thead>
                          <tbody>
                            {application.juryEvaluations.map((evaluation, index) => (
                              <tr key={index}>
                                <td>{evaluation.juryMember?.name} {evaluation.juryMember?.surname}</td>
                                <td>
                                  <Badge 
                                    bg={evaluation.result === 'Olumlu' ? 'success' : 'danger'}
                                  >
                                    {evaluation.result}
                                  </Badge>
                                </td>
                                <td>{formatDate(evaluation.evaluatedAt)}</td>
                                <td>
                                  {evaluation.reportFileUrl ? (
                                    <div className="d-flex">
                                      <Button 
                                        variant='outline-success' 
                                        size='sm'
                                        className='me-1'
                                        onClick={() => downloadFile(evaluation.reportFileUrl)}
                                      >
                                        <FaDownload /> 
                                      </Button>
                                      <Button 
                                        variant='outline-success' 
                                        size='sm'
                                        onClick={() => handlePreview(evaluation.reportFileUrl)}
                                      >
                                        <FaEye /> 
                                      </Button>
                                    </div>
                                  ) : (
                                    <Badge bg="secondary">Rapor Yok</Badge>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      ) : (
                        <Alert variant='info'>Jüri değerlendirmesi yapılmamış</Alert>
                      )}
                    </Card.Body>
                  </Card>
                                
                  <ApplicationStatusActions
                    application={application} 
                    userRole={userInfo.role}
                    onStatusChange={handleStatusChange}/>
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
                      <th>İşlemler</th>
                    </tr>
                  </thead>
                  <tbody>
                    {application.documents.map((doc, index) => (
                      <tr key={index}>
                        <td>{doc.type}</td>
                        <td>{formatDate(doc.uploadedAt)}</td>
                        <td>
                          <div className="d-flex">
                            <Button 
                              variant="outline-success" 
                              size="sm"
                              className="me-1"
                              onClick={() => downloadFile(doc.fileUrl)}
                            >
                              <FaDownload /> 
                            </Button>
                            <Button 
                              variant="outline-success" 
                              size="sm"
                              onClick={() => handlePreview(doc.fileUrl)}
                            >
                              <FaEye /> 
                            </Button>
                          </div>
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
      
      {isModalVisible && (
        <PreviewModal
          fileUrl={modalFileUrl}
          onClose={handleCloseModal}
        />
      )}
    </Container>
  );
};

ApplicationDetails.defaultProps = {
  onBack: null,
};

export default ApplicationDetails;