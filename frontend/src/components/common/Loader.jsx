import { Spinner } from 'react-bootstrap';

const Loader = ({ buttonLoader = false }) => {
  if (buttonLoader) {
    return (
      <Spinner
        as='span'
        animation='border'
        size='sm'
        role='status'
        variant='success'
        aria-hidden='true'
        className='me-2'
      />
    );
  }

  return (
    <div 
      className='d-flex justify-content-center align-items-center' 
      style={{ 
        height: '100vh', 
      }}
    >
      <div className='text-center'>
        <Spinner
          animation='border'
          role='status'
          variant='success'
          style={{
            width: '80px',
            height: '80px',
            borderWidth: '4px'
          }}
        >
          <span className='visually-hidden'>Yükleniyor...</span>
        </Spinner>
        <div 
          className='mt-3 text-muted'
          style={{
            fontWeight: 500,
            fontSize: '1.1rem'
          }}
        >
          İçerik yükleniyor...
        </div>
      </div>
    </div>
  );
};

export default Loader;