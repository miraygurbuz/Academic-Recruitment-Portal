import React, { useState, useEffect } from 'react';
import { Modal, Button, Alert, Spinner } from 'react-bootstrap';
import { toast } from 'react-toastify';

const PreviewModal = ({ fileUrl, onClose }) => {
  const [signedUrl, setSignedUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fileType = fileUrl ? fileUrl.split('.').pop().toLowerCase() : '';
  const isPdf = ['pdf'].includes(fileType);
  const isImage = ['jpg', 'jpeg', 'png', 'gif'].includes(fileType);
  
  useEffect(() => {
    const fetchSignedUrl = async () => {
      try {
        setLoading(true);
        const downloadUrl = `/api/applications/download?url=${encodeURIComponent(fileUrl)}`;
        
        const response = await fetch(downloadUrl);
        
        if (!response.ok) {
          throw new Error('Dosyaya erişim sağlanamadı');
        }
        const data = await response.json();
        setSignedUrl(data.signedUrl);
        setLoading(false);
      } catch (error) {
        console.error("Dosya önizleme hatası:", error);
        setError(error.message || 'Dosya önizleme hatası');
        setLoading(false);
        toast.error('Dosya görüntülenemedi: Erişim engellendi');
      }
    };
    fetchSignedUrl();
  }, [fileUrl]);
   
  return (
    <Modal show={true} onHide={onClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Belge Önizleme</Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-0">
        {loading ? (
          <div className="text-center p-5">
            <Spinner animation="border" variant="success" />
            <p className="mt-3">Dosya yükleniyor...</p>
          </div>
        ) : error ? (
          <Alert variant="danger" className="m-3">
            {error}
          </Alert>
        ) : (
          <>
            {isPdf && (
              <div style={{ height: '80vh' }}>
                <iframe 
                  src={signedUrl} 
                  style={{ width: '100%', height: '100%' }} 
                  title="PDF Viewer"
                />
              </div>
            )}
            {isImage && (
              <div className="text-center p-3">
                <img 
                  src={signedUrl} 
                  style={{ maxWidth: '100%', maxHeight: '80vh' }} 
                  alt="Document Preview" 
                  onError={() => {
                    setError('Görüntü yüklenirken hata oluştu');
                    toast.error('Görüntü yüklenemedi');
                  }}
                />
              </div>
            )}
            {!isPdf && !isImage && (
              <Alert variant="warning" className="m-3">
                Bu dosya türü önizleme için uygun değil. Lütfen dosyayı indirin.
              </Alert>
            )}
          </>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Kapat
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default PreviewModal;