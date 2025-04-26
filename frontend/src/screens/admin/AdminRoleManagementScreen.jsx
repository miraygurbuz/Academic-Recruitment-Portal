import { useState, useEffect } from 'react';
import { Container, Row, Col, Table, Button, Modal, Form, Spinner, Card } from 'react-bootstrap';
import { FaEdit, FaFilter } from 'react-icons/fa';
import { useGetUsersQuery, useUpdateUserRoleMutation } from '../../slices/usersApiSlice';
import { useGetDepartmentsQuery } from '../../slices/fieldsApiSlice';
import { toast } from 'react-toastify';
import { getRoleBadge } from '../../utils/badges.jsx';
import Loader from '../../components/common/Loader.jsx';
import Pager from '../../components/common/Pager/Pager';

const allRoles = ['Admin', 'Jüri Üyesi', 'Aday', 'Yönetici'];

const AdminRoleManagementScreen = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);
  
  const { data: users, isLoading, isError, error, refetch } = useGetUsersQuery();
  const { data: departments } = useGetDepartmentsQuery();
  const [updateUserRole, { isLoading: isUpdating }] = useUpdateUserRoleMutation();

  const [selectedRole, setSelectedRole] = useState('hepsi');
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newRole, setNewRole] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');

  const filteredUsers = selectedRole === 'hepsi' 
    ? users 
    : users?.filter(u => u.role === selectedRole);
    
  const totalUsers = filteredUsers?.length || 0;
  const totalPages = Math.ceil(totalUsers / usersPerPage);
  
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers?.slice(indexOfFirstUser, indexOfLastUser);
  
  const handleChangeRole = (user) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setSelectedDepartment(user.department?._id || '');
    setShowModal(true);
  };

  const confirmRoleChange = async () => {
    try {
      const roleData = {
        role: newRole,
        ...(newRole === 'Jüri Üyesi' ? { department: selectedDepartment } : {})
      };

      await updateUserRole({ 
        id: selectedUser._id, 
        ...roleData
      }).unwrap();
    
      setShowModal(false);
      toast.success(`${selectedUser.name} ${selectedUser.surname} kullanıcısının rolü başarıyla güncellendi.`);
      
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || 'Rol güncelleme işlemi başarısız oldu.');
    }
  };

  useEffect(() => {
    if (newRole !== 'Jüri Üyesi') {
      setSelectedDepartment('');
    }
  }, [newRole]);
  
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedRole]);

  if (isLoading) {
    return (
      <Container className='mt-4 text-center'>
        <Loader />
      </Container>
    );
  }
  
  if (isError) {
    toast.error(`Üyeler yüklenirken bir hata oluştu: ${error?.data?.message || 'Bilinmeyen hata'}`);
    return (
      <Container className='mt-4 text-center'>
        <p>Üyeler yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.</p>
      </Container>
    );
  }

  return (
    <Container fluid className='mt-4 mb-5'>
      <div className='text-center mb-4'>
        <h1 className='h2'>Üye Yönetimi</h1>
      </div>

      <Card>
        <Card.Header>
          <Row className='align-items-center'>
            <Col>
              <h3 className='mb-0'>Üyeler</h3>
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
                <Form.Select 
                  value={selectedRole} 
                  onChange={(e) => setSelectedRole(e.target.value)}
                  aria-label='Rol Filtresi'
                >
                  <option value='hepsi'>Tüm Roller</option>
                  {allRoles.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </Form.Select>
              </div>
            </Col>
          </Row>
          
          {currentUsers?.length > 0 ? (
            <>
              <div className='table-responsive'>
                <Table hover bordered>
                  <thead className='table-light'>
                    <tr>
                      <th>Ad Soyad</th>
                      <th>TC Kimlik No</th>
                      <th>Email</th>
                      <th>Rol</th>
                      <th>Kayıt Tarihi</th>
                      <th>İşlemler</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentUsers.map((user) => (
                      <tr key={user._id}>
                        <td>{user.name} {user.surname}</td>
                        <td>{user.tcKimlik}</td>
                        <td>{user.email}</td>
                        <td>
                          {getRoleBadge(user.role)}
                          {user.role === 'Jüri Üyesi' && user.department && (
                            <small className='d-block text-muted mt-1'>{user.department.name}</small>
                          )}
                        </td>
                        <td>{new Date(user.createdAt).toLocaleDateString('tr-TR')}</td>
                        <td>
                          <Button 
                            variant='success' 
                            size='sm'
                            onClick={() => handleChangeRole(user)}
                            title='Rol Değiştir'
                          >
                            <FaEdit className='me-1' /> Rol Değiştir
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
              
              <Pager 
                currentPage={currentPage} 
                totalPages={totalPages} 
                onPageChange={setCurrentPage} 
                variant='success'
              />
              
              <div className='text-center mt-2 text-muted'>
                <small>
                  Toplam {totalUsers} üyeden {indexOfFirstUser + 1}-{Math.min(indexOfLastUser, totalUsers)} arası gösteriliyor
                </small>
              </div>
            </>
          ) : (
            <div className='text-center p-4'>
              <p className='text-muted'>
                {selectedRole === 'hepsi' ? 'Kayıtlı üye bulunamadı.' : `${selectedRole} rolüne sahip üye bulunamadı.`}
              </p>
            </div>
          )}
        </Card.Body>
      </Card>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Rol Değiştir</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedUser && (
            <div>
              <p className='mb-3'>
                <strong>{selectedUser.name} {selectedUser.surname}</strong> üyesinin rolünü değiştir:
              </p>
              
              <Form.Group className='mb-3' controlId='roleSelect'>
                <Form.Label>Yeni Rol</Form.Label>
                <Form.Select 
                  value={newRole} 
                  onChange={(e) => setNewRole(e.target.value)}
                >
                  {allRoles.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </Form.Select>
              </Form.Group>

              {newRole === 'Jüri Üyesi' && (
                <Form.Group className='mb-3' controlId='departmentSelect'>
                  <Form.Label>Bölüm</Form.Label>
                  <Form.Select 
                    value={selectedDepartment} 
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                    required
                  >
                    <option value=''>Bölüm Seçin</option>
                    {departments?.map(dept => (
                      <option key={dept._id} value={dept._id}>
                        {dept.name} - {dept.faculty?.name || ''}
                      </option>
                    ))}
                  </Form.Select>
                  {newRole === 'Jüri Üyesi' && !selectedDepartment && (
                    <Form.Text className='text-danger'>
                      Jüri üyesi için bölüm seçimi zorunludur.
                    </Form.Text>
                  )}
                </Form.Group>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant='secondary' onClick={() => setShowModal(false)}>
            Vazgeç
          </Button>
          <Button 
            variant='success' 
            onClick={confirmRoleChange}
            disabled={isUpdating || (newRole === 'Jüri Üyesi' && !selectedDepartment)}
          >
            {isUpdating ? <Spinner animation='border' size='sm' /> : 'Onayla'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AdminRoleManagementScreen;