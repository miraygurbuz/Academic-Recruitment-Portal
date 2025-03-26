import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Button, Row, Col, FormLabel, FormControl } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import FormContainer from '../../components/common/FormContainer';
import { useLoginMutation } from '../../slices/usersApiSlice';
import { setCredentials } from '../../slices/authSlice';
import { toast } from 'react-toastify';
import Loader from '../../components/common/Loader';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock, faIdCard } from '@fortawesome/free-solid-svg-icons';

const LoginScreen = () => {

    const [tcKimlik, setTcKimlik] = useState('');
    const [password, setPassword] = useState('');

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [login, { isLoading }] = useLoginMutation();

    const { userInfo } = useSelector((state)=>state.auth);

    useEffect(() => {
        if (userInfo){
            navigate('/');
        }
    }, [navigate, userInfo]);

    const submitHandler = async (e) => {
        e.preventDefault();
        try {
            const res = await login({ tcKimlik, password }).unwrap();
            dispatch(setCredentials({...res}))
            navigate('/')
        } catch (err) {
            toast.error(err?.data?.message || err.error);
        }
    };

    const handleTcKimlikChange = (e) => {
        const value = e.target.value;
        if (value === '' || /^[0-9]+$/.test(value)) {
            setTcKimlik(value);
        }
    };

    return (
        <FormContainer>
            <div className='text-center mb-4'>
                <h1 className='h2'>Giriş Yap</h1>
                <p className='text-muted'>Hoş geldiniz, giriş yapın</p>
            </div>

            <Form onSubmit={submitHandler}>
                <Form.Group className='my-2' controlId='tcKimlik'>
                    <FontAwesomeIcon icon={faIdCard} className='me-2' />
                    <FormLabel>TC Kimlik Numarası</FormLabel>
                    <FormControl
                    type='text'
                    placeholder='TC Kimlik Numarası Girin'
                    value={tcKimlik}
                    onChange={handleTcKimlikChange}
                    maxLength='11'
                    required
                    >
                    </FormControl>
                </Form.Group>

                <Form.Group className='my-2' controlId='password'>
                    <FontAwesomeIcon icon={faLock} className='me-2' />
                    <FormLabel>Şifre</FormLabel>
                    <FormControl
                    type='password'
                    placeholder='Şifre Girin'
                    value={password}
                    onChange={(e)=> setPassword(e.target.value)}
                    required
                    >
                    </FormControl>
                </Form.Group>

                {isLoading && <Loader />}

                <Button 
                    type='submit' 
                    variant='dark' 
                    className='mt-3'
                    disabled={tcKimlik.length !== 11}
                >
                    Giriş Yap
                </Button>

                <Row className='py-3'>
                    <Col>
                        Hesabınız yok mu? <Link to='/register' style={{ color: 'black' }}>Kayıt olun.</Link>
                    </Col>
                </Row>
            </Form>
        </FormContainer>
    )
    
}

export default LoginScreen;