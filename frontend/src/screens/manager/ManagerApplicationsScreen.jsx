import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Table, Button, Badge, Dropdown, Card, Alert } from 'react-bootstrap';
import { FaEye, FaFilter, FaFilePdf } from 'react-icons/fa';
import { useGetApplicationsQuery } from '../../slices/applicationsApiSlice';
import { formatDate } from '../../utils/helpers'
import { getStatusBadge, getPositionBadge } from '../../utils/badges';
import Pager from '../../components/common/Pager/Pager';
import Loader from '../../components/common/Loader';

const ManagerApplicationsList = () => {
    const navigate = useNavigate();
    const [statusFilter, setStatusFilter] = useState('Tümü');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
 
    const { data, isLoading, isError, error, refetch } = useGetApplicationsQuery({
      populate: ['jobId', 'candidateId', 'academicFieldId', 'jury']
    });
      
    const handleViewApplication = (applicationId) => {
      navigate(`/manager/applications/${applicationId}`);
    };
    
    const handleViewPDF = (applicationId) => {
      navigate(`/manager/applications/${applicationId}/PDF`);
    };      
    
const getJuryEvaluationStatus = (application) => {
  const job = application.jobId;
  
  if (!job || !job.juryMembers || job.juryMembers.length === 0) {
    return { status: 'Atanmadı', badge: <Badge bg='secondary'>Jüri Atanmadı</Badge> };
  }
  
  const totalJuryMembers = job.juryMembers.length;
  
  const juryEvaluations = application.juryEvaluations || [];
  
  if (juryEvaluations.length === 0) {
    return { 
      status: 'Başlamadı', 
      badge: <Badge bg='warning' text='dark'>Değerlendirme Başlamadı</Badge>,
      progress: 0
    };
  }
  
  const completedEvaluations = juryEvaluations.filter(evaluation => 
    evaluation.result === 'Olumlu' || evaluation.result === 'Olumsuz'
  ).length;
  
  if (completedEvaluations >= totalJuryMembers) {
    return { 
      status: 'Tamamlandı', 
      badge: <Badge bg='success'>Değerlendirme Tamamlandı</Badge>,
      progress: 100,
      evaluations: juryEvaluations,
      results: {
        positive: juryEvaluations.filter(e => e.result === 'Olumlu').length,
        negative: juryEvaluations.filter(e => e.result === 'Olumsuz').length,
        total: completedEvaluations
      }
    };
  } 

  else {
    const progress = Math.round((completedEvaluations / totalJuryMembers) * 100);
    return { 
      status: 'Devam Ediyor', 
      badge: <Badge bg='info' text='dark'>Değerlendirme Sürüyor (%{progress})</Badge>,
      progress: progress,
      evaluations: juryEvaluations,
      results: {
        positive: juryEvaluations.filter(e => e.result === 'Olumlu').length,
        negative: juryEvaluations.filter(e => e.result === 'Olumsuz').length,
        pending: juryEvaluations.filter(e => e.result === 'Beklemede').length,
        total: juryEvaluations.length
      }
    };
  }
};
  
    const applications = data?.applications || [];
    
    const filteredApplications = applications.filter(application => {
      const matchesStatus = statusFilter === 'Tümü' || application.status === statusFilter;
      const matchesSearch = 
        (application.jobId?.title || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
        ((application.candidateId?.name + ' ' + application.candidateId?.surname) || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (application.academicFieldId?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
      return matchesStatus && matchesSearch;
    });
    
    const sortedApplications = [...filteredApplications].sort((a, b) => {
      return new Date(b.submittedAt || b.createdAt) - new Date(a.submittedAt || a.createdAt);
    });
    
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentApplications = sortedApplications.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(sortedApplications.length / itemsPerPage);
    
    const handlePageChange = (pageNumber) => {
      setCurrentPage(pageNumber);
    };
    
    if (isLoading) {
      return (
        <Container className='mt-4 text-center'>
          <Loader/>
        </Container>
      );
    }
    
    if (isError) {
      return (
        <Container className='mt-4'>
          <Alert variant='danger'>
            <Alert.Heading>Hata!</Alert.Heading>
            <p>Başvurular yüklenirken bir sorun oluştu: {error?.message || 'Bilinmeyen hata'}</p>
            {error?.data && (
              <pre className='mt-3 p-2 bg-light'>
                {JSON.stringify(error.data, null, 2)}
              </pre>
            )}
          </Alert>
        </Container>
      );
    }
  
    return (
      <Container fluid className='mt-4 mb-5'>
        <div className='text-center mb-4'>
          <h1 className='h2'>Başvuru Yönetimi</h1>
        </div>      
        <Card>
          <Card.Header>
            <Row className='align-items-center'>
              <Col>
                <h3 className='mb-0'>Son Başvurular</h3>
              </Col>
            </Row>
          </Card.Header>
          
          <Card.Body>
            <Row className='mb-3'>
              <Col md={6} className='mb-2 mb-md-0'>
                <div className='input-group'>
                  <span className='input-group-text'>
                    <FaFilter />
                  </span>
                  <input
                    type='text'
                    className='form-control'
                    placeholder='İlan, aday adı veya akademik alan ara...'
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </Col>
              <Col md={6} className='d-flex justify-content-md-end gap-2'>
                <Dropdown>
                  <Dropdown.Toggle variant='outline-secondary'>
                    Durum: {statusFilter}
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item onClick={() => setStatusFilter('Tümü')}>Tümü</Dropdown.Item>
                    <Dropdown.Item onClick={() => setStatusFilter('Beklemede')}>Beklemede</Dropdown.Item>
                    <Dropdown.Item onClick={() => setStatusFilter('Onaylandı')}>Onaylandı</Dropdown.Item>
                    <Dropdown.Item onClick={() => setStatusFilter('Reddedildi')}>Reddedildi</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
                <Button 
                  variant='outline-success'
                  onClick={() => refetch()}
                >
                  Yenile
                </Button>
              </Col>
            </Row>
            
            {currentApplications.length > 0 ? (
              <>
                <div className='table-responsive'>
                  <Table hover bordered>
                    <thead className='table-light'>
                      <tr>
                        <th>İlan Başlığı</th>
                        <th>Aday</th>
                        <th>Akademik Alan</th>
                        <th>Pozisyon</th>
                        <th>Tarih</th>
                        <th>Durum</th>
                        <th>Jüri Değerlendirmesi</th>
                        <th>İşlemler</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentApplications.map(application => {
                        const juryStatus = getJuryEvaluationStatus(application);
                        
                        return (
                          <tr key={application._id}>
                            <td>
                              <div className='fw-medium'>{application.jobId?.title || 'Bilinmeyen İlan'}</div>
                              <small className='text-muted'>
                                {application.jobId?.department?.name || 'Bölüm bilgisi yok'}
                              </small>
                            </td>
                            <td>
                              {application.candidateId ? (
                                <div>
                                  <div className='fw-medium'>
                                    {application.candidateId.name} {application.candidateId.surname}
                                  </div>
                                  <small className='text-muted'>{application.candidateId.email}</small>
                                </div>
                              ) : (
                                'Aday bilgisi yok'
                              )}
                            </td>
                            <td>{application.academicFieldId?.name || 'Belirtilmemiş'}</td>
                            <td>{getPositionBadge(application.positionType)}</td>
                            <td>{formatDate(application.submittedAt || application.createdAt)}</td>
                            <td>{getStatusBadge(application.status)}</td>
                            <td>
                              <div className='d-flex flex-column align-items-center'>
                                {juryStatus.badge}
                                {juryStatus.status !== 'Atanmadı' && juryStatus.status !== 'Tamamlandı' && (
                                  <div className='progress w-100 mt-1' style={{ height: '5px' }}>
                                    <div 
                                      className='progress-bar' 
                                      role='progressbar'
                                      style={{ width: `${juryStatus.progress}%` }}
                                      aria-valuenow={juryStatus.progress}
                                      aria-valuemin='0'
                                      aria-valuemax='100'
                                    ></div>
                                  </div>
                                )}
                              </div>
                            </td>
                            <td>
                              <div className='d-flex gap-1'>
                                <Button 
                                  size='sm'
                                  variant='light'
                                  className='border'
                                  onClick={() => handleViewApplication(application._id)}
                                  title='Başvuru Detayı'
                                >
                                  <FaEye />
                                </Button>
                                <Button 
                                  size='sm'
                                  variant='success'
                                  className='border'
                                  onClick={() => handleViewPDF(application._id)}
                                  title='PDF Görüntüle'
                                >
                                  <FaFilePdf />
                                </Button>                               
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </Table>
                </div>
                
                <Pager 
                  currentPage={currentPage} 
                  totalPages={totalPages} 
                  onPageChange={handlePageChange} 
                  variant='success' 
                />
                
                <div className='text-muted text-center mt-2'>
                  <small>
                    Toplam {sortedApplications.length} başvurudan {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, sortedApplications.length)} arası gösteriliyor
                  </small>
                </div>
              </>
            ) : (
              <Alert variant='info' className='text-center'>
                Kriterlere uygun başvuru bulunamadı.
              </Alert>
            )}
          </Card.Body>
        </Card>
      </Container>
    );
  };
  
  export default ManagerApplicationsList;