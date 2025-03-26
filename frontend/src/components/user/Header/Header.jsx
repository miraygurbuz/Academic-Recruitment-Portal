import { Navbar, Nav, NavDropdown, Container } from 'react-bootstrap';
import { FaSignInAlt, FaUserPlus, FaUser, FaClipboardList, FaSignOutAlt } from 'react-icons/fa';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useLogoutMutation } from '../../../slices/usersApiSlice';
import { logout } from '../../../slices/authSlice';
import Amblem from '../../common/Amblem';
import './Header.css';

const Header = () => {
    const { userInfo } = useSelector((state) => state.auth);
    
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [logoutApiCall] = useLogoutMutation();

    const logoutHandler = async () => {
        try{
            await logoutApiCall().unwrap();
            dispatch(logout());
            navigate('/');
        } catch(error){
            console.log(error);
        }
    };

    return (
        <header>
            <Navbar expand='lg' className='navbar-user shadow-lg py-2' bg='dark' variant='dark'>
                <Container>
                    <Navbar.Brand as={Link} to='/' className='brand-container d-flex align-items-center'>
                    <div className='brand-icon-container'>
                        <Amblem size={50} />
                    </div>
                        <span className='brand-text fw-bold ms-2'>Akademik Başvuru Sistemi</span>
                    </Navbar.Brand>
                    <Navbar.Toggle aria-controls='navbar-nav' className='border-0 user-toggler' />
                    <Navbar.Collapse id='navbar-nav' className='justify-content-end'>
                        <Nav className='ms-auto nav-links'>
                            {userInfo ? (
                                <>
                                    <Nav.Link as={Link} to='/' className='nav-link-user mx-1'>
                                        <FaClipboardList className='me-2' />
                                        İlanlar
                                    </Nav.Link>
                                    <Nav.Link as={Link} to='/' className='nav-link-user mx-1'>
                                        <FaSignInAlt className='me-2' />
                                        Başvurularım
                                    </Nav.Link>
                                    <NavDropdown
                                        title={
                                            <div className='d-inline-flex align-items-center'>
                                                <div className='user-avatar me-2'>
                                                    <FaUser />
                                                </div>
                                                <span>
                                                    {userInfo.name} {userInfo.surname}
                                                </span>
                                            </div>
                                        }
                                        id='username-dropdown'
                                        className='dropdown-user mx-1'
                                    >
                                        <NavDropdown.Item as={Link} to='/profile' className='dropdown-item-user'>
                                            <FaUser className='me-2' />
                                            Profilim
                                        </NavDropdown.Item>
                                        <NavDropdown.Divider />
                                        <NavDropdown.Item onClick={logoutHandler} className='dropdown-item-user text-danger'>
                                            <FaSignOutAlt className='me-2' />
                                            Çıkış yap
                                        </NavDropdown.Item>
                                    </NavDropdown>
                                </>
                            ) : (
                                <>
                                    <Nav.Link as={Link} to='/login' className='nav-link-user btn-nav-login mx-1'>
                                        <FaSignInAlt className='me-2' />
                                        Giriş Yap
                                    </Nav.Link>
                                    <Nav.Link as={Link} to='/register' className='nav-link-user btn-nav-register mx-1'>
                                        <FaUserPlus className='me-2' />
                                        Kayıt Ol
                                    </Nav.Link>
                                </>
                            )}
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
        </header>
    );
};

export default Header;
