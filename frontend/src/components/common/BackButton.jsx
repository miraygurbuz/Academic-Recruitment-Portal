import { Button } from 'react-bootstrap';
import { FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const BackButton = ({ text = 'Geri Dön', variant = 'secondary', className = '', ...props }) => {
  const navigate = useNavigate();
  
  const handleBack = () => {
    navigate(-1);
  };
  
  return (
    <Button
      variant={variant}
      onClick={handleBack}
      className={`d-flex align-items-center ${className}`}
      {...props}
    >
      <FaArrowLeft className='me-2' /> {text}
    </Button>
  );
};

export default BackButton;