import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, 
  Table, 
  Button, 
  Alert, 
  Form, 
  InputGroup 
} from 'react-bootstrap';
import { FaEdit, FaTrash, FaPlus, FaSearch } from 'react-icons/fa';
import { 
  useGetAcademicFieldsQuery, 
  useDeleteAcademicFieldMutation 
} from '../../../slices/fieldsApiSlice';
import { toast } from 'react-toastify';
import './ManagerAcademicFieldsScreen.css';
import Loader from '../../../components/common/Loader';
import Pager from '../../../components/common/Pager/Pager';

const ManagerAcademicFieldsScreen = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const itemsPerPage = 5;

  const { 
    data: academicFields, 
    isLoading, 
    isError, 
    error,
    refetch 
  } = useGetAcademicFieldsQuery();
  
  const [deleteAcademicField, { isLoading: isDeleting }] = useDeleteAcademicFieldMutation();
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedField, setSelectedField] = useState(null);
  
  const handleOpenDeleteModal = (field) => {
    setSelectedField(field);
    setShowDeleteModal(true);
  };
  
  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setSelectedField(null);
  };
  
  const handleDelete = async () => {
    try {
      await deleteAcademicField(selectedField._id).unwrap();
      toast.success('Akademik alan başarıyla silindi');
      handleCloseDeleteModal();
      refetch();
    } catch (error) {
      toast.error(error?.data?.message || 'Akademik alan silinemedi. Bir hata oluştu.');
    }
  };

  const filteredFields = academicFields && academicFields.length > 0
    ? academicFields.filter(field => 
        (field.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (field.description?.toLowerCase() || '').includes(searchTerm.toLowerCase())
      )
    : [];

  const totalPages = Math.ceil(filteredFields.length / itemsPerPage);
  
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentFields = filteredFields.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleEdit = (fieldId) => {
    navigate(`/manager/academic-fields/edit/${fieldId}`);
  };

  if (isLoading) {
    return (
      <Container className='mt-4 text-center'>
        <Loader />
        <p>İlanlar yükleniyor...</p>
      </Container>
      );
  }

  if (isError) {
    return (
      <Container className='mt-4'>
        <Alert variant='danger'>
          <Alert.Heading>Hata!</Alert.Heading>
          <p>Akademik alanlar yüklenirken bir sorun oluştu: {error?.message || 'Bilinmeyen hata'}</p>
          <Button variant='outline-danger' onClick={refetch}>
            Yeniden Dene
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className='mt-4'>
      <div className='text-center mb-4'>
        <h1 className='h2'>
            Akademik Alan & Kriter Yönetimi
        </h1>
      </div>  

      <Form.Group className='mb-4'>
        <InputGroup>
          <InputGroup.Text><FaSearch /></InputGroup.Text>
          <Form.Control
            type='text'
            placeholder='Arama yap...'
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </InputGroup>
      </Form.Group>

      <div className='d-flex justify-content-between align-items-center mb-3'>
      <div className='text-muted'>
        Toplam {academicFields?.length || 0} akademik alan, {filteredFields.length} sonuç gösteriliyor
      </div>
    </div>

      {currentFields.length > 0 ? (
        <div className='table-responsive'>
          <Table hover bordered className='align-middle'>
            <thead className='table-light'>
              <tr>
                <th>Alan Adı</th>
                <th>Profesör Min. Puan</th>
                <th>Doçent Min. Puan</th>
                <th>Dr. Öğr. Üyesi Min. Puan</th>
                <th className='text-center'>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {currentFields.map((field) => (
                <tr key={field._id}>
                  <td>{field.name}</td>
                  <td>{field.criteria?.professorCriteria?.requiredPoints || '-'}</td>
                  <td>{field.criteria?.docentCriteria?.requiredPoints || '-'}</td>
                  <td>{field.criteria?.drOgrUyesiCriteria?.requiredPoints || '-'}</td>
                  <td>
                    <div className='d-flex justify-content-center gap-2'>
                      <Button 
                        variant='outline-success' 
                        size='sm'
                        onClick={() => handleEdit(field._id)}
                        className='d-flex align-items-center'
                      >
                        <FaEdit className='me-1' /> Düzenle
                      </Button>
                      <Button 
                        variant='outline-danger' 
                        size='sm'
                        onClick={() => handleOpenDeleteModal(field)}
                        disabled={isDeleting}
                        className='d-flex align-items-center'
                      >
                        <FaTrash className='me-1' /> Sil
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      ) : (
        <Alert variant='info' className='text-center'>
          {searchTerm 
            ? 'Arama kriterlerine uygun akademik alan bulunamadı.' 
            : 'Henüz bir akademik alan tanımlanmamış.'}
        </Alert>
      )}

      {totalPages > 1 && (
        <Pager 
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          variant='success'
        />
      )}

      {showDeleteModal && (
        <div className='modal show' tabIndex='-1' style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className='modal-dialog modal-dialog-centered'>
            <div className='modal-content'>
              <div className='modal-header'>
                <h5 className='modal-title'>Akademik Alan Silme</h5>
                <Button 
                  variant='close' 
                  onClick={handleCloseDeleteModal}
                />
              </div>
              <div className='modal-body'>
                <p>
                  <strong>{selectedField?.name}</strong> adlı akademik alanı silmek istediğinize emin misiniz?
                </p>
                <p className='text-danger'>
                  Bu işlem geri alınamaz ve bu alana bağlı tüm kayıtlar etkilenebilir!
                </p>
              </div>
              <div className='modal-footer'>
                <Button 
                  variant='secondary' 
                  onClick={handleCloseDeleteModal}
                  disabled={isDeleting}
                >
                  İptal
                </Button>
                <Button 
                  variant='danger' 
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <Loader buttonLoader />
                      Siliniyor...
                    </>
                  ) : (
                    'Sil'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Container>
  );
};

export default ManagerAcademicFieldsScreen;