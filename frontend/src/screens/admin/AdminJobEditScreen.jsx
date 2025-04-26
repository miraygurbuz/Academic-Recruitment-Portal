import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Form, Button, Container, Row, Col, Card, Spinner } from 'react-bootstrap';
import { useGetJobByIdQuery, useUpdateJobMutation } from '../../slices/jobsApiSlice';
import { useGetDepartmentsQuery } from '../../slices/fieldsApiSlice';
import { toast } from 'react-toastify';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Loader from '../../components/common/Loader';

const AdminJobEditScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const { data: job, isLoading: isJobLoading, error: jobError } = useGetJobByIdQuery(id);
  const [updateJob, { isLoading: isUpdating }] = useUpdateJobMutation();
  const { data: departments, isLoading: isDepartmentsLoading } = useGetDepartmentsQuery();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    position: '',
    department: '',
    startDate: new Date(),
    endDate: new Date(new Date().setDate(new Date().getDate() + 30)),
    requiredDocuments: [''],
    status: 'Taslak'
  });
  
  useEffect(() => {
    if (job) {
      setFormData({
        title: job.title || '',
        description: job.description || '',
        position: job.position || '',
        department: job.department?._id || '',
        startDate: new Date(job.startDate) || new Date(),
        endDate: new Date(job.endDate) || new Date(new Date().setDate(new Date().getDate() + 30)),
        requiredDocuments: job.requiredDocuments?.length ? job.requiredDocuments : [''],
        status: job.status || 'Taslak'
      });
    }
  }, [job]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleDateChange = (date, field) => {
    setFormData(prev => ({ ...prev, [field]: date }));
  };
  
  const handleDocumentChange = (index, value) => {
    const updatedDocs = [...formData.requiredDocuments];
    updatedDocs[index] = value;
    setFormData(prev => ({ ...prev, requiredDocuments: updatedDocs }));
  };
  
  const addDocumentField = () => {
    setFormData(prev => ({ 
      ...prev, 
      requiredDocuments: [...prev.requiredDocuments, ''] 
    }));
  };
  
  const removeDocumentField = (index) => {
    const updatedDocs = [...formData.requiredDocuments];
    updatedDocs.splice(index, 1);
    setFormData(prev => ({ ...prev, requiredDocuments: updatedDocs }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.position || !formData.department) {
      toast.error('Lütfen tüm zorunlu alanları doldurun.');
      return;
    }
    
    const filteredDocs = formData.requiredDocuments.filter(doc => doc.trim() !== '');
    
    try {
      await updateJob({
        id,
        ...formData,
        requiredDocuments: filteredDocs
      }).unwrap();
      
      toast.success('İlan başarıyla güncellendi!');
      
      setTimeout(() => {
        navigate('/admin/jobs');
      }, 800);
    } catch (err) {
      toast.error(`İlan güncellenirken hata oluştu: ${err.data?.message || 'Bilinmeyen hata'}`);
    }
  };
  
  const handleCancel = () => {
    navigate('/admin/jobs');
  };
  
  if (isJobLoading || isDepartmentsLoading) {
    return (
      <Loader/>
    );
  }
  
  if (jobError) {
    return (
      <Container className='mt-4'>
        <div className='text-center'>
          <h2>Hata!</h2>
          <p>İlan bilgileri yüklenirken bir hata oluştu: {jobError.data?.message || 'Bilinmeyen hata'}</p>
          <Button variant='success' onClick={() => navigate('/admin/jobs')}>
            İlanlara Dön
          </Button>
        </div>
      </Container>
    );
  }

  return (
    <Container className='mt-4 mb-5'>
      <div className='text-center mb-4'>
        <h1 className='h2'>
          İlan Düzenle
        </h1>
      </div>
      <Row className='justify-content-center'>
        <Col md={10} lg={8}>
          <Card>
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                <Form.Group className='mb-3'>
                  <Form.Label>İlan Başlığı<span style={{ color: 'red', fontWeight: 'bold' }}>*</span></Form.Label>
                  <Form.Control
                    type='text'
                    name='title'
                    value={formData.title}
                    onChange={handleChange}
                    placeholder='İlan başlığını girin'
                    required
                  />
                </Form.Group>
                
                <Form.Group className='mb-3'>
                  <Form.Label>İlan Açıklaması ve Başvuru Koşulları<span style={{ color: 'red', fontWeight: 'bold' }}>*</span></Form.Label>
                  <Form.Control
                    as='textarea'
                    rows={5}
                    name='description'
                    value={formData.description}
                    onChange={handleChange}
                    placeholder='İlan detaylarını ve aranan kriterleri girin'
                    required
                  />
                </Form.Group>
                
                <Row>
                  <Col md={6}>
                    <Form.Group className='mb-3'>
                      <Form.Label>Pozisyon<span style={{ color: 'red', fontWeight: 'bold' }}>*</span></Form.Label>
                      <Form.Select
                        name='position'
                        value={formData.position}
                        onChange={handleChange}
                        required
                      >
                        <option value=''>Pozisyon Seçin</option>
                        <option value='Dr. Öğr. Üyesi'>Dr. Öğr. Üyesi</option>
                        <option value='Doçent'>Doçent</option>
                        <option value='Profesör'>Profesör</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  
                  <Col md={6}>
                    <Form.Group className='mb-3'>
                      <Form.Label>Bölüm<span style={{ color: 'red', fontWeight: 'bold' }}>*</span></Form.Label>
                      <Form.Select
                        name='department'
                        value={formData.department}
                        onChange={handleChange}
                        required
                      >
                        <option value=''>Bölüm Seçin</option>
                        {departments?.map(dept => (
                          <option key={dept._id} value={dept._id}>
                            {dept.name} {dept.faculty ? `(${dept.faculty.name})` : ''}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>
                
                <Row>
                  <Col md={6}>
                    <Form.Group className='mb-3'>
                      <Form.Label>İlan Başlangıç Tarihi<span style={{ color: 'red', fontWeight: 'bold' }}>*</span></Form.Label>
                      <DatePicker
                        selected={formData.startDate}
                        onChange={(date) => handleDateChange(date, 'startDate')}
                        className='form-control'
                        dateFormat='dd/MM/yyyy'
                      />
                    </Form.Group>
                  </Col>
                  
                  <Col md={6}>
                    <Form.Group className='mb-3'>
                      <Form.Label>Son Başvuru Tarihi<span style={{ color: 'red', fontWeight: 'bold' }}>*</span></Form.Label>
                      <DatePicker
                        selected={formData.endDate}
                        onChange={(date) => handleDateChange(date, 'endDate')}
                        className='form-control'
                        dateFormat='dd/MM/yyyy'
                        minDate={formData.startDate}
                      />
                    </Form.Group>
                  </Col>
                </Row>
                
                <Form.Group className='mb-3'>
                  <Form.Label>Gerekli Belgeler</Form.Label>
                  {formData.requiredDocuments.map((doc, index) => (
                    <Row key={index} className='mb-2'>
                      <Col>
                        <Form.Control
                          type='text'
                          value={doc}
                          onChange={(e) => handleDocumentChange(index, e.target.value)}
                          placeholder={`Belge ${index + 1}`}
                        />
                      </Col>
                      <Col xs='auto'>
                        <Button 
                          variant='danger' 
                          onClick={() => removeDocumentField(index)}
                          disabled={formData.requiredDocuments.length === 1}
                        >
                          Sil
                        </Button>
                      </Col>
                    </Row>
                  ))}
                  <Button 
                    variant='secondary' 
                    size='sm' 
                    onClick={addDocumentField}
                    className='mt-2'
                  >
                    + Belge Ekle
                  </Button>
                </Form.Group>
                
                <Form.Group className='mb-4'>
                  <Form.Label>İlan Durumu<span style={{ color: 'red', fontWeight: 'bold' }}>*</span></Form.Label>
                  <Form.Select
                    name='status'
                    value={formData.status}
                    onChange={handleChange}
                    required
                  >
                    <option value='Taslak'>Taslak (Yayınlanmaz)</option>
                    <option value='Aktif'>Aktif (Yayınla)</option>
                  </Form.Select>
                </Form.Group>
                
                <div className='d-flex justify-content-end gap-2 mt-4'>
                  <Button variant='secondary' onClick={handleCancel}>
                    İptal
                  </Button>
                  <Button 
                    variant='success' 
                    type='submit'
                    disabled={isUpdating}
                  >
                    {isUpdating ? (
                      <>
                        <Spinner as='span' animation='border' size='sm' className='me-2' />
                        Güncelleniyor...
                      </>
                    ) : (
                      'İlanı Güncelle'
                    )}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminJobEditScreen;