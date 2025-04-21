import { Navbar, Nav, NavDropdown, Container } from 'react-bootstrap';
import { FaSignInAlt, FaUserPlus, FaUser, FaClipboardList, FaSignOutAlt } from 'react-icons/fa';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { useLogoutMutation } from '../../../slices/usersApiSlice';
import { logout } from '../../../slices/authSlice';
import Amblem from '../../common/Amblem';
import './Header.css';

const Header = () => {
    const { userInfo } = useSelector((state) => state.auth);
    
    const dispatch = useDispatch();

    const [logoutApiCall] = useLogoutMutation();

    const logoutHandler = async () => {
        try{
            await logoutApiCall().unwrap();
            dispatch(logout());
            window.location = '/';
        } catch(error){
            console.log(error);
        }
    };

    return (
        <header className="sticky-top">
            <Navbar expand='lg' className='navbar-user shadow-sm py-2' bg='dark' variant='dark'>
                <Container>
                    <Navbar.Brand as={Link} to='/' className='brand-container d-flex align-items-center'>
                        <div className='brand-icon-container position-relative'>
                            <Amblem size={48} />
                        </div>
                        <span className='brand-text fw-bold ms-3 d-none d-sm-inline'>
                            Akademik Başvuru Sistemi
                        </span>
                        <span className='brand-text fw-bold ms-3 d-inline d-sm-none'>
                            ABS
                        </span>
                    </Navbar.Brand>
                    <Navbar.Toggle aria-controls='navbar-nav' className='border-0 user-toggler' />
                    <Navbar.Collapse id='navbar-nav' className='justify-content-end'>
                        <Nav className='ms-auto nav-links'>
                            {userInfo ? (
                                <>
                                    <Nav.Link as={Link} to='/' className='nav-link-user mx-2 d-flex align-items-center'>
                                        <div className="nav-icon-container me-2">
                                            <FaClipboardList />
                                        </div>
                                        <span>İlanlar</span>
                                    </Nav.Link>
                                    <Nav.Link as={Link} to='/my-applications' className='nav-link-user mx-2 d-flex align-items-center'>
                                        <div className="nav-icon-container me-2">
                                            <FaSignInAlt />
                                        </div>
                                        <span>Başvurularım</span>
                                    </Nav.Link>
                                    <div className="vertical-divider d-none d-lg-block"></div>
                                    <NavDropdown
                                        title={
                                            <div className='d-inline-flex align-items-center'>
                                                <div className='user-avatar-container me-2'>
                                                    <div className='user-avatar-circle'>
                                                        <FaUser />
                                                    </div>
                                                </div>
                                                <div className='d-flex flex-column align-items-start'>
                                                    <span className='fw-bold user-name'>{userInfo.name} {userInfo.surname}</span>
                                                    <small className='text-light user-role'>{userInfo.role}</small>
                                                </div>
                                            </div>
                                        }
                                        id='username-dropdown'
                                        className='dropdown-user mx-2 nav-link-fade'>
                                        <NavDropdown.Item as={Link} to='/profile' className='dropdown-item-user py-2 text-white'>
                                            <FaUser className='me-2 dropdown-icon' />
                                            <span>Profilim</span>
                                        </NavDropdown.Item>
                                        <NavDropdown.Divider />
                                        <NavDropdown.Item onClick={logoutHandler} className='dropdown-item-user py-2 text-danger'>
                                            <FaSignOutAlt className='me-2 dropdown-icon' />
                                            <span>Çıkış yap</span>
                                        </NavDropdown.Item>
                                    </NavDropdown>
                                </>
                            ) : (
                                <>
                                    <Nav.Link as={Link} to='/login' className='nav-link-user btn-nav-login mx-2 px-3 py-2'>
                                        <FaSignInAlt className='me-2' />
                                        <span>Giriş Yap</span>
                                    </Nav.Link>
                                    <Nav.Link as={Link} to='/register' className='nav-link-user btn-nav-register mx-2 px-3 py-2'>
                                        <FaUserPlus className='me-2' />
                                        <span>Kayıt Ol</span>
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