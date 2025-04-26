import { Container, Card, Row, Col, Table, Badge, Button, Alert, ListGroup } from 'react-bootstrap';
import { FaFileAlt, FaUserGraduate, FaBook, FaProjectDiagram, FaQuoteRight, FaFilePdf, FaFileWord, FaFileImage, FaFile, FaDownload } from 'react-icons/fa';
import { useParams } from 'react-router-dom';
import { useGetApplicationByIdQuery } from '../../slices/applicationsApiSlice';
import { useGetJobByIdQuery } from '../../slices/jobsApiSlice';
import { useGetFacultyByIdQuery, useGetDepartmentByIdQuery } from '../../slices/fieldsApiSlice';
import Loader from '../../components/common/Loader';
import BackButton from '../../components/common/BackButton';
import { getStatusBadge } from '../../utils/badges';
import { toast } from 'react-toastify';

const ApplicationDetailsScreen = () => {
  const { id } = useParams();
 
  const { 
    data: application, 
    isLoading: isLoadingApplication, 
    isError: isApplicationError, 
    error: applicationError 
  } = useGetApplicationByIdQuery(id);

  const { data: job } = useGetJobByIdQuery(
    application?.jobId?._id || application?.jobId,
    { skip: !application?.jobId }
  );

  const { data: department } = useGetDepartmentByIdQuery(
    application?.jobId?.department?._id || application?.jobId?.department,
    { skip: !application?.jobId?.department }
  );
  
  const { data: faculty } = useGetFacultyByIdQuery(
    department?.faculty?._id || department?.faculty,
    { skip: !department?.faculty }
  );

  const getFileIcon = (fileUrl) => {
    if (!fileUrl || typeof fileUrl !== 'string') return <FaFile size={24} className="text-secondary" />;
    
    try {
      const ext = fileUrl.split('.').pop().toLowerCase();
      
      if (['pdf'].includes(ext)) {
        return <FaFilePdf size={24} className="text-danger" />;
      } else if (['doc', 'docx'].includes(ext)) {
        return <FaFileWord size={24} className="text-primary" />;
      } else if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) {
        return <FaFileImage size={24} className="text-success" />;
      } else {
        return <FaFile size={24} className="text-secondary" />;
      }
    } catch (error) {
      console.error("Error in getFileIcon:", error);
      return <FaFile size={24} className="text-secondary" />;
    }
  };

  const downloadFile = (filename) => {
    const downloadUrl = `/api/applications/download-file/${filename}`;
    fetch(downloadUrl)
      .then(response => {
        if (!response.ok) {
          throw new Error('Dosya indirilemedi');
        }
        const suggestedFilename = response.headers
          .get('Content-Disposition')
          ?.split('filename=')[1]
          ?.replace(/"/g, '') || filename;
        return response.blob().then(blob => ({ blob, suggestedFilename }));
      })
      .then(({ blob, suggestedFilename }) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = suggestedFilename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      })
      .catch(error => {
        toast.error('Dosya indirilemedi');
      });
  };

  if (isLoadingApplication) return <Loader />;

  if (isApplicationError) return (
    <Container className="mt-4">
      <Alert variant="danger">
        <Alert.Heading>Başvuru bilgileri alınamadı!</Alert.Heading>
        <p>{applicationError?.data?.message || 'Bilinmeyen hata'}</p>
        <div className="mt-3">
        <BackButton />
        </div>
      </Alert>
    </Container>
  );
  
  const renderDataTable = (data, columns, emptyMessage) => {
    if (!data || data.length === 0) {
      return <Alert variant="secondary">{emptyMessage}</Alert>;
    }
    
    return (
      <Table responsive hover className="border">
        <thead className="bg-light">
          <tr>
            {columns.map(col => <th key={col.key}>{col.label}</th>)}
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index}>
              {columns.map(col => (
                <td key={col.key}>
                  {col.key === 'index' 
                    ? index + 1 
                    : col.key === 'category' 
                      ? <Badge bg="success">{item[col.key]}</Badge>
                      : item[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </Table>
    );
  };
  
  const jobTitle = job?.title || application?.jobId?.title;
  const departmentName = department?.name || application?.jobId?.department?.name;
  const facultyName = faculty?.name || application?.jobId?.department?.faculty?.name;
  
  return (
    <Container className="mt-4 mb-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h2">Başvuru Özeti</h1>
        <BackButton />
      </div>
      
      <Card className="mb-4 shadow-sm">
        <Card.Header className="bg-success text-white">
          <h2 className="h5 mb-0">Başvuru Durumu</h2>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={8}>
              <h3 className="h4">{jobTitle}</h3>
              <p className="text-muted">{departmentName} - {facultyName}</p>
              <p>Pozisyon: <strong>{application?.positionType}</strong></p>
            </Col>
            <Col md={4}>
              <div className="text-md-end">
                <p>Başvuru Tarihi: <strong>{new Date(application?.submittedAt).toLocaleDateString('tr-TR')}</strong></p>
                {getStatusBadge(application?.status)}
              </div>
            </Col>
          </Row>
          
          {application?.status && (
            <Alert 
              variant={
                application.status === 'Beklemede' ? 'info' : 
                application.status === 'Onaylandı' ? 'success' : 'danger'
              } 
              className="mt-3 mb-0"
            >
              {application.status === 'Beklemede' && 'Başvurunuz inceleme sürecindedir. Değerlendirme sonucu size bildirilecektir.'}
              {application.status === 'Onaylandı' && 'Tebrikler! Başvurunuz olumlu değerlendirilmiştir.'}
              {application.status === 'Reddedildi' && 'Başvurunuz kriterlerimizi karşılamadığı için olumsuz değerlendirilmiştir.'}
            </Alert>
          )}
        </Card.Body>
      </Card>
      
      <Card className="mb-4 shadow-sm">
        <Card.Header className="bg-light">
          <div className="d-flex align-items-center">
            <FaFileAlt className="me-2 text-success" />
            <h3 className="h5 mb-0">Yüklenen Belgeler</h3>
          </div>
        </Card.Header>
        <Card.Body>
          {application?.documents && application.documents.length > 0 ? (
            <Row xs={1} md={2} lg={3} className="g-4">
              {application.documents.map((doc, index) => (
                <Col key={index}>
                  <Card className="h-100 border-light shadow-sm document-card">
                    <Card.Body className="text-center p-4">
                      <div className="mb-3">
                        {getFileIcon(doc.fileUrl)}
                      </div>
                      <Card.Title className="text-truncate fs-6">
                        {doc.originalName || "Belge"}
                      </Card.Title>
                      <Card.Text className="text-muted small">
                        {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString('tr-TR') : ''}
                      </Card.Text>
                      <div className="mt-3">
                        <Button 
                        variant="outline-success" 
                        size="sm"
                        onClick={() => {
                          const fileName = doc.fileUrl.split('/').pop().split('\\').pop();
                          downloadFile(fileName);
                        }}
                        >
                          <FaDownload className="me-1" /> İndir
                        </Button>
                      </div>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  ) : (
    <Alert variant="warning">Belge yüklenmemiş.</Alert>
  )}
</Card.Body>
      </Card>
      
      <Card className="mb-4 shadow-sm">
        <Card.Header className="bg-light">
          <div className="d-flex align-items-center">
            <FaBook className="me-2 text-success" />
            <h3 className="h5 mb-0">Yayınlar</h3>
          </div>
        </Card.Header>
        <Card.Body>
          {renderDataTable(
            application?.publications,
            [
              { key: 'index', label: '#' },
              { key: 'category', label: 'Kategori' },
              { key: 'title', label: 'Başlık' },
              { key: 'journal', label: 'Dergi/Yayınevi' },
              { key: 'year', label: 'Yıl' },
              { key: 'authors', label: 'Yazarlar' }
            ],
            'Yayın bilgisi girilmemiş.'
          )}
        </Card.Body>
      </Card>
      
      <Card className="mb-4 shadow-sm">
        <Card.Header className="bg-light">
          <div className="d-flex align-items-center">
            <FaQuoteRight className="me-2 text-success" />
            <h3 className="h5 mb-0">Atıflar</h3>
          </div>
        </Card.Header>
        <Card.Body>
          {renderDataTable(
            application?.citations,
            [
              { key: 'index', label: '#' },
              { key: 'category', label: 'Kategori' },
              { key: 'publicationTitle', label: 'Atıf Yapılan Yayın' },
              { key: 'count', label: 'Atıf Sayısı' }
            ],
            'Atıf bilgisi girilmemiş.'
          )}
        </Card.Body>
      </Card>
      
      <Card className="mb-4 shadow-sm">
        <Card.Header className="bg-light">
          <div className="d-flex align-items-center">
            <FaProjectDiagram className="me-2 text-success" />
            <h3 className="h5 mb-0">Projeler</h3>
          </div>
        </Card.Header>
        <Card.Body>
          {renderDataTable(
            application?.projects,
            [
              { key: 'index', label: '#' },
              { key: 'category', label: 'Kategori' },
              { key: 'title', label: 'Proje Başlığı' },
              { key: 'fundingAgency', label: 'Fon Kaynağı' },
              { key: 'year', label: 'Yıl' }
            ],
            'Proje bilgisi girilmemiş.'
          )}
        </Card.Body>
      </Card>
      
      <Card className="mb-4 shadow-sm">
        <Card.Header className="bg-light">
          <div className="d-flex align-items-center">
            <FaUserGraduate className="me-2 text-success" />
            <h3 className="h5 mb-0">Tez Danışmanlıkları</h3>
          </div>
        </Card.Header>
        <Card.Body>
          {renderDataTable(
            application?.theses,
            [
              { key: 'index', label: '#' },
              { key: 'category', label: 'Kategori' },
              { key: 'studentName', label: 'Öğrenci' },
              { key: 'title', label: 'Tez Başlığı' },
              { key: 'year', label: 'Yıl' },
            ],
            'Tez danışmanlığı bilgisi girilmemiş.'
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ApplicationDetailsScreen;