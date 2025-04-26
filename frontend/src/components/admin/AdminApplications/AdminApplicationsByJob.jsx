import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Container, Row, Col, Table, Button, Badge, Dropdown, Card, Alert, Modal, Spinner } from 'react-bootstrap';
import { FaEye, FaFilter, FaSignOutAlt } from 'react-icons/fa';
import { useGetJobApplicationsQuery, useDeleteApplicationMutation } from '../../../slices/applicationsApiSlice';
import { useGetJobByIdQuery } from '../../../slices/jobsApiSlice';
import { formatDate } from '../../../utils/helpers';
import { toast } from 'react-toastify';
import BackButton from '../../common/BackButton';
import { getStatusBadge, getPositionBadge } from '../../../utils/badges';
import Loader from '../../common/Loader';

const JobApplicationsList = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('Tümü');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [applicationToDelete, setApplicationToDelete] = useState(null);
  
  const { data: jobData, isLoading: isJobLoading } = useGetJobByIdQuery(id);
  
  const { data: applicationsData, isLoading: isApplicationsLoading, isError, error, refetch } = useGetJobApplicationsQuery(id);
  
  const [deleteApplication, { isLoading: isDeleting }] = useDeleteApplicationMutation();
  
  const isLoading = isJobLoading || isApplicationsLoading;
  
  const handleViewApplication = (applicationId) => {
    navigate(`/admin/applications/${applicationId}`);
  };
  
  const handleGoBack = () => {
    navigate('/admin/jobs');
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
  
  const applications = applicationsData?.applications || [];
  
  const filteredApplications = applications.filter(application => {
    const matchesStatus = statusFilter === 'Tümü' || application.status === statusFilter;
    const matchesSearch = 
      ((application.candidateId?.name + ' ' + application.candidateId?.surname) || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (application.academicFieldId?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });
  
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
        <BackButton />
      </Container>
    );
  }

  return (
    <Container fluid className='mt-4 mb-5'>
      <div className='mb-4'>
      <BackButton />
        <div className='text-center'>
          <h1 className='h2'>İlan Başvuruları</h1>
          <p className='lead'>
            {jobData ? jobData.title : 'İlan ID: ' + id}
          </p>
          {jobData && (
            <div className='d-flex justify-content-center gap-3 text-muted'>
              <span>{jobData.department?.name || 'Bölüm belirtilmemiş'}</span>
              <span>•</span>
              <span>{getPositionBadge(jobData.position)}</span>
              <span>•</span>
              <span>Son Başvuru: {formatDate(jobData.endDate)}</span>
            </div>
          )}
        </div>
      </div>      
      <Card>
        <Card.Header>
          <Row className='align-items-center'>
            <Col>
              <h3 className='mb-0'>Başvurular</h3>
              <small className='text-muted'>Toplam: {applications.length}</small>
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
                  placeholder='Aday adı veya akademik alan ara...'
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
                  <Dropdown.Item onClick={() => setStatusFilter('Beklemede')}>Beklemede</Dropdown.Item>
                  <Dropdown.Item onClick={() => setStatusFilter('Onaylandı')}>Onaylandı</Dropdown.Item>
                  <Dropdown.Item onClick={() => setStatusFilter('Reddedildi')}>Reddedildi</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </Col>
          </Row>
          
          {filteredApplications.length > 0 ? (
            <div className='table-responsive'>
              <Table hover bordered>
                <thead className='table-light'>
                  <tr>
                    <th>Aday</th>
                    <th>Akademik Alan</th>
                    <th>Pozisyon</th>
                    <th>Başvuru Tarihi</th>
                    <th>Durum</th>
                    <th>İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredApplications.map(application => (
                    <tr key={application._id}>
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
          ) : (
            <Alert variant='info' className='text-center'>
              {applications.length === 0 
                ? 'Bu ilan için henüz başvuru yapılmamış.' 
                : 'Kriterlere uygun başvuru bulunamadı.'}
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
            {' '}adayının başvurusunu silmek istediğinize emin misiniz?
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

export default JobApplicationsList;