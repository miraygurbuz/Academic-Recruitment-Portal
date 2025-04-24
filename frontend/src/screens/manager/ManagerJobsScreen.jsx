import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Table, Button, Card, Alert, Form } from 'react-bootstrap';
import { FaUserFriends, FaEye, FaFileAlt, FaFilter } from 'react-icons/fa';
import { useGetJobsQuery } from '../../slices/jobsApiSlice';
import { formatDate } from '../../utils/helpers';
import Pager from '../../components/common/Pager/Pager';
import { getStatusBadge, getPositionBadge } from '../../utils/badges';
import Loader from '../../components/common/Loader';

const ManagerJobsScreen = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const { data: jobs, isLoading, isError, error} = useGetJobsQuery();
  
  const handleViewJob = (jobId) => {
    navigate(`/manager/jobs/${jobId}`);
  };
  
  const handleViewApplications = (jobId) => {
    navigate(`/manager/jobs/${jobId}/applications`);
  };
  
  const handleAssignJury = (jobId) => {
    navigate(`/manager/jobs/${jobId}/jury`);
  };

  const canAssignJury = (job) => {
    return job.status === 'Aktif';
  };

  const sortedJobs = [...(jobs || [])].sort((a, b) => {
    return new Date(b.createdAt) - new Date(a.createdAt);
  });
  
  const filteredJobs = sortedJobs?.filter(job => {
    const matchesSearch = 
      (job.title || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
      (job.department?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === '' || job.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) || [];
  
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredJobs.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredJobs.length / itemsPerPage);
  
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };
  
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);
  
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
          <p>İlanlar yüklenirken bir sorun oluştu: {error?.message || 'Bilinmeyen hata'}</p>
        </Alert>
      </Container>
    );
  }
  
  return (
    <Container fluid className='mt-4 mb-5'>
      <div className='text-center mb-4'>
        <h1 className='h2'>İlan Yönetimi</h1>
      </div>      
      <Card>
        <Card.Header>
          <Row className='align-items-center'>
            <Col>
              <h3 className='mb-0'>İlanlar</h3>
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
                  placeholder='İlan başlığı veya bölüm ara...'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </Col>
            <Col md={6}>
              <Form.Select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
                aria-label="Durum Filtresi"
              >
                <option value="">Tüm Durumlar</option>
                <option value="Aktif">Aktif</option>
                <option value="Biten">Biten</option>
                <option value="Değerlendirme">Değerlendirme</option>
              </Form.Select>
            </Col>
          </Row>
          {filteredJobs.length > 0 ? (
            <>
              <div className='table-responsive'>
                <Table hover bordered>
                  <thead className='table-light'>
                    <tr>
                      <th>İlan Başlığı</th>
                      <th>Bölüm</th>
                      <th>Pozisyon</th>
                      <th>Durum</th>
                      <th>Tarihler</th>
                      <th>İşlemler</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.map(job => (
                      <tr key={job._id}>
                        <td>{job.title || 'Başlıksız İlan'}</td>
                        <td>
                          <div>{job.department?.name || 'Bölüm Bilgisi Yok'}</div>
                          <small className='text-muted'>
                            {job.department?.faculty?.name || 'Fakülte Bilgisi Yok'}
                          </small>
                        </td>
                        <td>{getPositionBadge(job.position || 'Belirtilmemiş')}</td>
                        <td>{getStatusBadge(job.status || 'Bilinmeyen')}</td>
                        <td>
                          <div>
                            <small className='fw-bold'>Başlangıç: </small> 
                            {job.startDate ? formatDate(job.startDate) : 'Tarih Yok'}
                          </div>
                          <div>
                            <small className='fw-bold'>Bitiş: </small> 
                            {job.endDate ? formatDate(job.endDate) : 'Tarih Yok'}
                          </div>
                        </td>
                        <td>
                          <div className='d-flex gap-1'>
                            <Button 
                              size='sm'
                              variant='light'
                              className='border'
                              onClick={() => handleViewJob(job._id)}
                              title='İlanı Görüntüle'
                            >
                              <FaEye />
                            </Button>
                            <Button 
                              size='sm' 
                              variant='light'
                              className='border'
                              onClick={() => handleViewApplications(job._id)}
                              title='Başvuruları Görüntüle'
                            >
                              <FaFileAlt />
                            </Button>
                            <Button 
                              size='sm' 
                              variant={canAssignJury(job) ? 'success' : 'secondary'}
                              className='border'
                              onClick={() => handleAssignJury(job._id)}
                              title='Jüri Ata'
                              disabled={!canAssignJury(job)}
                            >
                              <FaUserFriends />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
              <Pager 
                currentPage={currentPage} 
                totalPages={totalPages} 
                onPageChange={handlePageChange} 
                variant='success'
              /> 
              <div className='text-center mt-2 text-muted'>
                <small>
                  Toplam {filteredJobs.length} ilandan {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredJobs.length)} arası gösteriliyor
                </small>
              </div>
            </>
          ) : (
            <Alert variant='info' className='text-center'>
              Kriterlere uygun ilan bulunamadı.
            </Alert>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ManagerJobsScreen;