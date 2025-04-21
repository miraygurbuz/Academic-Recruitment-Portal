import { useState, useEffect } from 'react';
import { Form, Button, Row, Col, ProgressBar } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useRegisterMutation } from '../../slices/usersApiSlice';
import { setCredentials } from '../../slices/authSlice';
import { FaUser, FaEnvelope, FaLock, FaIdCard, FaCalendar, FaArrowRight, FaArrowLeft, FaCheck } from 'react-icons/fa'
import { toast } from 'react-toastify';
import Loader from '../../components/common/Loader';
import FormContainer from '../../components/common/FormContainer';

const RegisterScreen = () => {
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [tcKimlik, setTcKimlik] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [formStep, setFormStep] = useState(1);
  const [validated, setValidated] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [register, { isLoading }] = useRegisterMutation();
  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    if (userInfo) {
      navigate('/');
    }
  }, [navigate, userInfo]);
  
  useEffect(() => {
    if (password) {
      let strength = 0;
      if (password.length >= 8) strength++;
      if (/[A-Z]/.test(password)) strength++;
      if (/[0-9]/.test(password)) strength++;
      if (/[^A-Za-z0-9]/.test(password)) strength++;
      setPasswordStrength(strength);
    } else {
      setPasswordStrength(0);
    }
  }, [password]);

  const nextStep = () => {
    const form = document.getElementById('registerForm');
    const isValid = form.checkValidity();
    
    if (!isValid) {
      setValidated(true);
      return;
    }
    
    if (formStep === 1) {
      if (tcKimlik.length !== 11 || !/^\d+$/.test(tcKimlik)) {
        toast.error('TC Kimlik Numarası 11 haneli bir sayı olmalıdır.');
        return;
      }
      
      if (birthYear.length !== 4 || !/^\d+$/.test(birthYear) || 
          parseInt(birthYear) < 1900 || parseInt(birthYear) > new Date().getFullYear()) {
        toast.error('Geçerli bir doğum yılı giriniz.');
        return;
      }
    }
    
    if (formStep === 2) {
      if (password !== confirmPassword) {
        toast.error('Şifreler eşleşmiyor.');
        return;
      }
      
      if (passwordStrength < 3) {
        toast.warning('Zayıf şifre, daha güçlü bir şifre seçebilirsiniz.');
      }
    }
    
    setFormStep(formStep + 1);
    setValidated(false);
  };
  
  const prevStep = () => {
    setFormStep(formStep - 1);
    setValidated(false);
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    
    try {
      const res = await register({
        name,
        surname,
        email,
        password,
        tcKimlik,
        birthYear
      }).unwrap();
      
      dispatch(setCredentials({ ...res }));
      toast.success('Kayıt işleminiz başarıyla tamamlandı!');
      navigate('/');
    } catch (err) {
      toast.error(err?.data?.message || 'Kayıt sırasında bir hata oluştu');
    }
  };

  const renderPasswordStrengthBar = () => {
    const getVariant = () => {
      switch (passwordStrength) {
        case 0: return 'danger';
        case 1: return 'danger';
        case 2: return 'warning';
        case 3: return 'info';
        case 4: return 'success';
        default: return 'danger';
      }
    };

    const getStrengthText = () => {
      switch (passwordStrength) {
        case 0: return 'Çok Zayıf';
        case 1: return 'Zayıf';
        case 2: return 'Orta';
        case 3: return 'İyi';
        case 4: return 'Güçlü';
        default: return 'Çok Zayıf';
      }
    };

    return (
      <div className='mt-2'>
        <small className='d-flex justify-content-between'>
          <span>Şifre Gücü: {getStrengthText()}</span>
        </small>
        <ProgressBar 
          now={(passwordStrength / 4) * 100} 
          style={{ height: '5px' }}
          variant={getVariant()} 
        />
      </div>
    );
  };
  
  const renderProgressBar = () => {
    return (
      <div className='mb-4'>
        <ProgressBar now={(formStep / 3) * 100}
        style={{ height: '8px' }}
        variant='success' />
        <div className='d-flex justify-content-between mt-1'>
          <span className={`small ${formStep >= 1 ? 'text-dark' : 'text-muted'}`}>Kişisel Bilgiler</span>
          <span className={`small ${formStep >= 2 ? 'text-dark' : 'text-muted'}`}>Hesap Bilgileri</span>
          <span className={`small ${formStep >= 3 ? 'text-dark' : 'text-muted'}`}>Onay</span>
        </div>
      </div>
    );
  };
  
  const renderFormStep = () => {
    switch(formStep) {
      case 1:
        return (
          <>
            <div className='text-center mb-4'>
              <h2>Kişisel Bilgiler</h2>
              <p className='text-muted'>Adım 1/3</p>
            </div>
            
            <Row>
              <Col md={6}>
                <Form.Group className='mb-3' controlId='name'>
                  <Form.Label>
                    <FaUser className='me-2' />
                    Ad
                  </Form.Label>
                  <Form.Control
                    type='text'
                    placeholder='Adınız'
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    
                  />
                  <Form.Control.Feedback type='invalid'>
                    Lütfen adınızı giriniz.
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className='mb-3' controlId='surname'>
                  <Form.Label>
                    <FaUser className='me-2' />
                    Soyad
                  </Form.Label>
                  <Form.Control
                    type='text'
                    placeholder='Soyadınız'
                    value={surname}
                    onChange={(e) => setSurname(e.target.value)}
                    required
                    
                  />
                  <Form.Control.Feedback type='invalid'>
                    Lütfen soyadınızı giriniz.
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className='mb-3' controlId='tcKimlik'>
              <Form.Label>
                <FaIdCard className='me-2' />
                TC Kimlik Numarası
              </Form.Label>
              <Form.Control
                type='text'
                placeholder='TC Kimlik Numarası'
                value={tcKimlik}
                onChange={(e) => setTcKimlik(e.target.value.replace(/[^0-9]/g, ''))}
                required
                maxLength={11}
                pattern='\d{11}'
                
              />
              <Form.Control.Feedback type='invalid'>
                TC Kimlik Numarası 11 haneli bir sayı olmalıdır.
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className='mb-3' controlId='birthYear'>
              <Form.Label>
                <FaCalendar className='me-2' />
                Doğum Yılı
              </Form.Label>
              <Form.Control
                type='text'
                placeholder='Doğum Yılı (örn: 1990)'
                value={birthYear}
                onChange={(e) => setBirthYear(e.target.value.replace(/[^0-9]/g, ''))}
                required
                maxLength={4}
                pattern='\d{4}'
                
              />
              <Form.Control.Feedback type='invalid'>
                Doğum yılı 4 haneli bir sayı olmalıdır.
              </Form.Control.Feedback>
            </Form.Group>
            
            <div className='d-flex justify-content-end mt-4'>
              <Button 
                variant='dark' 
                onClick={nextStep}
              >
                İleri <FaArrowRight className='ms-1' />
              </Button>
            </div>
          </>
        );
        
      case 2:
        return (
          <>
            <div className='text-center mb-4'>
              <h2>Hesap Bilgileri</h2>
              <p className='text-muted'>Adım 2/3</p>
            </div>
            
            <Form.Group className='mb-3' controlId='email'>
              <Form.Label>
                <FaEnvelope className='me-2' />
                Email Adresi
              </Form.Label>
              <Form.Control
                type='email'
                placeholder='Email adresiniz'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                
              />
              <Form.Control.Feedback type='invalid'>
                Lütfen geçerli bir email adresi giriniz.
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className='mb-3' controlId='password'>
              <Form.Label>
                <FaLock className='me-2' />
                Şifre
              </Form.Label>
              <Form.Control
                type='password'
                placeholder='Şifreniz'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                
              />
              {password && renderPasswordStrengthBar()}
              <Form.Text className='text-muted'>
                Şifreniz en az 8 karakter uzunluğunda olmalı ve büyük harf, rakam ve özel karakter içermelidir.
              </Form.Text>
            </Form.Group>

            <Form.Group className='mb-3' controlId='confirmPassword'>
              <Form.Label>
                <FaLock className='me-2' />
                Şifre Tekrar
              </Form.Label>
              <Form.Control
                type='password'
                placeholder='Şifrenizi tekrar girin'
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                
                isInvalid={confirmPassword && password !== confirmPassword}
              />
              <Form.Control.Feedback type='invalid'>
                Şifreler eşleşmiyor.
              </Form.Control.Feedback>
            </Form.Group>
            
            <div className='d-flex justify-content-between mt-4'>
              <Button 
                variant='outline-secondary' 
                onClick={prevStep}
              >
                <FaArrowLeft className='me-1' /> Geri
              </Button>
              <Button 
                variant='dark' 
                onClick={nextStep}
              >
                İleri <FaArrowRight className='ms-1' />
              </Button>
            </div>
          </>
        );
        
      case 3:
        return (
          <>
            <div className='text-center mb-4'>
              <h2>Üyelik Tamamla</h2>
              <p className='text-muted'>Adım 3/3</p>
            </div>
            
            <div className='bg-light p-4 rounded-3 mb-4'>
              <h5 className='mb-3'>Bilgilerinizi Kontrol Edin</h5>
              <Row>
                <Col md={6}>
                  <p><strong>Ad:</strong> {name}</p>
                  <p><strong>Soyad:</strong> {surname}</p>
                  <p><strong>TC Kimlik No:</strong> {tcKimlik}</p>
                </Col>
                <Col md={6}>
                  <p><strong>Doğum Yılı:</strong> {birthYear}</p>
                  <p><strong>Email:</strong> {email}</p>
                </Col>
              </Row>
            </div>
                     
            <div className='d-flex justify-content-between mt-4'>
              <Button 
                variant='outline-secondary' 
                onClick={prevStep}
                className='rounded-pill px-4'
              >
                <FaArrowLeft className='me-1' /> Geri
              </Button>
              <Button 
                type='submit'
                variant='success' 
                className='rounded-pill px-4'
                disabled={isLoading}
              >
                <FaCheck className='me-1' /> Kayıt Ol
              </Button>
            </div>
            
            {isLoading && (
              <div className='text-center mt-3'>
                <Loader buttonLoader/>
              </div>
            )}
          </>
        );
      default:
        return null;
    }
  };

  return (
    <FormContainer>
      <div className='text-center mb-4'>
        <h1 className='h2'>Kayıt Ol</h1>
        <p className='text-muted'>Hesabınızı oluşturun.</p>
      </div>
      
      {renderProgressBar()}

      <Form id='registerForm' noValidate validated={validated} onSubmit={submitHandler}>
        {renderFormStep()}
      </Form>

      <div className='text-center mt-4'>
        <p className='mb-0'>
          Zaten hesabınız var mı? <Link to='/login' style={{ color: 'black' }}>Giriş yapın.</Link>
        </p>
      </div>
    </FormContainer>
  );
};

export default RegisterScreen;