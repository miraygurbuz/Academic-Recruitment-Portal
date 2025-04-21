import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Form, Button, Card, Alert, Row, Col, Tab, Nav, Table } from 'react-bootstrap';
import { FaSave, FaArrowLeft } from 'react-icons/fa';
import { 
  useGetAcademicFieldByIdQuery, 
  useUpdateAcademicFieldMutation,
  useGetFacultiesByAcademicFieldQuery 
} from '../../../slices/fieldsApiSlice';
import { 
  PUBLICATION_CATEGORIES, 
  CITATION_CATEGORIES, 
  PROJECT_CATEGORIES, 
  THESIS_CATEGORIES 
} from '../../../constants/categories';
import { toast } from 'react-toastify';
import Loader from '../../../components/common/Loader';

const RANKS = [
  { id: 'drOgrUyesiCriteria', title: 'Dr. Öğr. Üyesi' },
  { id: 'docentCriteria', title: 'Doçent' },
  { id: 'professorCriteria', title: 'Profesör' }
];

const AcademicFieldEditForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const { data: academicField, isLoading, isError, error } = useGetAcademicFieldByIdQuery(id);
  const [updateAcademicField, { isLoading: isUpdating }] = useUpdateAcademicFieldMutation();
  const { data: faculties = [] } = useGetFacultiesByAcademicFieldQuery(id);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    points: {
      A1: 60, A2: 55, A3: 40, A4: 30, A5: 25, A6: 20, A7: 15, A8: 10, A9: 8,
      D1: 4, D2: 3, D3: 2, D4: 1, D5: 3, D6: 1,
      F1: 40, F2: 15, F3: 9, F4: 4,
      H1: 250, H2: 150, H3: 100, H4: 150, H5: 120, H6: 70, H7: 30,
      H8: 100, H9: 50, H10: 40, H11: 40, H12: 20, H13: 50, H14: 25,
      H15: 20, H16: 20, H17: 10, H18: 25, H19: 12, H20: 10, H21: 10,
      H22: 10, H23: 8, H24: 6, H25: 3, H26: 100, H27: 50, H28: 10,
      E1: 2, E2: 3, E3: 3, E4: 4,
      K1: 15, K2: 12, K3: 10, K4: 8, K5: 7, K6: 6, K7: 5, K8: 4, K9: 3, K10: 5, K11: 4
    },
    criteria: {
      drOgrUyesiCriteria: { requiredPoints: 50,totalArticles: 2, asMainAuthor: 1, A1A2: 1, A1A4: 2, A1A5: 0,A1A6: 0,A1A8: 0,
        minPoints: { A1A4: 20,A1A5: 0, F1F2: 10, H1H17: 15, H1H22: 0, K1K11: 0 },
        maxPoints: { D1D6: 0, E1E4: 0, K1K11: 0 }, F1orF2: true, F1orF2Description: 'En az 1 lisans tez danışmanlığı', H1H12orH13H17: true, H1H12orH13H22: false,
        projectRequirementDescription: 'BAP veya TÜBİTAK projesinde araştırmacı olarak yer alma'
      },
      docentCriteria: { requiredPoints: 100, totalArticles: 4, asMainAuthor: 2, A1A2: 2, A1A4: 3, A1A5: 0, A1A6: 0, A1A8: 0,
        minPoints: { A1A4: 40, A1A5: 0, F1F2: 20, H1H17: 30, H1H22: 0, K1K11: 0 },
        maxPoints: { D1D6: 0, E1E4: 0, K1K11: 0 }, F1orF2: true, F1orF2Description: 'En az 1 doktora veya 2 yüksek lisans tez danışmanlığı', H1H12orH13H17: true, H1H12orH13H22: false,
        projectRequirementDescription: 'Ulusal veya uluslararası araştırma projesinde yürütücü veya araştırmacı olarak görev alma'
      },
      professorCriteria: { requiredPoints: 200, totalArticles: 6, asMainAuthor: 3, A1A2: 3, A1A4: 4, A1A5: 0, A1A6: 0, A1A8: 0,
        minPoints: { A1A4: 80, A1A5: 0, F1F2: 40, H1H17: 60, H1H22: 0, K1K11: 0 },
        maxPoints: { D1D6: 0, E1E4: 0, K1K11: 0 }, F1orF2: true, F1orF2Description: 'En az 2 doktora tez danışmanlığı', H1H12orH13H17: true, H1H12orH13H22: false,
        projectRequirementDescription: 'Uluslararası proje koordinatörlüğü veya ulusal proje yürütücülüğü'
      }
    }
  });
  
  const [activeTab, setActiveTab] = useState('general');
  const [activeRankTab, setActiveRankTab] = useState('drOgrUyesiCriteria');
  
  useEffect(() => {
    if (academicField) {
      setFormData({
        name: academicField.name || '',
        description: academicField.description || '',
        points: {
          ...formData.points,
          ...(academicField.points || {})
        },
        criteria: {
          drOgrUyesiCriteria: {
            ...formData.criteria.drOgrUyesiCriteria,
            ...(academicField.criteria?.drOgrUyesiCriteria || {})
          },
          docentCriteria: {
            ...formData.criteria.docentCriteria,
            ...(academicField.criteria?.docentCriteria || {})
          },
          professorCriteria: {
            ...formData.criteria.professorCriteria,
            ...(academicField.criteria?.professorCriteria || {})
          }
        }
      });
    }
  }, [academicField]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handlePointsChange = (category, value) => {
    setFormData(prev => ({
      ...prev,
      points: {
        ...prev.points,
        [category]: parseInt(value)
      }
    }));
  };
  
  const handleRankCriteriaChange = (rank, field, value) => {
    let processedValue = value;
    if (typeof value === 'string' && !isNaN(value) && field !== 'F1orF2Description' && field !== 'projectRequirementDescription') {
      processedValue = parseInt(value);
    }
    
    setFormData(prev => ({
      ...prev,
      criteria: {
        ...prev.criteria,
        [rank]: {
          ...prev.criteria[rank],
          [field]: processedValue
        }
      }
    }));
  };
  
  const handleNestedChange = (rank, category, field, value) => {
    const processedValue = typeof value === 'string' && !isNaN(value) ? parseInt(value) : value;
    
    setFormData(prev => ({
      ...prev,
      criteria: {
        ...prev.criteria,
        [rank]: {
          ...prev.criteria[rank],
          [category]: {
            ...prev.criteria[rank][category],
            [field]: processedValue
          }
        }
      }
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateAcademicField({ id, ...formData }).unwrap();
      toast.success('Akademik alan başarıyla güncellendi');
      navigate('/manager/academic-fields');
    } catch (err) {
      toast.error(err?.data?.message || 'Akademik alan güncellenirken bir hata oluştu');
      console.error('Update error:', err);
    }
  };
  
  if (isLoading) return <Loader />;
  
  if (isError) return (
    <Container className='mt-4'>
      <Alert variant='danger'>Hata: {error?.data?.message || 'Bilinmeyen hata'}</Alert>
      <Button variant='secondary' onClick={() => navigate('/manager/academic-fields')}>
        <FaArrowLeft /> Geri Dön
      </Button>
    </Container>
  );
  
  return (
    <Container className='mt-4'>
      <div className='d-flex justify-content-between align-items-center mb-4'>
        <h1 className='h2'>Akademik Alan Düzenleme</h1>
        <Button 
          variant='secondary' 
          onClick={() => navigate('/manager/academic-fields')}
        >
          <FaArrowLeft /> Geri Dön
        </Button>
      </div>
      
      <Form onSubmit={handleSubmit}>
        <Tab.Container id='field-edit-tabs' activeKey={activeTab}>
          <Card className='mb-4' >
            <Card.Header>
              <Nav variant='tabs'>
                <Nav.Item>
                  <Nav.Link eventKey='general' onClick={() => setActiveTab('general')}>
                    Genel Bilgiler
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey='pointValues' onClick={() => setActiveTab('pointValues')}>
                    Puan Değerleri
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey='rankCriteria' onClick={() => setActiveTab('rankCriteria')}>
                    Kadro Kriterleri
                  </Nav.Link>
                </Nav.Item>
              </Nav>
            </Card.Header>
            
            <Card.Body>
            <style>
            {`
              .nav-tabs .nav-link:not(.active) {
                color:rgb(0, 76, 40);
              }
            `}
            </style>
              <Tab.Content>
                <Tab.Pane eventKey='general'>
                  <Row>
                    <Col md={12}>
                      <Form.Group className='mb-3'>
                        <Form.Label>Alan Adı</Form.Label>
                        <Form.Control
                          type='text'
                          name='name'
                          value={formData.name}
                          onChange={handleChange}
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={12}>
                      <Form.Group className='mb-3'>
                        <Form.Label>Açıklama</Form.Label>
                        <Form.Control
                          as='textarea'
                          name='description'
                          value={formData.description}
                          onChange={handleChange}
                          rows={3}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={12}>
                      <h5>Bağlı Fakülteler</h5>
                      {faculties.length > 0 ? (
                        <ul className='list-group'>
                          {faculties.map(faculty => (
                            <li key={faculty._id} className='list-group-item'>{faculty.name}</li>
                          ))}
                        </ul>
                      ) : (
                        <Alert variant='info'>Bu alana henüz fakülte bağlanmamış</Alert>
                      )}
                    </Col>
                  </Row>
                </Tab.Pane>
                
                <Tab.Pane eventKey='pointValues'>
                  <Row>
                    <Col md={12}>
                      <h5 className='mb-3'>Yayın Kategorileri Puanları (A1-A9)</h5>
                      <Table striped bordered size='sm' className='mb-4'>
                        <thead>
                          <tr>
                            <th>Kod</th>
                            <th>Açıklama</th>
                            <th>Puan</th>
                          </tr>
                        </thead>
                        <tbody>
                          {PUBLICATION_CATEGORIES.map(category => (
                            <tr key={category.value}>
                              <td>{category.value}</td>
                              <td>{category.label.split('- ')[1]}</td>
                              <td>
                                <Form.Control
                                  type='number'
                                  min='0'
                                  value={formData.points[category.value]}
                                  onChange={(e) => handlePointsChange(category.value, e.target.value)}
                                  style={{ width: '80px' }}
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                      
                      <h5 className='mb-3'>Atıf Kategorileri Puanları (D1-D6)</h5>
                      <Table striped bordered size='sm' className='mb-4'>
                        <thead>
                          <tr>
                            <th>Kod</th>
                            <th>Açıklama</th>
                            <th>Puan</th>
                          </tr>
                        </thead>
                        <tbody>
                          {CITATION_CATEGORIES.map(category => (
                            <tr key={category.value}>
                              <td>{category.value}</td>
                              <td>{category.label.split('- ')[1]}</td>
                              <td>
                                <Form.Control
                                  type='number'
                                  min='0'
                                  value={formData.points[category.value]}
                                  onChange={(e) => handlePointsChange(category.value, e.target.value)}
                                  style={{ width: '80px' }}
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                      
                      <h5 className='mb-3'>Tez Danışmanlığı Puanları (F1-F4)</h5>
                      <Table striped bordered size='sm' className='mb-4'>
                        <thead>
                          <tr>
                            <th>Kod</th>
                            <th>Açıklama</th>
                            <th>Puan</th>
                          </tr>
                        </thead>
                        <tbody>
                          {THESIS_CATEGORIES.map(category => (
                            <tr key={category.value}>
                              <td>{category.value}</td>
                              <td>{category.label.split('- ')[1]}</td>
                              <td>
                                <Form.Control
                                  type='number'
                                  min='0'
                                  value={formData.points[category.value]}
                                  onChange={(e) => handlePointsChange(category.value, e.target.value)}
                                  style={{ width: '80px' }}
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                      
                      <h5 className='mb-3'>Proje Puanları (H1-H28)</h5>
                      <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        <Table striped bordered size='sm' className='mb-4'>
                          <thead>
                            <tr>
                              <th>Kod</th>
                              <th>Açıklama</th>
                              <th>Puan</th>
                            </tr>
                          </thead>
                          <tbody>
                            {PROJECT_CATEGORIES.map(category => (
                              <tr key={category.value}>
                                <td>{category.value}</td>
                                <td>{category.label.split('- ')[1]}</td>
                                <td>
                                  <Form.Control
                                    type='number'
                                    min='0'
                                    value={formData.points[category.value]}
                                    onChange={(e) => handlePointsChange(category.value, e.target.value)}
                                    style={{ width: '80px' }}
                                  />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      </div>
                      <br />
                      <h5 className='mb-3'>Eğitim-Öğretim Puanları (E1-E4)</h5>
                      <Table striped bordered size='sm' className='mb-4'>
                        <thead>
                          <tr>
                            <th>Kod</th>
                            <th>Açıklama</th>
                            <th>Puan</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>E1</td>
                            <td>Önlisans/lisans dersleri</td>
                            <td>
                              <Form.Control
                                type='number'
                                min='0'
                                value={formData.points.E1}
                                onChange={(e) => handlePointsChange('E1', e.target.value)}
                                style={{ width: '80px' }}
                              />
                            </td>
                          </tr>
                          <tr>
                            <td>E2</td>
                            <td>Önlisans/lisans dersleri (Yabancı dilde)</td>
                            <td>
                              <Form.Control
                                type='number'
                                min='0'
                                value={formData.points.E2}
                                onChange={(e) => handlePointsChange('E2', e.target.value)}
                                style={{ width: '80px' }}
                              />
                            </td>
                          </tr>
                          <tr>
                            <td>E3</td>
                            <td>Lisansüstü dersleri</td>
                            <td>
                              <Form.Control
                                type='number'
                                min='0'
                                value={formData.points.E3}
                                onChange={(e) => handlePointsChange('E3', e.target.value)}
                                style={{ width: '80px' }}
                              />
                            </td>
                          </tr>
                          <tr>
                            <td>E4</td>
                            <td>Lisansüstü dersleri (Yabancı dilde)</td>
                            <td>
                              <Form.Control
                                type='number'
                                min='0'
                                value={formData.points.E4}
                                onChange={(e) => handlePointsChange('E4', e.target.value)}
                                style={{ width: '80px' }}
                              />
                            </td>
                          </tr>
                        </tbody>
                      </Table>
                      
                      <h5 className='mb-3'>İdari Görev Puanları (K1-K11)</h5>
                      <Table striped bordered size='sm'>
                        <thead>
                          <tr>
                            <th>Kod</th>
                            <th>Açıklama</th>
                            <th>Puan</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>K1</td>
                            <td>Dekan/Enstitü/Yüksekokul/MYO/Merkez Müdürü</td>
                            <td>
                              <Form.Control
                                type='number'
                                min='0'
                                value={formData.points.K1}
                                onChange={(e) => handlePointsChange('K1', e.target.value)}
                                style={{ width: '80px' }}
                              />
                            </td>
                          </tr>
                          <tr>
                            <td>K2</td>
                            <td>Enstitü Müdür Yrd./Dekan Yrd./Yüksekokul Müdür Yrd./MYO Müdür Yrd./Merkez Müdürü Yrd./Bölüm Başkanı</td>
                            <td>
                              <Form.Control
                                type='number'
                                min='0'
                                value={formData.points.K2}
                                onChange={(e) => handlePointsChange('K2', e.target.value)}
                                style={{ width: '80px' }}
                              />
                            </td>
                          </tr>
                        </tbody>
                      </Table>
                    </Col>
                  </Row>
                </Tab.Pane>
                
                <Tab.Pane eventKey='rankCriteria'>
                  <Nav variant='tabs' className='mb-3'>
                    {RANKS.map(rank => (
                      <Nav.Item key={rank.id}>
                        <Nav.Link
                          active={activeRankTab === rank.id}
                          onClick={() => setActiveRankTab(rank.id)}
                        >
                          {rank.title}
                        </Nav.Link>
                      </Nav.Item>
                    ))}
                  </Nav>
                  
                  {RANKS.map(rank => (
                    <div key={rank.id} className={activeRankTab === rank.id ? '' : 'd-none'}>
                      <Row className='mb-4'>
                        <Col md={12}>
                          <Card className='mb-3'>
                            <Card.Header>Temel Kriterler</Card.Header>
                            <Card.Body>
                              <Row>
                                <Col md={4}>
                                  <Form.Group className='mb-3'>
                                    <Form.Label>Minimum Toplam Puan</Form.Label>
                                    <Form.Control
                                      type='number'
                                      min='0'
                                      value={formData.criteria[rank.id].requiredPoints}
                                      onChange={(e) => handleRankCriteriaChange(rank.id, 'requiredPoints', e.target.value)}
                                    />
                                  </Form.Group>
                                </Col>
                                <Col md={4}>
                                  <Form.Group className='mb-3'>
                                    <Form.Label>Toplam Makale Sayısı</Form.Label>
                                    <Form.Control
                                      type='number'
                                      min='0'
                                      value={formData.criteria[rank.id].totalArticles}
                                      onChange={(e) => handleRankCriteriaChange(rank.id, 'totalArticles', e.target.value)}
                                    />
                                  </Form.Group>
                                </Col>
                                <Col md={4}>
                                  <Form.Group className='mb-3'>
                                    <Form.Label>Başlıca Yazar Olarak Makale</Form.Label>
                                    <Form.Control
                                      type='number'
                                      min='0'
                                      value={formData.criteria[rank.id].asMainAuthor}
                                      onChange={(e) => handleRankCriteriaChange(rank.id, 'asMainAuthor', e.target.value)}
                                    />
                                  </Form.Group>
                                </Col>
                              </Row>
                            </Card.Body>
                          </Card>
                        </Col>
                        
                        <Col md={6}>
                          <Card className='mb-3'>
                            <Card.Header>Yayın Gereklilikleri</Card.Header>
                            <Card.Body>
                              <Form.Group className='mb-3'>
                                <Form.Label>A1-A2 Kategorisi Min. Yayın</Form.Label>
                                <Form.Control
                                  type='number'
                                  min='0'
                                  value={formData.criteria[rank.id].A1A2}
                                  onChange={(e) => handleRankCriteriaChange(rank.id, 'A1A2', e.target.value)}
                                />
                              </Form.Group>
                              <Form.Group className='mb-3'>
                                <Form.Label>A1-A4 Kategorisi Min. Yayın</Form.Label>
                                <Form.Control
                                  type='number'
                                  min='0'
                                  value={formData.criteria[rank.id].A1A4}
                                  onChange={(e) => handleRankCriteriaChange(rank.id, 'A1A4', e.target.value)}
                                />
                              </Form.Group>
                              <Form.Group className='mb-3'>
                                <Form.Label>A1-A5 Kategorisi Min. Yayın</Form.Label>
                                <Form.Control
                                  type='number'
                                  min='0'
                                  value={formData.criteria[rank.id].A1A5}
                                  onChange={(e) => handleRankCriteriaChange(rank.id, 'A1A5', e.target.value)}
                                />
                              </Form.Group>
                              <Form.Group className='mb-3'>
                                <Form.Label>A1-A6 Kategorisi Min. Yayın</Form.Label>
                                <Form.Control
                                  type='number'
                                  min='0'
                                  value={formData.criteria[rank.id].A1A6}
                                  onChange={(e) => handleRankCriteriaChange(rank.id, 'A1A6', e.target.value)}
                                />
                              </Form.Group>
                              <Form.Group>
                                <Form.Label>A1-A8 Kategorisi Min. Yayın</Form.Label>
                                <Form.Control
                                  type='number'
                                  min='0'
                                  value={formData.criteria[rank.id].A1A8}
                                  onChange={(e) => handleRankCriteriaChange(rank.id, 'A1A8', e.target.value)}
                                />
                              </Form.Group>
                            </Card.Body>
                          </Card>
                        </Col>
                        
                        <Col md={6}>
                          <Card className='mb-3'>
                            <Card.Header>Minimum Puan Gereklilikleri</Card.Header>
                            <Card.Body>
                              <Form.Group className='mb-3'>
                                <Form.Label>A1-A4 Min. Puan</Form.Label>
                                <Form.Control
                                  type='number'
                                  min='0'
                                  value={formData.criteria[rank.id].minPoints.A1A4}
                                  onChange={(e) => handleNestedChange(rank.id, 'minPoints', 'A1A4', e.target.value)}
                                />
                              </Form.Group>
                              <Form.Group className='mb-3'>
                                <Form.Label>A1-A5 Min. Puan</Form.Label>
                                <Form.Control
                                  type='number'
                                  min='0'
                                  value={formData.criteria[rank.id].minPoints.A1A5}
                                  onChange={(e) => handleNestedChange(rank.id, 'minPoints', 'A1A5', e.target.value)}
                                />
                              </Form.Group>
                              <Form.Group className='mb-3'>
                                <Form.Label>F1-F2 Min. Puan</Form.Label>
                                <Form.Control
                                  type='number'
                                  min='0'
                                  value={formData.criteria[rank.id].minPoints.F1F2}
                                  onChange={(e) => handleNestedChange(rank.id, 'minPoints', 'F1F2', e.target.value)}
                                />
                              </Form.Group>
                              <Form.Group className='mb-3'>
                                <Form.Label>H1-H17 Min. Puan</Form.Label>
                                <Form.Control
                                  type='number'
                                  min='0'
                                  value={formData.criteria[rank.id].minPoints.H1H17}
                                  onChange={(e) => handleNestedChange(rank.id, 'minPoints', 'H1H17', e.target.value)}
                                />
                              </Form.Group>
                              <Form.Group className='mb-3'>
                                <Form.Label>H1-H22 Min. Puan</Form.Label>
                                <Form.Control
                                  type='number'
                                  min='0'
                                  value={formData.criteria[rank.id].minPoints.H1H22}
                                  onChange={(e) => handleNestedChange(rank.id, 'minPoints', 'H1H22', e.target.value)}
                                />
                              </Form.Group>
                              <Form.Group>
                                <Form.Label>K1-K11 Min. Puan</Form.Label>
                                <Form.Control
                                  type='number'
                                  min='0'
                                  value={formData.criteria[rank.id].minPoints.K1K11}
                                  onChange={(e) => handleNestedChange(rank.id, 'minPoints', 'K1K11', e.target.value)}
                                />
                              </Form.Group>
                            </Card.Body>
                          </Card>
                        </Col>
                        
                        <Col md={6}>
                          <Card className='mb-3'>
                            <Card.Header>Maksimum Puan Sınırlamaları</Card.Header>
                            <Card.Body>
                              <Form.Group className='mb-3'>
                                <Form.Label>D1-D6 Maks. Puan</Form.Label>
                                <Form.Control
                                  type='number'
                                  min='0'
                                  value={formData.criteria[rank.id].maxPoints.D1D6}
                                  onChange={(e) => handleNestedChange(rank.id, 'maxPoints', 'D1D6', e.target.value)}
                                />
                              </Form.Group>
                              <Form.Group className='mb-3'>
                                <Form.Label>E1-E4 Maks. Puan</Form.Label>
                                <Form.Control
                                  type='number'
                                  min='0'
                                  value={formData.criteria[rank.id].maxPoints.E1E4}
                                  onChange={(e) => handleNestedChange(rank.id, 'maxPoints', 'E1E4', e.target.value)}
                                />
                              </Form.Group>
                              <Form.Group>
                                <Form.Label>K1-K11 Maks. Puan</Form.Label>
                                <Form.Control
                                  type='number'
                                  min='0'
                                  value={formData.criteria[rank.id].maxPoints.K1K11}
                                  onChange={(e) => handleNestedChange(rank.id, 'maxPoints', 'K1K11', e.target.value)}
                                />
                              </Form.Group>
                            </Card.Body>
                          </Card>
                        </Col>
                        
                        <Col md={12}>
                          <Card className='mb-3'>
                            <Card.Header>Ek Gereklilikler</Card.Header>
                            <Card.Body>
                              <Row>
                                <Col md={6}>
                                  <Form.Group className='mb-3'>
                                    <Form.Check
                                      type='checkbox'
                                      id={`${rank.id}-F1orF2`}
                                      label='Tez Danışmanlığı Zorunlu'
                                      checked={formData.criteria[rank.id].F1orF2}
                                      onChange={(e) => handleRankCriteriaChange(rank.id, 'F1orF2', e.target.checked)}
                                    />
                                    <Form.Control
                                      type='text'
                                      value={formData.criteria[rank.id].F1orF2Description}
                                      onChange={(e) => handleRankCriteriaChange(rank.id, 'F1orF2Description', e.target.value)}
                                      placeholder='Tez danışmanlığı açıklaması'
                                      className='mt-2'
                                    />
                                  </Form.Group>
                                </Col>
                                <Col md={6}>
                                  <Form.Group className='mb-3'>
                                    <Form.Check
                                      type='checkbox'
                                      id={`${rank.id}-H1H12orH13H17`}
                                      label='Yürütücü/Araştırmacı olarak Proje'
                                      checked={formData.criteria[rank.id].H1H12orH13H17}
                                      onChange={(e) => handleRankCriteriaChange(rank.id, 'H1H12orH13H17', e.target.checked)}
                                    />
                                  </Form.Group>
                                  <Form.Group className='mb-3'>
                                    <Form.Check
                                      type='checkbox'
                                      id={`${rank.id}-H1H12orH13H22`}
                                      label='Yürütücü/Araştırmacı/Danışman olarak Proje'
                                      checked={formData.criteria[rank.id].H1H12orH13H22}
                                      onChange={(e) => handleRankCriteriaChange(rank.id, 'H1H12orH13H22', e.target.checked)}
                                    />
                                    <Form.Control
                                      type='text'
                                      value={formData.criteria[rank.id].projectRequirementDescription}
                                      onChange={(e) => handleRankCriteriaChange(rank.id, 'projectRequirementDescription', e.target.value)}
                                      placeholder='Proje gereklilik açıklaması'
                                      className='mt-2'
                                    />
                                  </Form.Group>
                                </Col>
                              </Row>
                            </Card.Body>
                          </Card>
                        </Col>
                      </Row>
                    </div>
                  ))}
                </Tab.Pane>
              </Tab.Content>
            </Card.Body>
          </Card>
          
          <div className='text-end mb-5'>
            <Button 
              type='submit' 
              variant='success'
              disabled={isUpdating}
              className='d-flex align-items-center ms-auto'
            >
              {isUpdating ? (
                <>
                  <Loader buttonLoader/>
                  <span className='ms-2'>Kaydediliyor...</span>
                </>
              ) : (
                <>
                  <FaSave className='me-2' />
                  Değişiklikleri Kaydet
                </>
              )}
            </Button>
          </div>
        </Tab.Container>
      </Form>
    </Container>
  );
};

export default AcademicFieldEditForm;