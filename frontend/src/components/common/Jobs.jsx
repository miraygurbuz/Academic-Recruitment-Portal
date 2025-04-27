import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowRight, FaInfoCircle, FaCalendarAlt, FaUniversity, FaGraduationCap, FaCheck, FaFilter } from 'react-icons/fa';
import { Container, Card, Button, Badge, Alert, Row, Col, Form, InputGroup } from 'react-bootstrap';
import { useGetActiveJobsQuery } from '../../slices/jobsApiSlice';
import { useGetMyApplicationsQuery } from '../../slices/applicationsApiSlice';
import { useSelector } from 'react-redux';
import Pager from './Pager/Pager';
import Loader from './Loader';

const Jobs = () => {
    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const itemsPerPage = 6;
    
    const { userInfo } = useSelector((state) => state.auth);
    
    const { data: jobs, isLoading: jobsLoading, isError: jobsError, error: jobsErrorData } = useGetActiveJobsQuery();
    
    const { data: myApplications, isLoading: applicationsLoading } = useGetMyApplicationsQuery(undefined, {
        skip: !userInfo
    });
    
    const [appliedJobIds, setAppliedJobIds] = useState(new Set());
    
    useEffect(() => {
        if (myApplications && userInfo) {
            const appliedIds = new Set(myApplications.map(app => app.jobId._id));
            setAppliedJobIds(appliedIds);
        }
    }, [myApplications, userInfo]);
    
    const departments = useMemo(() => {
        if (!jobs) return [];
        const uniqueDepartments = new Set(jobs.map(job => job.department.name));
        return Array.from(uniqueDepartments).sort();
    }, [jobs]);
    
    // Filter jobs by department
    const filteredJobs = useMemo(() => {
        if (!jobs) return [];
        return selectedDepartment 
            ? jobs.filter(job => job.department.name === selectedDepartment)
            : jobs;
    }, [jobs, selectedDepartment]);
    
    const totalPages = filteredJobs ? Math.ceil(filteredJobs.length / itemsPerPage) : 0;

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentJobs = filteredJobs ? filteredJobs.slice(startIndex, startIndex + itemsPerPage) : [];
    
    const handleApply = (jobId) => {
        navigate(`/jobs/${jobId}/apply`);
    };
    
    const handleDetails = (jobId) => {
        navigate(`/jobs/${jobId}`);
    };

    const calculateDaysLeft = (endDate) => {
        const deadline = new Date(endDate);
        const today = new Date();
        const diffTime = deadline - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear()}`;
    };

    const hasApplied = (jobId) => {
        return appliedJobIds.has(jobId);
    };

    const handleDepartmentChange = (e) => {
        setSelectedDepartment(e.target.value);
        setCurrentPage(1);
    };

    if (jobsLoading) {
        return <Loader />;
    }

    if (jobsError) {
        return (
            <Container className='mt-4'>
                <Alert variant='danger'>
                    <Alert.Heading>Hata!</Alert.Heading>
                    <p>İlanlar yüklenirken bir sorun oluştu: {jobsErrorData?.message || 'Bilinmeyen hata'}</p>
                </Alert>
            </Container>
        );
    }

    return (
        <Container className='py-4'>
            <div className='text-center mb-4'>
                <h2>Akademik İlanlar</h2>
                <p className='text-muted small'>
                    {filteredJobs?.length || 0} aktif ilan bulunmaktadır
                </p>
            </div>
            
            <Row className='mb-4'>
                <Col md={6} className='mx-auto'>
                    <InputGroup>
                        <InputGroup.Text><FaFilter /></InputGroup.Text>
                        <Form.Select 
                            value={selectedDepartment} 
                            onChange={handleDepartmentChange}
                            aria-label="Bölüm Seçin"
                        >
                            <option value="">Tüm Bölümler</option>
                            {departments.map(dept => (
                                <option key={dept} value={dept}>
                                    {dept}
                                </option>
                            ))}
                        </Form.Select>
                    </InputGroup>
                </Col>
            </Row>
            
            <Row xs={1} md={2} lg={3} className='g-4 mb-4'>
                {currentJobs.map((job) => {
                    const daysLeft = calculateDaysLeft(job.endDate);
                    const applied = userInfo && hasApplied(job._id);
                    
                    return (
                        <Col key={job._id}>
                            <Card className='job-card h-100'>
                                <Card.Header className='job-card-header d-flex justify-content-between align-items-center'>
                                    <Badge 
                                        bg='success' 
                                        className='position-badge'>
                                        {job.position}
                                    </Badge>
                                    
                                    <Badge 
                                        bg='secondary' 
                                        className='days-left-badge'
                                    >
                                        {daysLeft > 0 ? `${daysLeft} gün` : 'Süresi doldu'}
                                    </Badge>
                                </Card.Header>
                                
                                <Card.Body>
                                    <Card.Title style={{ fontSize: '1.2rem' }}>
                                        {job.title}
                                    </Card.Title>
                                    
                                    <div className='job-info'>
                                        <div className='d-flex align-items-center mb-2'>
                                            <FaUniversity className='text-success me-2' />
                                            <span className='text-muted'>{job.department?.faculty?.name || 'Fakülte Bilgisi Yok'}</span>
                                        </div>
                                        <div className='d-flex align-items-center mb-2'>
                                            <FaGraduationCap className='text-success me-2' />
                                            <span className='text-muted'>{job.department.name}</span>
                                        </div>
                                        <div className='d-flex align-items-center'>
                                            <FaCalendarAlt className='text-success me-2' />
                                            <span className='text-muted'>Son Başvuru: {formatDate(job.endDate)}</span>
                                        </div>
                                    </div>
                                </Card.Body>
                                
                                <Card.Footer className='bg-white'>
                                    <div className='d-flex justify-content-between'>
                                        <Button 
                                            variant='outline-secondary' 
                                            size='sm' 
                                            className='d-flex align-items-center'
                                            onClick={() => handleDetails(job._id)}
                                        >
                                            <span>Detay</span>
                                            <FaInfoCircle className='ms-1' />
                                        </Button>
                                        
                                        {applied ? (
                                            <Badge 
                                                bg='success' 
                                                className='d-flex align-items-center px-3 py-2'
                                            >
                                                <FaCheck className='me-1' />
                                                <span>Başvuruldu</span>
                                            </Badge>
                                        ) : (
                                            <Button 
                                                variant='outline-success' 
                                                size='sm' 
                                                className='d-flex align-items-center'
                                                onClick={() => handleApply(job._id)}
                                                disabled={daysLeft <= 0}
                                            >
                                                <span>Başvur</span>
                                                <FaArrowRight className='ms-1' />
                                            </Button>
                                        )}
                                    </div>
                                </Card.Footer>
                            </Card>
                        </Col>
                    );
                })}
            </Row>
            
            {currentJobs.length === 0 && (
                <Alert variant='info' className='text-center'>
                    {selectedDepartment 
                        ? `${selectedDepartment} bölümünde aktif ilan bulunmamaktadır.`
                        : 'Aktif ilan bulunmamaktadır.'}
                </Alert>
            )}
            
            {filteredJobs && filteredJobs.length > itemsPerPage && (
                <div className='d-flex justify-content-center mt-4'>
                    <Pager 
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                        variant='success'
                    />
                </div>
            )}
        </Container>
    );
};

export default Jobs;