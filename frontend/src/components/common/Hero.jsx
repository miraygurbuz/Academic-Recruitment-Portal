import { Button, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import React from 'react';
import FormContainer from './FormContainer';

const Hero = () => {
    return (
            <FormContainer>
                    <h1 className='fw-bold mb-3'>Başvuru Sistemi</h1>
                    <p className='mb-4'>
                        Başvurularınızı hızlı ve kolay bir şekilde yapabilirsiniz.
                    </p>
                    <div className='d-flex justify-content-center gap-3'>
                    <Button variant='dark' as={Link} to='/register'>
                        Kayıt Ol
                    </Button>
                    <Button variant='outline-secondary' as={Link} to='/login'>
                        Giriş Yap
                    </Button>
                </div>
            </FormContainer>
    );
};

export default Hero;
