import { useState } from 'react';
import { Container, Card, Table, Badge, Alert, Row, Col } from 'react-bootstrap';
import { useParams, Link } from 'react-router-dom';
import { useGetJuryJobApplicationsQuery } from '../../slices/juryApiSlice';
import { FaFilePdf, FaFilter, FaGavel } from 'react-icons/fa';
import Loader from '../../components/common/Loader';
import Pager from '../../components/common/Pager/Pager';
import BackButton from '../../components/common/BackButton';
import { useGetJobByIdQuery } from '../../slices/jobsApiSlice';

const JuryJobApplicationsScreen = () => {
  const { jobId } = useParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const { data: job } = useGetJobByIdQuery(jobId);
  
  const { data: applications, isLoading, error } = useGetJuryJobApplicationsQuery(jobId);
  
  const filteredApplications = applications?.filter(application => 
    application.candidateId.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    application.candidateId.surname.toLowerCase().includes(searchTerm.toLowerCase()) ||
    application.candidateId.tcKimlik.includes(searchTerm)
  ) || [];
  
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredApplications.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredApplications.length / itemsPerPage);
  
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };
  
  const getBadgeVariant = (status) => {
    switch(status) {
      case 'Onaylandı': return 'success';
      case 'Reddedildi': return 'danger';
      case 'Beklemede': return 'warning';
      default: return 'secondary';
    }
  };
  
  const getCriteriaVariant = (result) => {
    return result ? 'success' : 'danger';
  };

  if (isLoading) return <Loader />;
  
  if (error) {
    return (
      <Container className='mt-4'>
        <Alert variant='danger'>
          {error?.data?.message || 'Başvurular yüklenirken bir hata oluştu.'}
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid className='mt-4 mb-5'>
      <div className='text-center mb-4'>
        <h1 className='h2'>"{job?.title}" İlanına Ait Başvurular</h1>
      </div>
      
      <Card>
        <Card.Header>
          <Row className='align-items-center'>
            <Col>
              <h3 className='mb-0'>Başvuru Listesi</h3>
            </Col>
            <Col xs='auto'>
                <BackButton />
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
                  placeholder='Aday veya TC Kimlik No ile ara...'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </Col>
          </Row>
          
          {filteredApplications.length > 0 ? (
            <>
              <div className='table-responsive'>
                <Table hover bordered>
                  <thead className='table-light'>
                    <tr>
                      <th>Aday</th>
                      <th>TC Kimlik</th>
                      <th>Toplam Puan</th>
                      <th>Kriter Kontrolü</th>
                      <th>Başvuru Durumu</th>
                      <th>Başvuru Tarihi</th>
                      <th>İşlemler</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.map((application) => (
                      <tr key={application._id}>
                        <td>
                          <div className='fw-medium'>
                            {application.candidateId.name} {application.candidateId.surname}
                          </div>
                        </td>
                        <td>{application.candidateId.tcKimlik}</td>
                        <td>{application.pointsSummary?.total || 0}</td>
                        <td>
                          <Badge 
                            bg={getCriteriaVariant(application.criteriaCheck?.overallResult)}
                          >
                            {application.criteriaCheck?.overallResult 
                              ? 'Kriterleri Karşılıyor' 
                              : 'Kriterleri Karşılamıyor'}
                          </Badge>
                        </td>
                        <td>
                          <Badge bg={getBadgeVariant(application.status)}>
                            {application.status}
                          </Badge>
                        </td>
                        <td>
                          {application.submittedAt 
                            ? new Date(application.submittedAt).toLocaleDateString('tr-TR') 
                            : '-'}
                        </td>
                        <td>
                          <div className='d-flex gap-1'>
                            <Link 
                              to={`/jury/applications/${application._id}`}
                              className='btn btn-sm btn-success border'
                              title='Değerlendir'
                            >
                              <FaGavel />
                            </Link>
                            <Link 
                              to={`/jury/applications/${application._id}/PDF`}
                              className='btn btn-sm btn-success border'
                              title='PDF Görüntüle'
                            >
                              <FaFilePdf />
                            </Link>
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
              
              <div className='text-center mt-2 text-muted'>
                <small>
                  Toplam {filteredApplications.length} başvurudan {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredApplications.length)} arası gösteriliyor
                </small>
              </div>
            </>
          ) : (
            <Alert variant='info' className='text-center'>
              {searchTerm 
                ? 'Arama kriterlerine uygun başvuru bulunamadı.' 
                : 'Bu ilana henüz başvuru yapılmamış.'}
            </Alert>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default JuryJobApplicationsScreen;