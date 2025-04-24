import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Form, Card, Button, Badge, Spinner, Alert, Modal } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { 
  useGetJobByIdQuery, 
  useAssignJuryMembersMutation,
  useGetJobJuryMembersQuery,
  useClearJuryMembersMutation
} from '../../slices/jobsApiSlice';
import { useGetJuryMembersByDepartmentQuery } from '../../slices/usersApiSlice'
import Loader from '../../components/common/Loader';
import { FaTrash, FaExclamationTriangle } from 'react-icons/fa';

const ManagerAssignJuryScreen = () => {
  const { id: jobId } = useParams();
  const navigate = useNavigate();
  const [selectedJuryMembers, setSelectedJuryMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [showClearModal, setShowClearModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  
  const { data: job, isLoading: isJobLoading } = useGetJobByIdQuery(jobId);
  const { data: existingJuryMembers, isLoading: isExistingJuryLoading } = useGetJobJuryMembersQuery(jobId);
  const { data: juryMembers, isLoading: isJuryMembersLoading } = useGetJuryMembersByDepartmentQuery(
    job?.department?._id,
    { skip: !job?.department?._id }
  );
  const [assignJuryMembers, { isLoading: isAssigning }] = useAssignJuryMembersMutation();
  const [clearJuryMembers, { isLoading: isClearing }] = useClearJuryMembersMutation();
  
  useEffect(() => {
    if (existingJuryMembers?.length > 0) {
      const existingJuryIds = existingJuryMembers.map(jury => jury.user._id);
      setSelectedJuryMembers(existingJuryIds);
    }
  }, [existingJuryMembers]);
  
  const handleJurySelection = (juryId, juryName) => {
    if (selectedJuryMembers.includes(juryId)) {
      setSelectedJuryMembers(prev => prev.filter(id => id !== juryId));
      toast.info(`${juryName} jüri listesinden çıkarıldı.`);
    } else {
      if (selectedJuryMembers.length >= 5) {
        toast.warning('En fazla 5 jüri üyesi seçebilirsiniz!');
        return;
      }
      setSelectedJuryMembers(prev => [...prev, juryId]);
      toast.info(`${juryName} jüri listesine eklendi.`);
    }
  };
  
  const handleResetJury = () => {
    setSelectedJuryMembers([]);
    setShowResetModal(false);
    toast.info('Jüri listesi temizlendi.');
  };
  
  const handleClearJury = async () => {
    try {
      await clearJuryMembers(jobId).unwrap();
      toast.success('Jüri listesi başarıyla temizlendi!');
      setShowClearModal(false);
      window.location.href = `/manager/jobs/${jobId}`;
    } catch (error) {
      toast.error(
        error?.data?.message || 
        'Jüri listesi temizlenirken bir hata oluştu.'
      );
      setShowClearModal(false);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (selectedJuryMembers.length < 3) {
      toast.error('Lütfen en az 3 jüri üyesi seçin.');
      return;
    }
    
    try {
      await assignJuryMembers({ 
        id: jobId, 
        juryMemberIds: selectedJuryMembers 
      }).unwrap();
      
      toast.success('Jüri üyeleri başarıyla atandı!');
      navigate(`/manager/jobs/${jobId}`);
    } catch (error) {
      toast.error(
        error?.data?.message || 
        'Jüri ataması yapılırken bir hata oluştu.'
      );
    }
  };
  
  const filteredJuryMembers = juryMembers ? juryMembers.filter(jury => {
    const searchTermLower = searchTerm.toLowerCase();
    const nameMatch = `${jury.name} ${jury.surname}`.toLowerCase().includes(searchTermLower);
    const emailMatch = jury.email ? jury.email.toLowerCase().includes(searchTermLower) : false;
    const tcKimlikMatch = jury.tcKimlik ? 
      jury.tcKimlik.toString().includes(searchTermLower) : 
      false;
    return nameMatch || emailMatch || tcKimlikMatch;
  }) : [];
  
  if (isJobLoading || isJuryMembersLoading || isExistingJuryLoading) {
    return (
      <Container className='mt-4 text-center'>
        <Loader/>
      </Container>
    );
  }
  
  if (!job) {
    return (
      <Container className='mt-4'>
        <Alert variant='danger'>
          <Alert.Heading>Hata!</Alert.Heading>
          <p>İlan bulunamadı veya bilgileri yüklenemedi.</p>
        </Alert>
      </Container>
    );
  }
  
  if (juryMembers && juryMembers.length === 0) {
    return (
      <Container className='mt-4'>
        <Alert variant='warning'>
          <Alert.Heading>Jüri Üyesi Bulunamadı</Alert.Heading>
          <p>
            Bu bölüm için atanmış jüri üyesi bulunmamaktadır. 
            Lütfen önce admin panelinde rol yönetimi sayfasından jüri üyelerini belirleyin.
          </p>
          <div className='d-flex justify-content-end'>
          </div>
        </Alert>
      </Container>
    );
  }
  
  return (
    <Container fluid className='mt-4 mb-5'>
      <Modal show={showClearModal} onHide={() => setShowClearModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className='text-danger'>
            <FaExclamationTriangle className='me-2' />
            Jüri Üyelerini Sil
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Bu işlem, ilana atanmış tüm jüri üyelerini kaldıracak ve <strong>kaydedilecektir</strong>.</p>
          <p>Bu işlemi gerçekleştirmek istediğinize emin misiniz?</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant='secondary' onClick={() => setShowClearModal(false)}>
            İptal
          </Button>
          <Button 
            variant='danger' 
            onClick={handleClearJury}
            disabled={isClearing}
          >
            {isClearing ? (
              <>
                <Spinner animation='border' size='sm' className='me-2' />
                Siliniyor...
              </>
            ) : (
              'Evet, Tüm Jüri Üyelerini Sil'
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showResetModal} onHide={() => setShowResetModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Seçiminizi Temizle</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Şu anda seçili olan tüm jüri üyelerini listeden çıkarmak istediğinize emin misiniz?</p>
          <p className='text-muted'>Not: Bu işlem henüz kaydedilmeyecek, sadece seçiminiz temizlenecektir.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant='secondary' onClick={() => setShowResetModal(false)}>
            İptal
          </Button>
          <Button variant='primary' onClick={handleResetJury}>
            Evet, Seçimi Temizle
          </Button>
        </Modal.Footer>
      </Modal>

      <div className='text-center mb-4'>
        <h1 className='h2'>Jüri Ataması</h1>
        <p className='lead'>{job.title}</p>
        <Badge bg='success'>{job.department?.name || 'Bölüm Bilgisi Yok'}</Badge>
      </div>
      
      <Card className='shadow-sm'>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <div className='d-flex justify-content-between align-items-center mb-4'>
              <p className='lead mb-0'>
                Lütfen jüri üyelerini seçiniz
                <Badge pill bg='dark' className='ms-2'>
                  {selectedJuryMembers.length}/5 üye seçildi
                </Badge>
              </p>
              <div>
                {existingJuryMembers?.length > 0 && (
                  <Button 
                    variant='outline-danger' 
                    size='sm'
                    onClick={() => setShowClearModal(true)}
                    type='button'
                    className='me-2'
                    disabled={isClearing}
                  >
                    <FaTrash className='me-1' /> Tüm Jüriyi Sil
                  </Button>
                )}
                
                {selectedJuryMembers.length > 0 && (
                  <Button 
                    variant='outline-secondary' 
                    size='sm'
                    onClick={() => setShowResetModal(true)}
                    type='button'
                  >
                    Seçimi Temizle
                  </Button>
                )}
              </div>
            </div>
            
            <div className='text-center mb-3'>
              <small className='text-muted'>(En az 3, en fazla 5 jüri seçebilirsiniz)</small>
            </div>
            
            <Row className='mb-4'>
              <Col md={6} className='mx-auto'>
                <Form.Control
                  type='text'
                  placeholder='Jüri üyesi ara (ad, soyad, email, TC Kimlik)'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </Col>
            </Row>
            
            <Row xs={1} md={2} lg={3} className='g-3 mb-4'>
              {filteredJuryMembers.length > 0 ? (
                filteredJuryMembers.map((jury) => {
                  const selected = selectedJuryMembers.includes(jury._id);
                  return (
                    <Col key={jury._id}>
                      <Card
                        className={`h-100 ${selected ? 'border-success' : ''}`}
                        onClick={() => handleJurySelection(jury._id, `${jury.name} ${jury.surname}`)}
                        style={{ cursor: 'pointer' }}
                      >
                        <Card.Body className='d-flex flex-column align-items-center'>
                          <Card.Title className='mb-1 text-center'>{jury.name} {jury.surname}</Card.Title>
                          <Card.Text className='text-muted small'>
                            {jury.department?.name || 'Departman Bilgisi Yok'}
                          </Card.Text>
                          <Card.Text className='text-muted small'>
                            {jury.tcKimlik}
                          </Card.Text>
                          <Card.Text className='text-muted small'>{jury.email}</Card.Text>
                          {selected && (
                            <Badge bg='success' className='mt-2'>Seçildi</Badge>
                          )}
                        </Card.Body>
                      </Card>
                    </Col>
                  );
                })
              ) : (
                <Col xs={12} className='text-center py-5'>
                  <p className='text-muted'>
                    {searchTerm 
                      ? 'Arama kriterlerine uygun jüri üyesi bulunamadı.' 
                      : 'Bu bölüm için atanmış jüri üyesi bulunmamaktadır.'}
                  </p>
                </Col>
              )}
            </Row>
            
            <div className='d-flex flex-column gap-2'>
              <Button
                type='submit'
                variant='success'
                size='lg'
                disabled={isAssigning || selectedJuryMembers.length < 3}
              >
                {isAssigning ? (
                  <>
                    <Spinner animation='border' size='sm' className='me-2' />
                    Jüri Atanıyor...
                  </>
                ) : (
                  'Jüri Atamasını Tamamla'
                )}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ManagerAssignJuryScreen;