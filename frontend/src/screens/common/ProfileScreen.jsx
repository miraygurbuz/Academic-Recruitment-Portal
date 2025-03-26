import { useState, useEffect } from 'react';
import { Form, Button, FormLabel, FormControl, Card } from 'react-bootstrap';
import FormContainer from '../../components/common/FormContainer';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import Loader from '../../components/common/Loader';
import { setCredentials } from '../../slices/authSlice';
import { useUpdateUserMutation } from '../../slices/usersApiSlice';

const ProfileScreen = () => {

    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [surname, setSurname] = useState('');
    const [tcKimlik, setTcKimlik] = useState('');
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
        }
    }, [userInfo]);

    useEffect(() => {
        const fetchTcKimlik = async () => {
          const response = await fetch('/api/users/profile', {
            method: 'GET',
            credentials: 'include',
          });
          const data = await response.json();
          setTcKimlik(data.tcKimlik);
        };
    
        fetchTcKimlik();
      }, []);
    
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
        <FormContainer>
            <h1 className='fw-bold mb-4'>Profil Bilgileri</h1>
            <Card className='mb-4'>
                <Card.Body>
                    <div className='d-flex flex-column'>
                        <div className='mb-3'>
                            <h6 className='text-muted mb-1'>TC Kimlik No</h6>
                            <p className='mb-0 fw-bold'>{tcKimlik}</p>
                        </div>
                        <div className='mb-3'>
                            <h6 className='text-muted mb-1'>Ad</h6>
                            <p className='mb-0 fw-bold'>{name}</p>
                        </div>
                        <div className='mb-3'>
                            <h6 className='text-muted mb-1'>Soyad</h6>
                            <p className='mb-0 fw-bold'>{surname}</p>
                        </div>
                    </div>
                </Card.Body>
            </Card>

            <h4 className='fw-bold mb-3'>Bilgileri Güncelle</h4>

            <Form onSubmit={submitHandler}>
                <Form.Group className='my-2' controlId ='email'>
                    <FormLabel>Email Adresi</FormLabel>
                    <FormControl
                    type='email'
                    placeholder='Email Girin'
                    value={email}
                    onChange={(e)=> setEmail(e.target.value) }>
                    </FormControl>
                </Form.Group>

                <h4 className='fw-bold mt-4 mb-3'>Şifre Güncelle</h4>

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
                    onChange={(e)=> setPassword(e.target.value) }>
                    </FormControl>
                </Form.Group>

                <Form.Group className='my-2' controlId ='confirmPassword'>
                    <FormLabel>Şifre Onayı</FormLabel>
                    <FormControl
                    type='password'
                    placeholder='Şifrenizi Tekrar Girin'
                    value={confirmPassword}
                    onChange={(e)=> setConfirmPassword(e.target.value) }>
                    </FormControl>
                </Form.Group>
                
                { isLoading && <Loader />}

                <Button type='submit' variant='dark' className='mt-3'>
                    Güncelle
                </Button>
            </Form>
        </FormContainer>
    )
}

export default ProfileScreen;