import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useGetMyApplicationsQuery, useDeleteApplicationMutation } from '../../slices/applicationsApiSlice';
import { formatDate } from '../../utils/helpers';
import { FaEye, FaSignOutAlt } from 'react-icons/fa';
import { Container, Row, Col, Card, Table, Badge, Button, Spinner, Alert, Modal } from 'react-bootstrap';
import { toast } from 'react-toastify';

const MyApplicationsScreen = () => {
  const { data: applications, isLoading, isError, error, refetch } = useGetMyApplicationsQuery();
  const [deleteApplication, { isLoading: isDeleting }] = useDeleteApplicationMutation();
  
  const [showModal, setShowModal] = useState(false);
  const [selectedApplicationId, setSelectedApplicationId] = useState(null);

  const handleWithdrawalConfirm = async () => {
    try {
      await deleteApplication(selectedApplicationId).unwrap();
      setShowModal(false);
      refetch();
    } catch (err) {
        toast.error(`Bir hata meydana geldi: ${err.message}`);
    }
  };

  const openWithdrawalModal = (id) => {
    setSelectedApplicationId(id);
    setShowModal(true);
  };

  const getBadgeVariant = (status) => {
    switch (status) {
      case 'Beklemede':
        return 'warning';
      case 'Onaylandı':
        return 'success';
      case 'Reddedildi':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  if (isLoading) {
    return (
      <Container className='my-5 text-center'>
        <Spinner animation='border' />
        <p>Başvurularınız yükleniyor...</p>
      </Container>
    );
  }

  if (isError) {
    return (
      <Container className='my-5'>
        <Alert variant='danger'>
          Başvurularınız yüklenirken bir hata oluştu: {error?.data?.message || error?.error || 'Bilinmeyen hata'}
        </Alert>
      </Container>
    );
  }

  return (
    <Container className='my-5'>
      <Row>
        <Col>
          <h1 className='mb-4'>Başvurularım</h1>
          
          {applications && applications.length === 0 ? (
            <Card className='text-center p-5'>
              <Card.Body>
                <Card.Title>Henüz başvurunuz bulunmamaktadır</Card.Title>
                <Card.Text>
                  İlanlara göz atarak yeni bir başvuru oluşturabilirsiniz.
                </Card.Text>
                <Link to='/'>
                  <Button variant='success'>İlanları Görüntüle</Button>
                </Link>
              </Card.Body>
            </Card>
          ) : (
            <Card>
              <Card.Body>
                <Table responsive striped hover>
                  <thead>
                    <tr>
                      <th>İlan Başlığı</th>
                      <th>Pozisyon</th>
                      <th>Başvuru Tarihi</th>
                      <th>Durum</th>
                      <th>İşlemler</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications && applications.map((application) => (
                      <tr key={application._id}>
                        <td>{application.jobId?.title || 'İlan bulunamadı'}</td>
                        <td>{application.positionType}</td>
                        <td>{formatDate(application.submittedAt)}</td>
                        <td>
                          <Badge bg={getBadgeVariant(application.status)}>
                            {application.status}
                          </Badge>
                        </td>
                        <td>
                          <Link to={`/my-applications/${application._id}`}>
                            <Button variant="light" size='sm' className='me-2'>
                              <FaEye />
                            </Button>
                          </Link>
                          {application.status === 'Beklemede' && (
                            <Button 
                              variant='outline-danger' 
                              size='sm' 
                              onClick={() => openWithdrawalModal(application._id)}
                              disabled={isDeleting}
                            >
                              <FaSignOutAlt />
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Başvuru Geri Çekme</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Bu başvuruyu geri çekmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
        </Modal.Body>
        <Modal.Footer>
          <Button variant='secondary' onClick={() => setShowModal(false)}>
            İptal
          </Button>
          <Button 
            variant='danger' 
            onClick={handleWithdrawalConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Spinner
                  as='span'
                  animation='border'
                  size='sm'
                  role='status'
                  aria-hidden='true'
                  className='me-1'
                />
                İşleniyor...
              </>
            ) : (
              'Başvuruyu Geri Çek'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default MyApplicationsScreen;