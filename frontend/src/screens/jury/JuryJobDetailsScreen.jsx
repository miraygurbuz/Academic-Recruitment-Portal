import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Card, Button, Row, Col, Alert, Tooltip, OverlayTrigger } from 'react-bootstrap';
import { FaShareAlt, FaCheck, FaClipboardList } from 'react-icons/fa';
import { useGetJobByIdQuery } from '../../slices/jobsApiSlice';
import { formatDate } from '../../utils/helpers';
import { getStatusBadge } from '../../utils/badges';
import Loader from '../../components/common/Loader';
import BackButton from '../../components/common/BackButton';

const JuryJobDetailsScreen = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [copied, setCopied] = useState(false);
    
    const { data: job, isLoading, error } = useGetJobByIdQuery(id);
    
    const handleViewApplications = () => {
        navigate(`/jury/jobs/${id}/applications`);
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
    
    if (isLoading) {
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
    const isEvaluation = job.status === 'Değerlendirme';
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
                    
                    {!isEvaluation && (
                        <div className='mt-4'>
                            <Alert variant='info'>
                                <strong>Bilgi:</strong> Bu ilana ait başvuruları değerlendirebilmeniz için ilanın durumunun "Değerlendirme" olması gerekmektedir. 
                                Şu anki durum: {job.status}
                            </Alert>
                        </div>
                    )}
                </Card.Body>

                <div className='position-sticky bottom-0 bg-white text-center p-3 border-top' style={{ width: '100%' }}>
                    <Button 
                        variant='success' 
                        className='w-100' 
                        onClick={handleViewApplications}
                    >
                        <FaClipboardList className='me-2' /> İlan Başvurularını Değerlendir
                    </Button>
                </div>
            </Card>
        </Container>
    );
};

export default JuryJobDetailsScreen;