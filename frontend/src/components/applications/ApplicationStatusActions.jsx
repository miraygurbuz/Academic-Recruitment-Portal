import { useState } from 'react';
import { Card, Button, Modal } from 'react-bootstrap';
import { 
  useUpdateApplicationMutation 
} from '../../slices/applicationsApiSlice';
import { toast } from 'react-toastify';

const ApplicationStatusActions = ({ 
  application, 
  userRole,
  onStatusChange 
}) => {
  const [show, setShow] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [updateApplication, { isLoading }] = useUpdateApplicationMutation();

  const canChangeStatus = userRole === 'Yönetici';
  if (!canChangeStatus) return null;

  const handleStatusChange = async (status) => {
    try {
      await updateApplication({
        id: application._id,
        status: status
      }).unwrap();
      onStatusChange && onStatusChange(status);
      toast.success(`Başvuru "${status}" olarak işaretlendi`);
      setShow(false);
    } catch (error) {
      toast.error(`İşlem gerçekleştirilemedi: ${error?.data?.message || 'Bilinmeyen hata'}`);
    }
  };

  return (
    <Card className='mb-3'>
        <Card.Header>Başvuruyu Onayla/Reddet</Card.Header>
        <Card.Body>
            {(application.status === 'Onaylandı' || application.status === 'Reddedildi') && (
                <p className="text-muted position-absolute top-100 start-0 mt-1 small">
                Başvuru onay/ret işlemleri tamamlandığından değişiklik yapamazsınız.
                </p>
            )}
            <Button 
                variant="success" 
                className="me-2"
                disabled={
                application.status !== 'Beklemede' || 
                application.status === 'Onaylandı' || 
                application.status === 'Reddedildi'
                }
                onClick={() => {
                setSelectedStatus('Onaylandı');
                setShow(true);
                }}
            >
                Onayla
            </Button>
            <Button 
                variant="danger"
                disabled={
                application.status !== 'Beklemede' || 
                application.status === 'Onaylandı' || 
                application.status === 'Reddedildi'
                }
                onClick={() => {
                setSelectedStatus('Reddedildi');
                setShow(true);
                }}
            >
                Reddet
            </Button>
            <Modal show={show} onHide={() => setShow(false)}>
                <Modal.Header closeButton>
                <Modal.Title>Başvuru Durumunu Onayla</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="text-center">
                    <p className="mb-3">Başvuruyu "{selectedStatus}" olarak işaretlemek istediğinizden emin misiniz?</p>
                    <div className="alert alert-warning" role="alert">
                        <strong>DİKKAT!</strong> Bu işlem geri alınamaz. Başvurunun durumunu bir daha değiştiremeyeceksiniz.
                    </div>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                <Button variant="secondary" onClick={() => setShow(false)}>
                    İptal
                </Button>
                <Button 
                    variant={selectedStatus === 'Onaylandı' ? 'success' : 'danger'}
                    onClick={() => handleStatusChange(selectedStatus)}
                    disabled={isLoading}
                >
                    {isLoading ? 'İşleniyor...' : 'Onayla'}
                </Button>
                </Modal.Footer>
            </Modal>
        </Card.Body>
    </Card>
  );
};

export default ApplicationStatusActions;