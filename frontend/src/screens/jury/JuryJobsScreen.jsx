import React, { useState } from 'react';
import { Container, Row, Col, Card, Badge, Alert, Table, Button } from 'react-bootstrap';
import { useGetJuryAssignedJobsQuery } from '../../slices/juryApiSlice';
import { FaClipboardList, FaEye } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import Loader from '../../components/common/Loader';
import Pager from '../../components/common/Pager/Pager';

const JuryDashboardScreen = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  const { data: assignedJobs, isLoading, error } = useGetJuryAssignedJobsQuery();
  
  const totalAssignedJobs = assignedJobs?.length || 0;
  const activeJobs = assignedJobs?.filter(job => job.status === 'Aktif').length || 0;
  const evaluationJobs = assignedJobs?.filter(job => job.status === 'Değerlendirme').length || 0;
  
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = assignedJobs ? assignedJobs.slice(indexOfFirstItem, indexOfLastItem) : [];
  const totalPages = Math.ceil((assignedJobs?.length || 0) / itemsPerPage);
  
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

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
    <Container fluid className="mt-4 mb-5">
      <div className="text-center mb-4">
        <h1 className="h2">İlanlar</h1>
      </div>
      
      <Card>
        <Card.Header>
          <Row className="align-items-center">
            <Col>
              <h3 className="mb-0">Atanan İlanlar</h3>
            </Col>
          </Row>
        </Card.Header>
        
        <Card.Body>
          {assignedJobs && assignedJobs.length > 0 ? (
            <>
              <div className="table-responsive">
                <Table hover bordered>
                  <thead className="table-light">
                    <tr>
                      <th>İlan Adı</th>
                      <th>Bölüm</th>
                      <th>Pozisyon</th>
                      <th>Başvuru Bitiş</th>
                      <th>Durum</th>
                      <th>İşlemler</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assignedJobs.map((job) => (
                      <tr key={job._id}>
                        <td>{job.title || 'Başlıksız İlan'}</td>
                        <td>
                          <div>{job.department?.name || 'Bölüm Bilgisi Yok'}</div>
                          <small className="text-muted">
                            {job.department?.faculty?.name || 'Fakülte Bilgisi Yok'}
                          </small>
                        </td>
                        <td>{job.position || 'Belirtilmemiş'}</td>
                        <td>{job.endDate ? new Date(job.endDate).toLocaleDateString('tr-TR') : 'Tarih Yok'}</td>
                        <td>
                          <Badge
                            bg={
                              job.status === 'Aktif'
                                ? 'success'
                                : job.status === 'Değerlendirme'
                                ? 'warning'
                                : job.status === 'Biten'
                                ? 'secondary'
                                : 'light'
                            }
                          >
                            {job.status}
                          </Badge>
                        </td>
                        <td>
                          <div className="d-flex gap-1">
                          <Link
                              to={`/jury/jobs/${job._id}`}
                              className="btn btn-sm btn-light border"
                              title="İlanı Görüntüle"
                            >
                              <FaEye />
                            </Link>
                            <Link
                              to={`/jury/jobs/${job._id}/applications`}
                              className="btn btn-sm btn-light border"
                              title="Başvuruları Görüntüle"
                            >
                              <FaClipboardList />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
              
              <Pager 
                currentPage={1} 
                totalPages={Math.ceil(assignedJobs.length / 10)} 
                onPageChange={() => {}} 
                variant="success"
              />
              
              <div className="text-center mt-2 text-muted">
                <small>
                  Toplam {assignedJobs.length} ilandan {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, assignedJobs.length)} arası gösteriliyor
                </small>
              </div>
            </>
          ) : (
            <Alert variant="info" className="text-center">
              Henüz size atanmış ilan bulunmamaktadır.
            </Alert>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default JuryDashboardScreen;