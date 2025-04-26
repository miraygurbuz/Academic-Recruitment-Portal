import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Card, Button, Row, Col, Alert, Tooltip, OverlayTrigger } from 'react-bootstrap';
import { FaShareAlt, FaCheck } from 'react-icons/fa';
import { useGetJobByIdQuery, useGetJobJuryMembersQuery } from '../../slices/jobsApiSlice';
import { formatDate } from '../../utils/helpers';
import { getStatusBadge } from '../../utils/badges';
import Loader from '../../components/common/Loader';
import BackButton from '../../components/common/BackButton';

const AdminJobDetailsScreen = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [copied, setCopied] = useState(false);
    
    const { data: job, isLoading, error } = useGetJobByIdQuery(id);
        const { data: juryMembers, isLoading: isJuryLoading } = useGetJobJuryMembersQuery(id);
    
    const handleEdit = () => {
        navigate(`/admin/jobs/${id}/edit`);
    };
    
    const handleShareUrl = () => {
        const currentUrl = window.location.href;
        const urlParts = currentUrl.split('/');
        const jobsIndex = urlParts.findIndex(part => part === 'jobs');
        if (jobsIndex !== -1 && jobsIndex + 1 < urlParts.length) {
            const jobId = urlParts[jobsIndex + 1];
            const shareUrl = `${window.location.origin}/jobs/${jobId}`;
            navigator.clipboard.writeText(shareUrl)
                .then(() => {
                    setCopied(true);
                    setTimeout(() => setCopied(false), 5000);
                })
                .catch(err => {
                    console.error('URL kopyalanamadı:', err);
                });
        } else {
            navigator.clipboard.writeText(currentUrl)
                .then(() => {
                    setCopied(true);
                    setTimeout(() => setCopied(false), 5000);
                })
                .catch(err => {
                    console.error('URL kopyalanamadı:', err);
                });
        }
    };
    
    if (isLoading || isJuryLoading) {
        return (
            <Container className='d-flex justify-content-center align-items-center' style={{ minHeight: '100vh' }}>
                <div className='text-center'>
                    <Loader />
                </div>
            </Container>
        );
    }

    if (error) {
        return (
            <Container className='d-flex justify-content-center align-items-center' style={{ minHeight: '100vh' }}>
                <Alert variant='danger' className='w-75'>
                    <Alert.Heading>Hata!</Alert.Heading>
                    <p>İlan bilgileri yüklenirken bir sorun oluştu: {error?.data?.message || error?.message || 'Bilinmeyen hata'}</p>
                    <BackButton />
                </Alert>
            </Container>
        );
    }

    if (!job) {
        return (
            <Container className='d-flex justify-content-center align-items-center' style={{ minHeight: '100vh' }}>
                <Alert variant='warning' className='w-75'>
                    <Alert.Heading>İlan Bulunamadı</Alert.Heading>
                    <p>Aradığınız ilan bulunamadı veya kaldırılmış olabilir.</p>
                    <BackButton />
                </Alert>
            </Container>
        );
    }

    const isActive = job.status === 'Aktif';
    const isExpired = new Date(job.endDate) < new Date();
    const text = {
        whiteSpace: 'pre-line',
        textAlign: 'left'
    };

    return (
        <Container fluid className='d-flex align-items-center justify-content-center py-4' style={{ minHeight: '100vh' }}>
            <Card className='shadow-lg p-4 position-relative' style={{ width: '21cm', minHeight: '29.7cm', background: 'white', display: 'flex', flexDirection: 'column' }}>
                <Card.Body style={{ flex: '1 1 auto' }}>
                    <Row className='mb-3'>
                        <Col>
                        <BackButton />
                        </Col>
                        <Col className='text-end'>
                            <OverlayTrigger
                                placement='top'
                                overlay={
                                    <Tooltip id='share-tooltip'>
                                        {copied ? 'URL Kopyalandı!' : 'URL\'yi Kopyala'}
                                    </Tooltip>
                                }
                            >
                                <Button 
                                    variant={copied ? 'success' : 'outline-secondary'} 
                                    className='me-2'
                                    onClick={handleShareUrl}
                                >
                                    {copied ? (
                                        <>
                                            <FaCheck className='me-1' /> Kopyalandı
                                        </>
                                    ) : (
                                        <>
                                            <FaShareAlt className='me-1' /> Paylaş
                                        </>
                                    )}
                                </Button>
                            </OverlayTrigger>
                        </Col>
                    </Row>

                    <div className='text-center mb-4'>
                        {getStatusBadge(job.status)}
                    </div>

                    <Card.Title className='fw-bold text-center fs-4'>{job.title}</Card.Title>
                    <div style={{...text, fontSize: '0.85rem', textAlign: 'center'}} className='mb-3'>
                        <span>Oluşturan: </span>{job.createdBy.name} {job.createdBy.surname}
                    </div>
                    <div style={text} className='mb-3'>
                            {job.description}
                    </div>
                    
                    <hr />

                    <Row className='mb-3'>
                        <Col xs={12} md={4} className='text-md-start'>
                            <strong>Fakülte:</strong> {job.department?.faculty?.name || 'Belirtilmemiş'}
                        </Col>
                        <Col xs={12} md={4} className='text-md-center'>
                            <strong>Bölüm:</strong> {job.department?.name || 'Belirtilmemiş'}
                        </Col>
                        <Col xs={12} md={4} className='text-md-end'>
                            <strong>Pozisyon:</strong> {job.position || 'Belirtilmemiş'}
                        </Col>
                    </Row>
                    
                    <Row className='mb-3'>
                        <Col xs={12} md={5}>
                            <strong>İlan Başlangıç:</strong> {formatDate(job.startDate)}
                        </Col>
                        <Col xs={12} md={2} className='d-none d-md-block'></Col>
                        <Col xs={12} md={5} className='text-md-end'>
                            <strong>Son Başvuru:</strong> {formatDate(job.endDate)}
                        </Col>
                    </Row>

                    <hr />
                    
                    <div className='mb-4'>
                        <div className='d-flex justify-content-between align-items-center mb-3'>
                            <h5 className='fw-bold m-0'>Jüri Üyeleri</h5>
                         </div>
                                            
                          {juryMembers && juryMembers.length > 0 ? (
                           <div className='border rounded p-2'>
                                {juryMembers.map((jury, index) => (
                                    <div key={index} className={`d-flex align-items-center py-2 ${index !== juryMembers.length - 1 ? 'border-bottom' : ''}`}>
                                      <div className='ms-2'>
                                         <div className='fw-bold'>{jury.user.name} {jury.user.surname}</div>
                                           <div className='text-muted small'>
                                               {jury.user.department?.name || 'Bölüm Bilgisi Yok'} • {jury.user.email}
                                            </div>
                                          </div>
                                    </div>
                                    ))}
                            </div>
                            ) : (
                            <div className='border rounded p-3 text-center bg-light'>
                                <p className='mb-0 text-muted'>Bu ilan için henüz jüri üyesi atanmamış.</p>
                            </div>
                            )}
                    </div>

                    <hr />

                    <h5 className='fw-bold'>Gerekli Belgeler</h5>
                    {job.requiredDocuments && job.requiredDocuments.length > 0 ? (
                        <ul>
                            {job.requiredDocuments.map((doc, index) => (
                                <li key={index}>{doc}</li>
                            ))}
                        </ul>
                    ) : (
                        <p className='text-muted'>Gerekli belgeler belirtilmemiş.</p>
                    )}                                    
                </Card.Body>

                <div className='position-sticky bottom-0 bg-white text-center p-3 border-top' style={{ width: '100%' }}>
                    <Button 
                        variant='success' 
                        className='w-100' 
                        onClick={handleEdit}
                    >
                        İlanı Düzenle
                    </Button>
                </div>
            </Card>
        </Container>
    );
};

export default AdminJobDetailsScreen;