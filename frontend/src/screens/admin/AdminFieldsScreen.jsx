import { useState } from 'react';
import { Container, Row, Col, Table, Button, Card, Alert, Modal, Spinner, Tabs, Tab, Form, CardBody } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash, FaFilter } from 'react-icons/fa';
import { toast } from 'react-toastify';
import Loader from '../../components/common/Loader';
import { 
  useGetAcademicFieldsQuery, 
  useCreateAcademicFieldMutation, 
  useUpdateAcademicFieldMutation, 
  useDeleteAcademicFieldMutation,
  useGetDepartmentsQuery,
  useCreateDepartmentMutation,
  useUpdateDepartmentMutation,
  useDeleteDepartmentMutation,
  useGetFacultiesQuery,
  useCreateFacultyMutation,
  useUpdateFacultyMutation,
  useDeleteFacultyMutation
} from '../../slices/fieldsApiSlice';

const AdminFieldsScreen = () => {
  const [activeTab, setActiveTab] = useState('academicFields');
  
  const [searchAcademicField, setSearchAcademicField] = useState('');
  const [academicFieldToEdit, setAcademicFieldToEdit] = useState(null);
  const [showAcademicFieldModal, setShowAcademicFieldModal] = useState(false);
  const [academicFieldForm, setAcademicFieldForm] = useState({ name: '', description: '' });
  const [showDeleteAcademicFieldModal, setShowDeleteAcademicFieldModal] = useState(false);
  const [academicFieldToDelete, setAcademicFieldToDelete] = useState(null);

  const [searchDepartment, setSearchDepartment] = useState('');
  const [departmentToEdit, setDepartmentToEdit] = useState(null);
  const [showDepartmentModal, setShowDepartmentModal] = useState(false);
  const [departmentForm, setDepartmentForm] = useState({ name: '', facultyId: '' });
  const [showDeleteDepartmentModal, setShowDeleteDepartmentModal] = useState(false);
  const [departmentToDelete, setDepartmentToDelete] = useState(null);

  const [searchFaculty, setSearchFaculty] = useState('');
  const [facultyToEdit, setFacultyToEdit] = useState(null);
  const [showFacultyModal, setShowFacultyModal] = useState(false);
  const [facultyForm, setFacultyForm] = useState({ name: '', academicFieldId: '' });
  const [showDeleteFacultyModal, setShowDeleteFacultyModal] = useState(false);
  const [facultyToDelete, setFacultyToDelete] = useState(null);

  const { 
    data: academicFields, 
    isLoading: isLoadingAcademicFields, 
    isError: isErrorAcademicFields, 
    error: errorAcademicFields,
    refetch: refetchAcademicFields 
  } = useGetAcademicFieldsQuery();

  const { 
    data: departments, 
    isLoading: isLoadingDepartments, 
    isError: isErrorDepartments, 
    error: errorDepartments,
    refetch: refetchDepartments 
  } = useGetDepartmentsQuery();

  const { 
    data: faculties, 
    isLoading: isLoadingFaculties, 
    isError: isErrorFaculties, 
    error: errorFaculties,
    refetch: refetchFaculties 
  } = useGetFacultiesQuery();

  const [createAcademicField, { isLoading: isCreatingAcademicField }] = useCreateAcademicFieldMutation();
  const [updateAcademicField, { isLoading: isUpdatingAcademicField }] = useUpdateAcademicFieldMutation();
  const [deleteAcademicField, { isLoading: isDeletingAcademicField }] = useDeleteAcademicFieldMutation();

  const [createDepartment, { isLoading: isCreatingDepartment }] = useCreateDepartmentMutation();
  const [updateDepartment, { isLoading: isUpdatingDepartment }] = useUpdateDepartmentMutation();
  const [deleteDepartment, { isLoading: isDeletingDepartment }] = useDeleteDepartmentMutation();

  const [createFaculty, { isLoading: isCreatingFaculty }] = useCreateFacultyMutation();
  const [updateFaculty, { isLoading: isUpdatingFaculty }] = useUpdateFacultyMutation();
  const [deleteFaculty, { isLoading: isDeletingFaculty }] = useDeleteFacultyMutation();

  const handleOpenAcademicFieldModal = (field = null) => {
    if (field) {
      setAcademicFieldToEdit(field);
      setAcademicFieldForm({ 
        name: field.name, 
        description: field.description || '' 
      });
    } else {
      setAcademicFieldToEdit(null);
      setAcademicFieldForm({ name: '', description: '' });
    }
    setShowAcademicFieldModal(true);
  };

  const handleSaveAcademicField = async (e) => {
    e.preventDefault();
    try {
      if (academicFieldToEdit) {
        await updateAcademicField({ 
          id: academicFieldToEdit._id, 
          ...academicFieldForm 
        }).unwrap();
        toast.success('Alan başarıyla güncellendi');
      } else {
        await createAcademicField(academicFieldForm).unwrap();
        toast.success('Alan başarıyla oluşturuldu');
      }
      setShowAcademicFieldModal(false);
      refetchAcademicFields();
    } catch (err) {
      toast.error(`İşlem sırasında hata: ${err.message || 'Bilinmeyen hata'}`);
    }
  };

  const handleDeleteAcademicField = async () => {
    if (!academicFieldToDelete) return;
    
    try {
      await deleteAcademicField(academicFieldToDelete._id).unwrap();
      setShowDeleteAcademicFieldModal(false);
      refetchAcademicFields();
      toast.success('Alan başarıyla silindi');
    } catch (err) {
      toast.error(`Silme işlemi sırasında hata: ${err.message || 'Bilinmeyen hata'}`);
    }
  };

  const handleOpenDepartmentModal = (department = null) => {
    if (department) {
      setDepartmentToEdit(department);
      setDepartmentForm({ 
        name: department.name, 
        facultyId: department.faculty?._id || '' 
      });
    } else {
      setDepartmentToEdit(null);
      setDepartmentForm({ name: '', facultyId: '' });
    }
    setShowDepartmentModal(true);
  };

  const handleSaveDepartment = async (e) => {
    e.preventDefault();
    const departmentData = {
        name: departmentForm.name, 
        faculty: departmentForm.facultyId
      };
    try {
      if (departmentToEdit) {
        await updateDepartment({ 
          id: departmentToEdit._id, 
          ...departmentData
        }).unwrap();
        toast.success('Bölüm başarıyla güncellendi');
      } else {
        await createDepartment(departmentData).unwrap();
        toast.success('Bölüm başarıyla oluşturuldu');
      }
      setShowDepartmentModal(false);
      refetchDepartments();
    } catch (err) {
      toast.error(`İşlem sırasında hata: ${err.message || 'Bilinmeyen hata'}`);
    }
  };

  const handleDeleteDepartment = async () => {
    if (!departmentToDelete) return;
    
    try {
      await deleteDepartment(departmentToDelete._id).unwrap();
      setShowDeleteDepartmentModal(false);
      refetchDepartments();
      toast.success('Bölüm başarıyla silindi');
    } catch (err) {
      toast.error(`Silme işlemi sırasında hata: ${err.message || 'Bilinmeyen hata'}`);
    }
  };

  const handleOpenFacultyModal = (faculty = null) => {
    if (faculty) {
      setFacultyToEdit(faculty);
      setFacultyForm({ 
        name: faculty.name, 
        academicFieldId: faculty.academicField?._id || '' 
      });
    } else {
      setFacultyToEdit(null);
      setFacultyForm({ name: '', academicFieldId: '' });
    }
    setShowFacultyModal(true);
  };

  const handleSaveFaculty = async (e) => {
    e.preventDefault();
    const facultyData = {
        name: facultyForm.name, 
        academicField: facultyForm.academicFieldId
      };
    try {
      if (facultyToEdit) {
        await updateFaculty({ 
          id: facultyToEdit._id, 
          ...facultyData
        }).unwrap();
        toast.success('Fakülte başarıyla güncellendi');
      } else {
        await createFaculty(facultyData).unwrap();
        toast.success('Fakülte başarıyla oluşturuldu');
      }
      setShowFacultyModal(false);
      refetchFaculties();
    } catch (err) {
      toast.error(`İşlem sırasında hata: ${err.message || 'Bilinmeyen hata'}`);
    }
  };

  const handleDeleteFaculty = async () => {
    if (!facultyToDelete) return;
    
    try {
      await deleteFaculty(facultyToDelete._id).unwrap();
      setShowDeleteFacultyModal(false);
      refetchFaculties();
      toast.success('Fakülte başarıyla silindi');
    } catch (err) {
      toast.error(`Silme işlemi sırasında hata: ${err.message || 'Bilinmeyen hata'}`);
    }
  };

  const renderAcademicFieldsTable = () => {
    const filteredAcademicFields = (academicFields || []).filter(field => 
      field.name.toLowerCase().includes(searchAcademicField.toLowerCase())
    );

    return (
      <Card>
        <Card.Header>
          <Row className='align-items-center'>
            <Col>
              <h3 className='mb-0'>Akademik Alanlar</h3>
            </Col>
            <Col xs='auto'>
              <Button variant='success' onClick={() => handleOpenAcademicFieldModal()}>
                <FaPlus className='me-2' /> Yeni Alan Oluştur
              </Button>
            </Col>
          </Row>
        </Card.Header>
        <Card.Body>
          <Row className='mb-3'>
            <Col>
              <div className='input-group'>
                <span className='input-group-text'>
                  <FaFilter />
                </span>
                <input
                  type='text'
                  className='form-control'
                  placeholder='Alan adı ara...'
                  value={searchAcademicField}
                  onChange={(e) => setSearchAcademicField(e.target.value)}
                />
              </div>
            </Col>
          </Row>

          {filteredAcademicFields.length > 0 ? (
            <Table hover bordered responsive>
              <thead className='table-light'>
                <tr>
                  <th>Alan Adı</th>
                  <th>Açıklama</th>
                  <th>İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {filteredAcademicFields.map(field => (
                  <tr key={field._id}>
                    <td>{field.name}</td>
                    <td>{field.description || '-'}</td>
                    <td>
                      <div className='d-flex gap-1'>
                        <Button 
                          size='sm'
                          variant='light'
                          className='border'
                          onClick={() => handleOpenAcademicFieldModal(field)}
                          title='Alanı Düzenle'
                        >
                          <FaEdit />
                        </Button>
                        <Button 
                          size='sm' 
                          variant='outline-danger'
                          onClick={() => {
                            setAcademicFieldToDelete(field);
                            setShowDeleteAcademicFieldModal(true);
                          }}
                          title='Alanı Sil'
                        >
                          <FaTrash />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <Alert variant='info' className='text-center'>
              Herhangi bir akademik alan bulunamadı.
            </Alert>
          )}
        </Card.Body>
      </Card>
    );
  };

  const renderDepartmentsTable = () => {
    const filteredDepartments = (departments || []).filter(dept => 
      dept.name.toLowerCase().includes(searchDepartment.toLowerCase())
    );

    return (
      <Card>
        <Card.Header>
          <Row className='align-items-center'>
            <Col>
              <h3 className='mb-0'>Bölümler</h3>
            </Col>
            <Col xs='auto'>
              <Button variant='success' onClick={() => handleOpenDepartmentModal()}>
                <FaPlus className='me-2' /> Yeni Bölüm Oluştur
              </Button>
            </Col>
          </Row>
        </Card.Header>
        <Card.Body>
          <Row className='mb-3'>
            <Col>
              <div className='input-group'>
                <span className='input-group-text'>
                  <FaFilter />
                </span>
                <input
                  type='text'
                  className='form-control'
                  placeholder='Bölüm adı ara...'
                  value={searchDepartment}
                  onChange={(e) => setSearchDepartment(e.target.value)}
                />
              </div>
            </Col>
          </Row>

          {filteredDepartments.length > 0 ? (
            <Table hover bordered responsive>
              <thead className='table-light'>
                <tr>
                  <th>Bölüm Adı</th>
                  <th>Bağlı Fakülte</th>
                  <th>İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {filteredDepartments.map(dept => (
                  <tr key={dept._id}>
                    <td>{dept.name}</td>
                    <td>
                      <div>{dept.faculty?.name || 'Fakülte Bilgisi Yok'}</div>
                    </td>
                    <td>
                      <div className='d-flex gap-1'>
                        <Button 
                          size='sm'
                          variant='light'
                          className='border'
                          onClick={() => handleOpenDepartmentModal(dept)}
                          title='Bölümü Düzenle'
                        >
                          <FaEdit />
                        </Button>
                        <Button 
                          size='sm' 
                          variant='outline-danger'
                          onClick={() => {
                            setDepartmentToDelete(dept);
                            setShowDeleteDepartmentModal(true);
                          }}
                          title='Bölümü Sil'
                        >
                          <FaTrash />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <Alert variant='info' className='text-center'>
              Herhangi bir bölüm bulunamadı.
            </Alert>
          )}
        </Card.Body>
      </Card>
    );
  };

  const renderFacultiesTable = () => {
    const filteredFaculties = (faculties || []).filter(faculty => 
      faculty.name.toLowerCase().includes(searchFaculty.toLowerCase())
    );

    return (
      <Card>
        <Card.Header>
          <Row className='align-items-center'>
            <Col>
              <h3 className='mb-0'>Fakülteler</h3>
            </Col>
            <Col xs='auto'>
              <Button variant='success' onClick={() => handleOpenFacultyModal()}>
                <FaPlus className='me-2' /> Yeni Fakülte Oluştur
              </Button>
            </Col>
          </Row>
        </Card.Header>
        <Card.Body>
          <Row className='mb-3'>
            <Col>
              <div className='input-group'>
                <span className='input-group-text'>
                  <FaFilter />
                </span>
                <input
                  type='text'
                  className='form-control'
                  placeholder='Fakülte adı ara...'
                  value={searchFaculty}
                  onChange={(e) => setSearchFaculty(e.target.value)}
                />
              </div>
            </Col>
          </Row>

          {filteredFaculties.length > 0 ? (
            <Table hover bordered responsive>
              <thead className='table-light'>
                <tr>
                  <th>Fakülte Adı</th>
                  <th>Akademik Alan</th>
                  <th>İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {filteredFaculties.map(faculty => (
                  <tr key={faculty._id}>
                    <td>{faculty.name}</td>
                    <td>
                      <div>{faculty.academicField?.name || 'Alan Bilgisi Yok'}</div>
                    </td>
                    <td>
                      <div className='d-flex gap-1'>
                        <Button 
                          size='sm'
                          variant='light'
                          className='border'
                          onClick={() => handleOpenFacultyModal(faculty)}
                          title='Fakülteyi Düzenle'
                        >
                          <FaEdit />
                        </Button>
                        <Button 
                          size='sm' 
                          variant='outline-danger'
                          onClick={() => {
                            setFacultyToDelete(faculty);
                            setShowDeleteFacultyModal(true);
                          }}
                          title='Fakülteyi Sil'
                        >
                          <FaTrash />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <Alert variant='info' className='text-center'>
              Herhangi bir fakülte bulunamadı.
            </Alert>
          )}
        </Card.Body>
      </Card>
    );
  };

  const renderAcademicFieldModal = () => (
    <Modal show={showAcademicFieldModal} onHide={() => setShowAcademicFieldModal(false)}>
      <Modal.Header closeButton>
        <Modal.Title>
          {academicFieldToEdit ? 'Akademik Alanı Düzenle' : 'Yeni Akademik Alan Oluştur'}
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSaveAcademicField}>
        <Modal.Body>
          <Form.Group className='mb-3'>
            <Form.Label>Alan Adı</Form.Label>
            <Form.Control
              type='text'
              placeholder='Alan adını girin'
              value={academicFieldForm.name}
              onChange={(e) => setAcademicFieldForm({...academicFieldForm, name: e.target.value})}
              required
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Açıklama (İsteğe Bağlı)</Form.Label>
            <Form.Control
              as='textarea'
              rows={3}
              placeholder='Alan açıklaması'
              value={academicFieldForm.description}
              onChange={(e) => setAcademicFieldForm({...academicFieldForm, description: e.target.value})}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant='secondary' onClick={() => setShowAcademicFieldModal(false)}>
            İptal
          </Button>
          <Button 
            variant='success' 
            type='submit'
            disabled={isCreatingAcademicField || isUpdatingAcademicField}
          >
            {isCreatingAcademicField || isUpdatingAcademicField ? (
              <>
                <Spinner as='span' animation='border' size='sm' className='me-2' />
                Kaydediliyor...
              </>
            ) : (
              'Kaydet'
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );

  const renderDepartmentModal = () => (
    <Modal show={showDepartmentModal} onHide={() => setShowDepartmentModal(false)}>
      <Modal.Header closeButton>
        <Modal.Title>
          {departmentToEdit ? 'Bölümü Düzenle' : 'Yeni Bölüm Oluştur'}
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSaveDepartment}>
        <Modal.Body>
          <Form.Group className='mb-3'>
            <Form.Label>Bölüm Adı</Form.Label>
            <Form.Control
              type='text'
              placeholder='Bölüm adını girin'
              value={departmentForm.name}
              onChange={(e) => setDepartmentForm({...departmentForm, name: e.target.value})}
              required
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Bağlı Fakülte</Form.Label>
            <Form.Control
              as='select'
              value={departmentForm.facultyId}
              onChange={(e) => setDepartmentForm({...departmentForm, facultyId: e.target.value})}
              required
            >
              <option value=''>Fakülte Seçin</option>
              {(faculties || []).map(faculty => (
                <option key={faculty._id} value={faculty._id}>
                  {faculty.name}
                </option>
              ))}
            </Form.Control>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant='secondary' onClick={() => setShowDepartmentModal(false)}>
            İptal
          </Button>
          <Button 
            variant='success' 
            type='submit'
            disabled={isCreatingDepartment || isUpdatingDepartment}
          >
            {isCreatingDepartment || isUpdatingDepartment ? (
              <>
                <Spinner as='span' animation='border' size='sm' className='me-2' />
                Kaydediliyor...
              </>
            ) : (
              'Kaydet'
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );

  const renderFacultyModal = () => (
    <Modal show={showFacultyModal} onHide={() => setShowFacultyModal(false)}>
      <Modal.Header closeButton>
        <Modal.Title>
          {facultyToEdit ? 'Fakülteyi Düzenle' : 'Yeni Fakülte Oluştur'}
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSaveFaculty}>
        <Modal.Body>
          <Form.Group className='mb-3'>
            <Form.Label>Fakülte Adı</Form.Label>
            <Form.Control
              type='text'
              placeholder='Fakülte adını girin'
              value={facultyForm.name}
              onChange={(e) => setFacultyForm({...facultyForm, name: e.target.value})}
              required
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Akademik Alan</Form.Label>
            <Form.Control
              as='select'
              value={facultyForm.academicFieldId}
              onChange={(e) => setFacultyForm({...facultyForm, academicFieldId: e.target.value})}
              required
            >
              <option value=''>Akademik Alan Seçin</option>
              {(academicFields || []).map(field => (
                <option key={field._id} value={field._id}>
                  {field.name}
                </option>
              ))}
            </Form.Control>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant='secondary' onClick={() => setShowFacultyModal(false)}>
            İptal
          </Button>
          <Button 
            variant='success' 
            type='submit'
            disabled={isCreatingFaculty || isUpdatingFaculty}
          >
            {isCreatingFaculty || isUpdatingFaculty ? (
              <>
                <Spinner as='span' animation='border' size='sm' className='me-2' />
                Kaydediliyor...
              </>
            ) : (
              'Kaydet'
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );

  const renderDeleteDepartmentModal = () => (
    <Modal show={showDeleteDepartmentModal} onHide={() => setShowDeleteDepartmentModal(false)}>
      <Modal.Header closeButton>
        <Modal.Title>Bölümü Sil</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
          <strong>{departmentToDelete?.name}</strong> bölümünü silmek istediğinize emin misiniz?
        </p>
        <p className='text-danger'>
          Bu işlem geri alınamaz ve bu bölüme ait tüm bilgiler silinecektir.
        </p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant='secondary' onClick={() => setShowDeleteDepartmentModal(false)}>
          İptal
        </Button>
        <Button 
          variant='danger' 
          onClick={handleDeleteDepartment}
          disabled={isDeletingDepartment}
        >
          {isDeletingDepartment ? (
            <>
              <Spinner as='span' animation='border' size='sm' className='me-2' />
              Siliniyor...
            </>
          ) : (
            'Evet, Sil'
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );

  const renderDeleteAcademicFieldModal = () => (
    <Modal show={showDeleteAcademicFieldModal} onHide={() => setShowDeleteAcademicFieldModal(false)}>
      <Modal.Header closeButton>
        <Modal.Title>Akademik Alanı Sil</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
          <strong>{academicFieldToDelete?.name}</strong> akademik alanını silmek istediğinize emin misiniz?
        </p>
        <p className='text-danger'>
          Bu işlem geri alınamaz ve bu alana bağlı tüm fakülteler de silinecektir.
        </p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant='secondary' onClick={() => setShowDeleteAcademicFieldModal(false)}>
          İptal
        </Button>
        <Button 
          variant='danger' 
          onClick={handleDeleteAcademicField}
          disabled={isDeletingAcademicField}
        >
          {isDeletingAcademicField ? (
            <>
              <Spinner as='span' animation='border' size='sm' className='me-2' />
              Siliniyor...
            </>
          ) : (
            'Evet, Sil'
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );

  const renderDeleteFacultyModal = () => (
    <Modal show={showDeleteFacultyModal} onHide={() => setShowDeleteFacultyModal(false)}>
      <Modal.Header closeButton>
        <Modal.Title>Fakülteyi Sil</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
          <strong>{facultyToDelete?.name}</strong> fakültesini silmek istediğinize emin misiniz?
        </p>
        <p className='text-danger'>
          Bu işlem geri alınamaz ve bu fakülteye bağlı tüm bölümler de silinecektir.
        </p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant='secondary' onClick={() => setShowDeleteFacultyModal(false)}>
          İptal
        </Button>
        <Button 
          variant='danger' 
          onClick={handleDeleteFaculty}
          disabled={isDeletingFaculty}
        >
          {isDeletingFaculty ? (
            <>
              <Spinner as='span' animation='border' size='sm' className='me-2' />
              Siliniyor...
            </>
          ) : (
            'Evet, Sil'
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );

  if (isLoadingAcademicFields || isLoadingDepartments || isLoadingFaculties) {
    return <Loader />;
  }

  if (isErrorAcademicFields || isErrorDepartments || isErrorFaculties) {
    return (
      <Container className='mt-4'>
        <Alert variant='danger'>
          <Alert.Heading>Hata!</Alert.Heading>
          <p>
            Veriler yüklenirken bir sorun oluştu: 
            {errorAcademicFields?.message || 
             errorDepartments?.message || 
             errorFaculties?.message || 
             'Bilinmeyen hata'}
          </p>
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid className='mt-4 mb-5'>
      <div className='text-center mb-4'>
        <h1 className='h2'>Akademik Alan Yönetimi</h1>
      </div>
    <Card className='mb-4 border-0 shadow-sm'>
        <CardBody>
            <style>
            {`
              .nav-tabs .nav-link:not(.active) {
                color:rgb(0, 76, 40);
              }
            `}
          </style>
        </CardBody>
        <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className='mb-3'
      >
        <Tab eventKey='academicFields' title='Akademik Alanlar'>
          {renderAcademicFieldsTable()}
        </Tab>
        <Tab eventKey='faculties' title='Fakülteler'>
          {renderFacultiesTable()}
        </Tab>
        <Tab eventKey='departments' title='Bölümler'>
          {renderDepartmentsTable()}
        </Tab>
      </Tabs>
    </Card>
      {renderAcademicFieldModal()}
      {renderDepartmentModal()}
      {renderFacultyModal()}
      {renderDeleteAcademicFieldModal()}
      {renderDeleteDepartmentModal()}
      {renderDeleteFacultyModal()}
    </Container>
  );
};

export default AdminFieldsScreen;
