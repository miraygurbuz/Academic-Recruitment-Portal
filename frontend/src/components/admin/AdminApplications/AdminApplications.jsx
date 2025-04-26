import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Table, Button, Badge, Dropdown, Card, Alert, Modal, Spinner } from 'react-bootstrap';
import { FaEye, FaFilter, FaSignOutAlt } from 'react-icons/fa';
import { useGetApplicationsQuery, useDeleteApplicationMutation } from '../../../slices/applicationsApiSlice';
import { formatDate } from '../../../utils/helpers'
import { toast } from 'react-toastify';
import Pager from '../../common/Pager/Pager';
import { getStatusBadge, getPositionBadge } from '../../../utils/badges';
import Loader from '../../common/Loader';

const ApplicationsList = () => {
    const navigate = useNavigate();
    const [statusFilter, setStatusFilter] = useState('Tümü');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [applicationToDelete, setApplicationToDelete] = useState(null);
    
    const { data, isLoading, isError, error, refetch } = useGetApplicationsQuery({
      populate: ['jobId', 'candidateId', 'academicFieldId']
    });
    const [deleteApplication, { isLoading: isDeleting }] = useDeleteApplicationMutation();
    
    const handleViewApplication = (applicationId) => {
      navigate(`/admin/applications/${applicationId}`);
    };
    
    const handleShowDeleteModal = (application) => {
      setApplicationToDelete(application);
      setShowDeleteModal(true);
    };
    
    const handleDeleteConfirm = async () => {
      if (!applicationToDelete) return;
      
      try {
        await deleteApplication(applicationToDelete._id).unwrap();
        setShowDeleteModal(false);
        refetch();
        toast.success('Başvuru başarıyla silindi.');
      } catch (err) {
        toast.error(`Başvuru silinirken hata: ${err.message || 'Bilinmeyen hata'}`);
        setShowDeleteModal(false);
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
      return new Date(b.submittedAt) - new Date(a.submittedAt);
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
        <Loader />
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
                        <th>İşlemler</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentApplications.map(application => (
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
                          <td>{formatDate(application.submittedAt)}</td>
                          <td>{getStatusBadge(application.status)}</td>
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
                              {application.status === 'Beklemede' && (
                                <Button 
                                  size='sm' 
                                  variant='outline-danger'
                                  onClick={() => handleShowDeleteModal(application)}
                                  title='Başvuruyu Sil'
                                >
                                  <FaSignOutAlt />
                                </Button>
                              )}
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
        
        <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Başvuruyu Sil</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>
              <strong>
                {applicationToDelete?.candidateId?.name} {applicationToDelete?.candidateId?.surname}
              </strong> 
              {' '}adayının{' '}
              <strong>{applicationToDelete?.jobId?.title}</strong> ilanına yaptığı başvuruyu 
              silmek istediğinize emin misiniz?
            </p>
            <p className='text-danger'>
              Bu işlem geri alınamaz.
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
  
  export default ApplicationsList;