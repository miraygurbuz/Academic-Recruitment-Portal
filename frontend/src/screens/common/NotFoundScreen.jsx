import { Container, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaHome } from 'react-icons/fa';
import Amblem from '../../components/common/Amblem';

const NotFoundScreen = () => {
  const navigate = useNavigate();

  return (
    <Container 
      className="d-flex flex-column justify-content-center align-items-center text-center"
      style={{ 
        height: '100vh', 
      }}
    >
      <div className="mb-5 text-center">
        <div 
          className="rounded-circle d-inline-flex justify-content-center align-items-center mb-4"
          style={{
            width: '200px', 
            height: '200px', 
            border: '10px solid rgba(40, 167, 69, 0.2)',
            backgroundColor: 'rgba(40, 167, 69, 0.1)'
          }}
        >
          <Amblem
            size={120} 
            style={{ opacity: 0.8 }}
          />
        </div>
        
        <h1 className="display-4 fw-bold mb-3 text-dark">
          Sayfa Bulunamadı
        </h1>
        
        <p className="lead text-muted mb-4">
          Üzgünüz, aradığınız sayfa şu anda mevcut değil veya taşınmış olabilir. 
          Lütfen URL adresini kontrol ediniz veya ana sayfaya dönünüz.
        </p>
        
        <Button 
          variant="success" 
          size="lg" 
          onClick={() => navigate('/')}
          className="d-flex align-items-center justify-content-center mx-auto shadow-sm"
        >
          <FaHome className="me-2" /> Ana Sayfaya Dön
        </Button>
      </div>
      
      <div className="text-muted mt-4">
        <small>
          Hata Kodu: 404 | Sayfa Bulunamadı
        </small>
      </div>
    </Container>
  );
};

export default NotFoundScreen;