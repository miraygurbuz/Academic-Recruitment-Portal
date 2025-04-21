import { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, FormLabel, FormControl, Card, Badge} from 'react-bootstrap';
import FormContainer from '../../components/common/FormContainer';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import Loader from '../../components/common/Loader';
import { setCredentials } from '../../slices/authSlice';
import { useUpdateUserMutation } from '../../slices/usersApiSlice';
import { FaUser, FaIdCard } from 'react-icons/fa';

const ProfileScreen = () => {

    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [surname, setSurname] = useState('');
    const [tcKimlik, setTcKimlik] = useState('');
    const [role, setRole] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const dispatch = useDispatch();
    
    const { userInfo } = useSelector((state)=>state.auth);
    
    const [updateProfile, {isLoading}] = useUpdateUserMutation();

    useEffect(() => {
        if (userInfo) {
            setName(userInfo.name);
            setSurname(userInfo.surname);
            setEmail(userInfo.email);
            setTcKimlik(userInfo.tcKimlik);
            setRole(userInfo.role);
        }
    }, [userInfo]);

    const submitHandler = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            toast.error('Şifreler uyuşmuyor.');
        } else {
            try {
                const res = await updateProfile({
                    _id: userInfo._id,
                    email,
                    currentPassword,
                    password,
                }).unwrap();
                dispatch(setCredentials({ ...res }));
                toast.success('Bilgiler başarıyla güncellendi.')
            } catch (error) {
                toast.error(error?.data?.message || error.error);
            }
        }
    }

    return (
        <Container className="mt-4">
        <div className='text-center mb-4'>
          <h1 className='h2'>Profil Bilgileri</h1>
        </div>
        <FormContainer>
        <Card className='mb-4 shadow-sm border rounded'>
        <Card.Header className='bg-light py-3'>
          <div className='d-flex align-items-center'>
            <div className='d-flex justify-content-center align-items-center bg-success text-white rounded-circle p-2 me-3' style={{ width: '40px', height: '40px' }}>
              <FaUser size={20} />
            </div>
            <h5 className='mb-0'>Kişisel Bilgiler</h5>
            <Badge bg="secondary" className="ms-auto">{role}</Badge>
          </div>
        </Card.Header>
      
      <Card.Body className='py-4'>
        <Row>
          <Col md={6} className='mb-3 mb-md-0'>
            <div className='d-flex'>
              <div className='me-3 text-success'>
                <FaIdCard size={15} />
              </div>
              <div>
                <h6 className='text-muted mb-1 small'>TC Kimlik No</h6>
                <p className='mb-0 fw-bold'>{tcKimlik}</p>
              </div>
            </div>
          </Col>
          
          <Col md={6} className='mb-3 mb-md-0'>
            <div className='d-flex'>
              <div className='me-3 text-success'>
                <FaUser size={15} />
              </div>
              <div>
                <h6 className='text-muted mb-1 small'>Ad Soyad</h6>
                <p className='mb-0 fw-bold'>{name} {surname}</p>
              </div>
            </div>
          </Col>
        </Row>
      </Card.Body>
    </Card>
          <div className='text-center mb-4'>
            <h4 className='text-muted'>Bilgileri Güncelle</h4>
          </div>
  
          <Form onSubmit={submitHandler}>
            <Form.Group className='my-2' controlId ='email'>
              <FormLabel>Email Adresi</FormLabel>
              <FormControl
                type='email'
                placeholder='Email Girin'
                value={email}
                onChange={(e) => setEmail(e.target.value)}>
              </FormControl>
            </Form.Group>
            
            <div className='text-center mb-4 mt-5'>
              <h4 className='text-muted'>Şifre Güncelle</h4>
            </div>
  
            <Form.Group className='my-2' controlId='currentPassword'>
              <FormLabel>Mevcut Şifreniz</FormLabel>
              <FormControl
                type='password'
                placeholder='Mevcut Şifrenizi Girin'
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </Form.Group>
  
            <Form.Group className='my-2' controlId ='password'>
              <FormLabel>Şifre</FormLabel>
              <FormControl
                type='password'
                placeholder='Şifre Girin'
                value={password}
                onChange={(e) => setPassword(e.target.value)}>
              </FormControl>
            </Form.Group>
  
            <Form.Group className='my-2' controlId ='confirmPassword'>
              <FormLabel>Şifre Onayı</FormLabel>
              <FormControl
                type='password'
                placeholder='Şifrenizi Tekrar Girin'
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}>
              </FormControl>
            </Form.Group>
            
            {isLoading && <Loader />}
  
            <Button type='submit' variant='success' className='mt-3 w-100'>
              Güncelle
            </Button>
          </Form>
        </FormContainer>
      </Container>
    )
}

export default ProfileScreen;