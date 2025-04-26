import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Table, Button, Badge, Dropdown, Card, Alert, Modal, Spinner } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash, FaEye, FaFileAlt, FaFilter } from 'react-icons/fa';
import { useGetJobsQuery, useUpdateJobStatusMutation, useDeleteJobMutation } from '../../slices/jobsApiSlice';
import { formatDate } from '../../utils/helpers';
import { toast } from 'react-toastify';
import { getStatusBadge, getPositionBadge } from '../../utils/badges';
import Pager from '../../components/common/Pager/Pager';
import Loader from '../../components/common/Loader';

const AdminJobsScreen = () => {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('Tümü');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [jobToDelete, setJobToDelete] = useState(null);
  
  const { data: jobs, isLoading, isError, error, refetch } = useGetJobsQuery();
  const [updateJobStatus] = useUpdateJobStatusMutation();
  const [deleteJob, { isLoading: isDeleting }] = useDeleteJobMutation();
  
  const handleCreateJob = () => {
    navigate('/admin/jobs/create');
  };
  
  const handleEditJob = (jobId) => {
    navigate(`/admin/jobs/${jobId}/edit`);
  };
  
  const handleViewJob = (jobId) => {
    navigate(`/admin/jobs/${jobId}`);
  };
  
  const handleViewApplications = (jobId) => {
    navigate(`/admin/jobs/${jobId}/applications`);
  };
  
  const handleUpdateStatus = async (jobId, newStatus) => {
    try {
      await updateJobStatus({ id: jobId, status: newStatus }).unwrap();
      refetch();
      toast.success('Durum güncellemesi başarılı!')
    } catch (err) {
      toast.error('İlan durumu güncellenirken hata:', err);
    }
  };
  
  const handleShowDeleteModal = (job) => {
    setJobToDelete(job);
    setShowDeleteModal(true);
  };
  
  const handleDeleteConfirm = async () => {
    if (!jobToDelete) return;
    
    try {
      await deleteJob(jobToDelete._id).unwrap();
      setShowDeleteModal(false);
      refetch();
      toast.success('İlan başarıyla silindi.');
    } catch (err) {
      toast.error(`İlan silinirken hata: ${err.message || 'Bilinmeyen hata'}`);
      setShowDeleteModal(false);
    }
  };
   
  const sortedJobs = [...(jobs || [])].sort((a, b) => {
    return new Date(b.createdAt) - new Date(a.createdAt);
  });
  
  const filteredJobs = sortedJobs?.filter(job => {
    const matchesStatus = statusFilter === 'Tümü' || job.status === statusFilter;
    const matchesSearch = 
      (job.title || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
      (job.department?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
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
  }, [statusFilter, searchTerm]);
  
  if (isLoading) {
    return (
      <Loader/>
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
            <Col xs='auto'>
              <Button variant='success' onClick={handleCreateJob}>
                <FaPlus className='me-2' /> Yeni İlan Oluştur
              </Button>
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
            <Col md={6} className='d-flex justify-content-md-end'>
              <Dropdown>
                <Dropdown.Toggle variant='outline-secondary'>
                  Durum: {statusFilter}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item onClick={() => setStatusFilter('Tümü')}>Tümü</Dropdown.Item>
                  <Dropdown.Item onClick={() => setStatusFilter('Aktif')}>Aktif</Dropdown.Item>
                  <Dropdown.Item onClick={() => setStatusFilter('Taslak')}>Taslak</Dropdown.Item>
                  <Dropdown.Item onClick={() => setStatusFilter('Biten')}>Biten</Dropdown.Item>
                  <Dropdown.Item onClick={() => setStatusFilter('Değerlendirme')}>Değerlendirme</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
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
                            {job.startDate ? formatDate(job.startDate, false) : 'Tarih Yok'}
                          </div>
                          <div>
                            <small className='fw-bold'>Bitiş: </small> 
                            {job.endDate ? formatDate(job.endDate, false) : 'Tarih Yok'}
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
                              onClick={() => handleEditJob(job._id)}
                              title='İlanı Düzenle'
                            >
                              <FaEdit />
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
                            <Dropdown>
                              <Dropdown.Toggle variant='light' className='border' size='sm' id={`dropdown-${job._id}`}>
                                Durum
                              </Dropdown.Toggle>
                              <Dropdown.Menu>
                                <Dropdown.Item onClick={() => handleUpdateStatus(job._id, 'Aktif')}>
                                  Aktif
                                </Dropdown.Item>
                                <Dropdown.Item onClick={() => handleUpdateStatus(job._id, 'Taslak')}>
                                  Taslak
                                </Dropdown.Item>
                                <Dropdown.Item onClick={() => handleUpdateStatus(job._id, 'Biten')}>
                                  Biten
                                </Dropdown.Item>
                                <Dropdown.Item onClick={() => handleUpdateStatus(job._id, 'Değerlendirme')}>
                                  Değerlendirme
                                </Dropdown.Item>
                              </Dropdown.Menu>
                            </Dropdown>
                            <Button 
                              size='sm' 
                              variant='outline-danger'
                              onClick={() => handleShowDeleteModal(job)}
                              title='İlanı Sil'
                            >
                              <FaTrash />
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
      
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>İlanı Sil</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            <strong>{jobToDelete?.title}</strong> ilanını silmek istediğinize emin misiniz?
          </p>
          <p className='text-danger'>
            Bu işlem geri alınamaz ve ilana ait tüm başvurular da silinecektir.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant='secondary' onClick={() => setShowDeleteModal(false)}>
            İptal
          </Button>
          <Button 
            variant='danger' 
            onClick={handleDeleteConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Spinner as='span' animation='border' size='sm' className='me-2' />
                Siliniyor...
              </>
            ) : (
              'Evet, Sil'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AdminJobsScreen;