import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Card, Button, Row, Col, Badge, Alert, Tooltip, OverlayTrigger } from 'react-bootstrap';
import { FaShareAlt, FaCheck, FaClipboardCheck } from 'react-icons/fa';
import { useGetJobByIdQuery } from '../../slices/jobsApiSlice';
import { useGetMyApplicationsQuery } from '../../slices/applicationsApiSlice';
import { useSelector } from 'react-redux';
import { formatDate } from '../../utils/helpers';
import BackButton from '../../components/common/BackButton';
import { getStatusBadge } from '../../utils/badges';
import Loader from '../../components/common/Loader';

const JobDetailsScreen = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [copied, setCopied] = useState(false);
    const [hasApplied, setHasApplied] = useState(false);
    
    const { userInfo } = useSelector((state) => state.auth);
    
    const { data: job, isLoading, error } = useGetJobByIdQuery(id);
    
    const { data: myApplications } = useGetMyApplicationsQuery(undefined, {
        skip: !userInfo
    });
    
    useEffect(() => {
        if (userInfo && myApplications && id) {
            const applied = myApplications.some(app => 
                app.jobId._id === id ||
                app.jobId === id
            );
            setHasApplied(applied);
        }
    }, [myApplications, id, userInfo]);
    
    const handleApply = () => {
        navigate(`/jobs/${id}/apply`);
    };
    
    const handleShareUrl = () => {
        const url = window.location.href;
        navigator.clipboard.writeText(url)
            .then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 5000);
            })
            .catch(err => {
                console.error('URL kopyalanamadı:', err);
            });
    };
    
    if (isLoading) {
        return (
            <Loader />
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

                    <div className='text-center mb-4 d-flex justify-content-center gap-2 flex-wrap'>
                        {getStatusBadge(job.status)}
                        {hasApplied && (
                            <Badge bg='success' className='p-2'>
                                <FaClipboardCheck className='me-1' /> Başvuruldu
                            </Badge>
                        )}
                    </div>

                    <Card.Title className='fw-bold text-center fs-4'>{job.title}</Card.Title>
                    <p className='text-muted text-center'>{job.description}</p>
                    
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
                                      
                    {!isActive && (
                        <Alert variant={isExpired ? 'warning' : 'info'} className='mt-4'>
                            {isExpired ? 
                                'Bu ilanın başvuru süresi dolmuştur.' : 
                                'Bu ilan şu anda aktif değil. Başvuru yapamazsınız.'}
                        </Alert>
                    )}
                    
                    {hasApplied && (
                        <Alert variant='info' className='mt-4'>
                            <FaClipboardCheck className='me-2' />
                            Bu ilana daha önce başvuru yaptınız. Başvuru durumunuzu 'Başvurularım' sayfasından takip edebilirsiniz.
                        </Alert>
                    )}
                </Card.Body>

                <div className='position-sticky bottom-0 bg-white text-center p-3 border-top' style={{ width: '100%' }}>
                    {hasApplied ? (
                        <Button 
                            variant='success' 
                            className='w-100'
                            onClick={() => navigate('/my-applications')}
                        >
                            <FaClipboardCheck className='me-2' />
                            Başvurularımı Görüntüle
                        </Button>
                    ) : (
                        <Button 
                            variant='success' 
                            className='w-100' 
                            onClick={handleApply}
                            disabled={!isActive || isExpired}
                        >
                            {isActive && !isExpired ? 'Başvur' : 'Başvuru Süresi Doldu'}
                        </Button>
                    )}
                </div>
            </Card>
        </Container>
    );
};

export default JobDetailsScreen;