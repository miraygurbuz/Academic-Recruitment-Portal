import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Form, Button, Card, Alert, Row, Col, Spinner, ListGroup, Badge } from 'react-bootstrap';
import { FaUpload, FaTrash, FaFileAlt, FaPlus } from 'react-icons/fa';
import { useGetJobByIdQuery } from '../../slices/jobsApiSlice';
import { useCreateApplicationMutation } from '../../slices/applicationsApiSlice';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import Loader from '../../components/common/Loader';
import { PUBLICATION_CATEGORIES, CITATION_CATEGORIES, PROJECT_CATEGORIES, THESIS_CATEGORIES } from '../../constants/categories';
import BackButton from '../../components/common/BackButton';

const ApplyJobScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const { userInfo } = useSelector((state) => state.auth);
  
  const { data: job, isLoading, isError, error } = useGetJobByIdQuery(id);
  const [createApplication, { isLoading: isSubmitting }] = useCreateApplicationMutation();
  
  const [formData, setFormData] = useState({
    publications: [
      {
        category: '',
        title: '',
        authors: '',
        journal: '',
        year: '',
        doi: '',
        isMainAuthor: false
      }
    ],
    citations: [
      {
        category: '',
        publicationTitle: '',
        count: 1
      }
    ],
    projects: [
      {
        category: '',
        title: '',
        fundingAgency: '',
        year: ''
      }
    ],
    theses: [
      {
        category: '',
        studentName: '',
        title: '',
        year: '',
      }
    ]
  });

  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [fileInfos, setFileInfos] = useState([]);

  const addPublication = () => {
    setFormData(prev => ({
      ...prev,
      publications: [
        ...prev.publications,
        {
          category: '',
          title: '',
          authors: '',
          journal: '',
          year: '',
          doi: '',
          isMainAuthor: false
        }
      ]
    }));
  };

  const removePublication = (index) => {
    const updatedPublications = [...formData.publications];
    updatedPublications.splice(index, 1);
    setFormData(prev => ({ ...prev, publications: updatedPublications }));
  };

  const addCitation = () => {
    setFormData(prev => ({
      ...prev,
      citations: [
        ...prev.citations,
        {
          category: '',
          publicationTitle: '',
          count: 1
        }
      ]
    }));
  };
  
  const removeCitation = (index) => {
    const updatedCitations = [...formData.citations];
    updatedCitations.splice(index, 1);
    setFormData(prev => ({ ...prev, citations: updatedCitations }));
  };
  
  const addProject = () => {
    setFormData(prev => ({
      ...prev,
      projects: [
        ...prev.projects,
        {
          category: '',
          title: '',
          fundingAgency: '',
          year: ''
        }
      ]
    }));
  };
  
  const removeProject = (index) => {
    const updatedProjects = [...formData.projects];
    updatedProjects.splice(index, 1);
    setFormData(prev => ({ ...prev, projects: updatedProjects }));
  };
  
  const addThesis = () => {
    setFormData(prev => ({
      ...prev,
      theses: [
        ...prev.theses,
        {
          category: '',
          studentName: '',
          title: '',
          year: '',
        }
      ]
    }));
  };
  
  const removeThesis = (index) => {
    const updatedTheses = [...formData.theses];
    updatedTheses.splice(index, 1);
    setFormData(prev => ({ ...prev, theses: updatedTheses }));
  };
  
