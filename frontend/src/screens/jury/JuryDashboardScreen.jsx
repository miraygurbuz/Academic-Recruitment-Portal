import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { useGetJuryAssignedJobsQuery } from '../../slices/juryApiSlice';
import { FaClipboardList, FaBalanceScale } from 'react-icons/fa';
import JuryJobsScreen from './JuryJobsScreen';
import Loader from '../../components/common/Loader';

const JuryDashboardScreen = () => {
  const { data: assignedJobs, isLoading, error } = useGetJuryAssignedJobsQuery();
    
  const totalAssignedJobs = assignedJobs?.length || 0;
  const evaluationJobs = assignedJobs?.filter(job => job.status === 'Değerlendirme').length || 0;

  if (isLoading) return <Loader />;
  
  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          {error?.data?.message || 'Veriler yüklenirken bir hata oluştu.'}
        </Alert>
      </Container>
    );
  }

  return (
    <Container className='mt-4'>
      <div className='text-center mb-4'>
        <h1 className='h2'>İstatistikler</h1>
      </div>
      
      <Row className='justify-content-center mb-4'>
        <Col md={5} sm={6} className='mb-3 mx-2'>
          <Card className='dashboard-card shadow-sm'>
            <Card.Body className='d-flex align-items-center p-3'>
              <div className='bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3' style={{width: '60px', height: '60px'}}>
                <FaClipboardList size={30} />
              </div>
              <div>
                <h6 className='text-muted mb-1'>Toplam Atanan İlan</h6>
                <h2 className='card-title fw-bold mb-0'>{totalAssignedJobs}</h2>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={5} sm={6} className='mb-3 mx-2'>
          <Card className='dashboard-card shadow-sm'>
            <Card.Body className='d-flex align-items-center p-3'>
              <div className='bg-success text-white rounded-circle d-flex align-items-center justify-content-center me-3' style={{width: '60px', height: '60px'}}>
                <FaBalanceScale size={30} />
              </div>
              <div>
                <h6 className='text-muted mb-1'>Değerlendirme Aşamasında</h6>
                <h2 className='card-title fw-bold mb-0'>{evaluationJobs}</h2>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <JuryJobsScreen />
    </Container>
  );
};

export default JuryDashboardScreen;