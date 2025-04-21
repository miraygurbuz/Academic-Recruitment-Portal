import { Container, Row, Col, Card } from 'react-bootstrap';
import { FaUsers, FaClipboardList, FaUniversity, FaPlus } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useGetUserCountQuery, useGetActiveJobCountQuery, useGetPendingApplicationCountQuery } from '../../../slices/statsSlice';
import { useGetApplicationsQuery } from '../../../slices/applicationsApiSlice';
import AdminJobsScreen from '../AdminJobsScreen';
import './AdminDashboardScreen.css';

const DashboardScreen = () => {
  const navigate = useNavigate();

  const {
    data: pendingReviews = 0,
    isLoading: isLoadingPending,
    error: pendingError
  } = useGetPendingApplicationCountQuery();

  const { 
    data: totalUsers = 0, 
    isLoading: isLoadingUsers, 
    error: usersError 
  } = useGetUserCountQuery();
  
  const { 
    data: activePositions = 0, 
    isLoading: isLoadingPositions, 
    error: positionsError 
  } = useGetActiveJobCountQuery();

  const { 
    data: applicationsData, 
    isLoading 
} = useGetApplicationsQuery();

const totalApplications = applicationsData?.totalApplications || 0;

  const getBadgeVariant = (status) => {
    switch (status) {
      case 'İnceleniyor': return 'info';
      case 'Değerlendirmede': return 'primary';
      case 'Kabul Edildi': return 'success';
      case 'Reddedildi': return 'danger';
      default: return 'secondary';
    }
  };

  const handleCreateJob = () => {
    navigate('/admin/jobs/create');
  };

  return (
    <Container className='mt-4'>
    <div className='text-center mb-4'>
        <h1 className='h2'>
            İstatistikler
        </h1>
    </div>
      
      <Row className='mb-4'>
        <Col md={3} sm={6} className='mb-3'>
          <Card className='dashboard-card'>
            <Card.Body>
              <div className='d-flex justify-content-between align-items-center'>
                <div>
                  <h6 className='card-subtitle text-muted'>Toplam Kullanıcılar</h6>
                  <h2 className='card-title mb-0'>{totalUsers}</h2>
                </div>
                <div className='card-icon bg-info'>
                  <FaUsers />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6} className='mb-3'>
          <Card className='dashboard-card'>
            <Card.Body>
              <div className='d-flex justify-content-between align-items-center'>
                <div>
                  <h6 className='card-subtitle text-muted'>Toplam Başvurular</h6>
                  <h2 className='card-title mb-0'>{totalApplications}</h2>
                </div>
                <div className='card-icon bg-success'>
                  <FaClipboardList />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6} className='mb-3'>
          <Card className='dashboard-card'>
            <Card.Body>
              <div className='d-flex justify-content-between align-items-center'>
                <div>
                  <h6 className='card-subtitle text-muted'>Aktif İlanlar</h6>
                  <h2 className='card-title mb-0'>{activePositions}</h2>
                </div>
                <div className='card-icon bg-warning'>
                  <FaUniversity />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6} className='mb-3'>
          <Card className='dashboard-card'>
            <Card.Body>
              <div className='d-flex justify-content-between align-items-center'>
                <div>
                  <h6 className='card-subtitle text-muted'>Bekleyen İncelemeler</h6>
                  <h2 className='card-title mb-0'>{pendingReviews}</h2>
                </div>
                <div className='card-icon bg-danger'>
                  <FaClipboardList />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <AdminJobsScreen />
      
      <div className='floating-action-button' onClick={handleCreateJob}>
        <FaPlus />
      </div>
    </Container>
  );
};

export default DashboardScreen;