import { Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaUserPlus, FaSignInAlt } from 'react-icons/fa';
import FormContainer from './FormContainer';
import Amblem from './Amblem';

const Hero = () => {
    return (
            <FormContainer>
                    <div className='text-center mb-4'>
                        <Amblem size={75}/>
                        <h1 className='h2'>Akademik Başvuru Sistemi</h1>
                        <p className='text-muted'>Başvurularınızı hızlı ve kolay bir şekilde yapabilirsiniz.</p>
                    </div>
                    <div className='d-flex justify-content-center gap-3'>
                    <Button variant='outline-secondary' as={Link} to='/login'>
                        <FaSignInAlt className='me-2'/>
                        Giriş Yap
                    </Button>
                    <Button variant='success' as={Link} to='/register'>
                        <FaUserPlus className='me-2'/>
                        Kayıt Ol
                    </Button>
                </div>
            </FormContainer>
    );
};

export default Hero;