const handleFileUpload = (e) => {
  const selectedFiles = Array.from(e.target.files);

  const updatedInfos = selectedFiles.map(file => {  
    return {
      name: file.name,
      size: file.size,
      file: file,
    };
  });

  setFileInfos(prev => [...prev, ...updatedInfos]);
};
  
  
  const removeFile = (index) => {
    const updatedFileInfos = [...fileInfos];
    updatedFileInfos.splice(index, 1);
    setFileInfos(updatedFileInfos);
    
    const updatedFiles = [...uploadedFiles];
    updatedFiles.splice(index, 1);
    setUploadedFiles(updatedFiles);
  };
  
  const handleChange = (e, section, field, index = null) => {
    const { value, type, checked } = e.target;
    
    if (section === 'publications' && index !== null) {
      const updatedPublications = [...formData.publications];
      if (type === 'checkbox') {
        updatedPublications[index] = {
          ...updatedPublications[index],
          [field]: checked
        };
      } else {
        updatedPublications[index] = {
          ...updatedPublications[index],
          [field]: value
        };
      }
      setFormData(prev => ({ ...prev, publications: updatedPublications }));
    } else if (section === 'citations' && index !== null) {
      const updatedCitations = [...formData.citations];
      updatedCitations[index] = {
        ...updatedCitations[index],
        [field]: value
      };
      setFormData(prev => ({ ...prev, citations: updatedCitations }));
    } else if (section === 'projects' && index !== null) {
      const updatedProjects = [...formData.projects];
      updatedProjects[index] = {
        ...updatedProjects[index],
        [field]: value
      };
      setFormData(prev => ({ ...prev, projects: updatedProjects }));
    } else if (section === 'theses' && index !== null) {
      const updatedTheses = [...formData.theses];
      if (type === 'checkbox') {
        updatedTheses[index] = {
          ...updatedTheses[index],
          [field]: checked
        };
      } else {
        updatedTheses[index] = {
          ...updatedTheses[index],
          [field]: value
        };
      }
      setFormData(prev => ({ ...prev, theses: updatedTheses }));
    }
  };

  const validatePublications = () => {
    return formData.publications.every(pub => 
      pub.category && 
      pub.title && 
      pub.authors && 
      pub.journal && 
      pub.year
    );
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validatePublications()) {
      toast.error('Lütfen tüm yayın alanlarını doldurunuz');
      return;
    }
  
    if (!userInfo) {
      toast.error('Lütfen önce giriş yapınız');
      navigate('/login');
      return;
    }
  
    try {
      let academicFieldId = '';
      if (job?.department?.faculty?.academicField?._id) {
        academicFieldId = job.department.faculty.academicField._id;
      }
  
      if (!academicFieldId) {
        toast.error('Akademik alan bilgisi bulunamadı');
        return;
      }

      const applicationData = new FormData();
      applicationData.append('jobId', id);
      applicationData.append('candidateId', userInfo._id);
      applicationData.append('academicFieldId', academicFieldId);
      applicationData.append('positionType', job.position);
      applicationData.append('status', 'Beklemede');
      applicationData.append('publications', JSON.stringify(formData.publications));
      applicationData.append('citations', JSON.stringify(formData.citations));
      applicationData.append('projects', JSON.stringify(formData.projects));
      applicationData.append('theses', JSON.stringify(formData.theses));
  
      fileInfos.forEach(fileObj => {
        if (fileObj.file instanceof File) {
          applicationData.append('documents', fileObj.file);
        }
      });
  
      const result = await createApplication(applicationData).unwrap();

      toast.success('Başvurunuz başarıyla gönderildi');
      navigate('/my-applications');
    } catch (err) {
      toast.error(err?.data?.message || 'Başvuru sırasında hata oluştu');
    }
  };

  if (isLoading) return <Loader />;
  
  if (isError) return (
    <Container className='mt-4'>
      <Alert variant='danger'>
        <Alert.Heading>İlan Bilgileri Alınamadı!</Alert.Heading>
        <p>{error?.data?.message || 'Bilinmeyen hata'}</p>
        <div className='mt-3'>
        <BackButton />
        </div>
      </Alert>
    </Container>
  );
  
  return (
    <Container className='mt-4 mb-5'>
      <div className='d-flex justify-content-between align-items-center mb-4'>
        <h1 className='h2'>Akademik İlan Başvurusu</h1>
        <BackButton />
      </div>
      
      <Card className='mb-4 shadow-sm'>
        <Card.Header>
          <h2 className='h5 mb-0'>İlan Bilgileri</h2>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={8}>
              <h3 className='h4'>{job.title}</h3>
              <p className='text-muted'>
                {job.department.name} - {job.department.faculty.name}
              </p>
              <p>Pozisyon: <strong>{job.position}</strong></p>
            </Col>
            <Col md={4}>
              <div className='text-md-end'>
                <p>İlan Tarihi: <strong>{new Date(job.startDate).toLocaleDateString('tr-TR')}</strong></p>
                <p>Son Başvuru: <strong>{new Date(job.endDate).toLocaleDateString('tr-TR')}</strong></p>
                <Badge bg='success'>Aktif</Badge>
              </div>
            </Col>
          </Row>
          
          <hr />
          <h4 className='h6 mt-3'>İlan Detayları ve Başvuru Koşulları</h4>
          <p>{job.description}</p>
          
          <h4 className='h6 mt-3'>Gerekli Belgeler</h4>
          <ListGroup variant='flush'>
            {job.requiredDocuments.map((doc, index) => (
              <ListGroup.Item key={index} className='px-0'>
                <FaFileAlt className='text-success me-2' /> {doc}
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Card.Body>
      </Card>
      
      <Form onSubmit={handleSubmit} encType="multipart/form-data">
        <Card className='mb-4 shadow-sm'>
          <Card.Header className='bg-success text-white'>
            <h3 className='h5 mb-0'>Belge Yükleme</h3>
          </Card.Header>
          <Card.Body>
            <Alert variant='info' className='mb-3'>
              <p className='mb-0'><strong>Önemli:</strong> Tüm özgeçmiş, yayın, diploma ve diğer belgelerinizi tek PDF dosyasında toplayıp yükleyebilirsiniz. Alternatif olarak ayrı dosyalar halinde yükleyebilirsiniz.</p>
            </Alert>
            
            {fileInfos.length > 0 ? (
              <ListGroup className='mb-3'>
                {fileInfos.map((file, index) => (
                  <ListGroup.Item key={index} className='d-flex justify-content-between align-items-center'>
                    <div>
                      <FaUpload className='me-2 text-success' />
                      {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </div>
                    <Button 
                      variant='outline-danger' 
                      size='sm' 
                      onClick={() => removeFile(index)}
                    >
                      <FaTrash />
                    </Button>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            ) : (
              <Alert variant='warning' className='mb-3'>
                Henüz belge yüklenmemiş. Lütfen dosyalarınızı yükleyiniz.
              </Alert>
            )}
            
            <Form.Group>
              <Form.Label><strong>Belge Yükle</strong> <span className='text-danger'>*</span></Form.Label>
              <Form.Control
                type='file'
                multiple
                onChange={handleFileUpload}
              />
              <Form.Text className='text-muted'>
                Desteklenen dosya formatları: PDF, DOC, DOCX, JPEG, PNG (Maks. 10MB)
              </Form.Text>
              <div className='mt-3'>
                <h5 className='h6'>Yüklenecek Belgeler:</h5>
                <ListGroup variant='flush'>
                  {job.requiredDocuments.map((doc, index) => (
                    <ListGroup.Item key={index} className='px-0'>
                      <FaFileAlt className='text-success me-2' /> {doc}
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </div>
            </Form.Group>
          </Card.Body>
        </Card>
        
        <Card className='mb-4 shadow-sm'>
          <Card.Header className='d-flex justify-content-between align-items-center'>
            <h3 className='h5 mb-0'>Yayınlar</h3>
            <Button 
              variant='outline-secondary' 
              size='sm' 
              onClick={addPublication}
            >
              <FaPlus className='me-1' /> Yayın Ekle
            </Button>
          </Card.Header>
          <Card.Body>
            {formData.publications.map((pub, index) => (
              <div key={index} className='mb-4 border-bottom pb-3'>
                <div className='d-flex justify-content-between align-items-center mb-2'>
                  <h4 className='h6'>Yayın {index + 1}</h4>
                  {formData.publications.length > 1 && (
                    <Button 
                      variant='outline-danger' 
                      size='sm' 
                      onClick={() => removePublication(index)}
                    >
                      <FaTrash />
                    </Button>
                  )}
                </div>
                
                <Row className='g-3'>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Kategori</Form.Label>
                      <Form.Select
                        value={pub.category}
                        onChange={(e) => handleChange(e, 'publications', 'category', index)}
                      >
                        <option value=''>Seçiniz</option>
                        {PUBLICATION_CATEGORIES.map(cat => (
                          <option key={cat.value} value={cat.value}>{cat.label}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Başlıca Yazar mısınız?</Form.Label>
                      <Form.Check
                        type='checkbox'
                        label='Evet, başlıca yazarım'
                        checked={pub.isMainAuthor}
                        onChange={(e) => handleChange(e, 'publications', 'isMainAuthor', index)}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={12}>
                    <Form.Group>
                      <Form.Label>Yayın Başlığı</Form.Label>
                      <Form.Control
                        type='text'
                        value={pub.title}
                        onChange={(e) => handleChange(e, 'publications', 'title', index)}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Dergi/Yayınevi</Form.Label>
                      <Form.Control
                        type='text'
                        value={pub.journal}
                        onChange={(e) => handleChange(e, 'publications', 'journal', index)}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Yıl</Form.Label>
                      <Form.Control
                        type='number'
                        value={pub.year}
                        onChange={(e) => handleChange(e, 'publications', 'year', index)}
                        min={1950}
                        max={new Date().getFullYear()}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Yazarlar</Form.Label>
                      <Form.Control
                        type='text'
                        value={pub.authors}
                        onChange={(e) => handleChange(e, 'publications', 'authors', index)}
                        placeholder='Örn: Ayşe Yılmaz, Mehmet Kaya, ...'
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </div>
            ))}
          </Card.Body>
        </Card>
        
        <Card className='mb-4 shadow-sm'>
          <Card.Header className='d-flex justify-content-between align-items-center'>
            <h3 className='h5 mb-0'>Atıflar</h3>
            <Button 
              variant='outline-secondary' 
              size='sm' 
              onClick={addCitation}
            >
              <FaPlus className='me-1' /> Atıf Ekle
            </Button>
          </Card.Header>
          <Card.Body>
            {formData.citations.map((citation, index) => (
              <div key={index} className='mb-4 border-bottom pb-3'>
                <div className='d-flex justify-content-between align-items-center mb-2'>
                  <h4 className='h6'>Atıf {index + 1}</h4>
                  {formData.citations.length > 1 && (
                    <Button 
                      variant='outline-danger' 
                      size='sm' 
                      onClick={() => removeCitation(index)}
                    >
                      <FaTrash />
                    </Button>
                  )}
                </div>
                
                <Row className='g-3'>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Kategori</Form.Label>
                      <Form.Select
                        value={citation.category}
                        onChange={(e) => handleChange(e, 'citations', 'category', index)}
                      >
                        <option value=''>Seçiniz</option>
                        {CITATION_CATEGORIES.map(cat => (
                          <option key={cat.value} value={cat.value}>{cat.label}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Atıf Sayısı</Form.Label>
                      <Form.Control
                        type='number'
                        value={citation.count}
                        onChange={(e) => handleChange(e, 'citations', 'count', index)}
                        min={1}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={12}>
                    <Form.Group>
                      <Form.Label>Atıf Yapılan Yayın</Form.Label>
                      <Form.Control
                        type='text'
                        value={citation.publicationTitle}
                        onChange={(e) => handleChange(e, 'citations', 'publicationTitle', index)}
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </div>
            ))}
          </Card.Body>
        </Card>
        
        <Card className='mb-4 shadow-sm'>
          <Card.Header className='d-flex justify-content-between align-items-center'>
            <h3 className='h5 mb-0'>Projeler</h3>
            <Button 
              variant='outline-secondary' 
              size='sm' 
              onClick={addProject}
            >
              <FaPlus className='me-1' /> Proje Ekle
            </Button>
          </Card.Header>
          <Card.Body>
            {formData.projects.map((project, index) => (
              <div key={index} className='mb-4 border-bottom pb-3'>
                <div className='d-flex justify-content-between align-items-center mb-2'>
                  <h4 className='h6'>Proje {index + 1}</h4>
                  {formData.projects.length > 1 && (
                    <Button 
                      variant='outline-danger' 
                      size='sm' 
                      onClick={() => removeProject(index)}
                    >
                      <FaTrash />
                    </Button>
                  )}
                </div>
                
                <Row className='g-3'>
                  <Col md={12}>
                    <Form.Group>
                      <Form.Label>Proje Başlığı</Form.Label>
                      <Form.Control
                        type='text'
                        value={project.title}
                        onChange={(e) => handleChange(e, 'projects', 'title', index)}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Kategori</Form.Label>
                      <Form.Select
                        value={project.category}
                        onChange={(e) => handleChange(e, 'projects', 'category', index)}
                      >
                        <option value=''>Seçiniz</option>
                        {PROJECT_CATEGORIES.map(cat => (
                          <option key={cat.value} value={cat.value}>{cat.label}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Yıl</Form.Label>
                      <Form.Control
                        type='number'
                        value={project.year}
                        onChange={(e) => handleChange(e, 'projects', 'year', index)}
                        min={1950}
                        max={new Date().getFullYear()}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={12}>
                    <Form.Group>
                      <Form.Label>Fon Kaynağı</Form.Label>
                      <Form.Control
                        type='text'
                        value={project.fundingAgency}
                        onChange={(e) => handleChange(e, 'projects', 'fundingAgency', index)}
                        placeholder='Örn: TÜBİTAK, AB, BAP, Sanayi, vb.'
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </div>
            ))}
          </Card.Body>
        </Card>
        
        <Card className='mb-4 shadow-sm'>
          <Card.Header className='d-flex justify-content-between align-items-center'>
            <h3 className='h5 mb-0'>Tez Danışmanlıkları</h3>
            <Button 
              variant='outline-secondary' 
              size='sm' 
              onClick={addThesis}
            >
              <FaPlus className='me-1' /> Tez Ekle
            </Button>
          </Card.Header>
          <Card.Body>
            {formData.theses.map((thesis, index) => (
              <div key={index} className='mb-4 border-bottom pb-3'>
                <div className='d-flex justify-content-between align-items-center mb-2'>
                  <h4 className='h6'>Tez {index + 1}</h4>
                  {formData.theses.length > 1 && (
                    <Button 
                      variant='outline-danger' 
                      size='sm' 
                      onClick={() => removeThesis(index)}
                    >
                      <FaTrash />
                    </Button>
                  )}
                </div>
                
                <Row className='g-3'>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Kategori</Form.Label>
                      <Form.Select
                        value={thesis.category}
                        onChange={(e) => handleChange(e, 'theses', 'category', index)}
                      >
                        <option value=''>Seçiniz</option>
                        {THESIS_CATEGORIES.map(cat => (
                          <option key={cat.value} value={cat.value}>{cat.label}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Öğrenci Adı</Form.Label>
                      <Form.Control
                        type='text'
                        value={thesis.studentName}
                        onChange={(e) => handleChange(e, 'theses', 'studentName', index)}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Tez Başlığı</Form.Label>
                      <Form.Control
                        type='text'
                        value={thesis.title}
                        onChange={(e) => handleChange(e, 'theses', 'title', index)}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label>Yıl</Form.Label>
                      <Form.Control
                        type='number'
                        value={thesis.year}
                        onChange={(e) => handleChange(e, 'theses', 'year', index)}
                        min={1950}
                        max={new Date().getFullYear()}
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </div>
            ))}
          </Card.Body>
        </Card>
              
        <Card className='mb-4 shadow-sm'>
          <Card.Body>
            <Form.Check
              type='checkbox'
              label='Yukarıdaki bilgilerin doğruluğunu onaylıyorum ve başvuru için gerekli tüm belgeleri yüklediğimi beyan ederim.'
              required
              className='mb-0'
            />
          </Card.Body>
        </Card>
        
        <div className='text-end'>
          {!userInfo ? (
            <Button 
              variant='success'
              size='lg'
              disabled
              className='px-5'
            >
              Lütfen Önce Giriş Yapın
            </Button>
          ) : (
            <Button 
              type='submit' 
              variant='success'
              size='lg'
              disabled={isSubmitting || fileInfos.length === 0}
              className='px-5'
            >
              {isSubmitting ? (
                <>
                  <Spinner as='span' animation='border' size='sm' className='me-2' />
                  Başvuru Gönderiliyor...
                </>
              ) : (
                'Başvuruyu Tamamla'
              )}
            </Button>
          )}
        </div>
      </Form>
    </Container>
  );
};

export default ApplyJobScreen;