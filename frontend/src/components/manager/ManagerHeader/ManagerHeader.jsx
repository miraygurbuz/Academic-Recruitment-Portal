import { Navbar, Nav, NavDropdown, Container } from 'react-bootstrap';
import { FaFileSignature, FaSignOutAlt, FaUser, FaHome, FaUsers, FaBriefcase } from 'react-icons/fa';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { useLogoutMutation, useGetUserProfileQuery } from '../../../slices/usersApiSlice';
import { logout, updateUser } from '../../../slices/authSlice';
import { useEffect } from 'react';
import Amblem from '../../common/Amblem';
import './ManagerHeader.css'
import NotificationDropdown from '../../common/NotificationDropdown';

const ManagerHeader = () => {
    const { userInfo } = useSelector((state) => state.auth);
    
    const dispatch = useDispatch();

    const [logoutApiCall] = useLogoutMutation();

    const logoutHandler = async () => {
        try{
            await logoutApiCall().unwrap();
            dispatch(logout());
            window.location = '/';
        } catch(error){}
    };

    const { data: profileData, refetch } = useGetUserProfileQuery(undefined, {
        skip: !userInfo,
    });
    
    useEffect(() => {
        if (profileData && userInfo) {
            if (JSON.stringify(profileData) !== JSON.stringify(userInfo)) {
                dispatch(updateUser(profileData));
            }
        }
    }, [profileData, userInfo, dispatch]);

    return (
        <header className="sticky-top">
            <Navbar expand='lg' className='navbar-manager shadow-sm py-2' bg='primary' variant='dark'>
                <Container>
                    <Navbar.Brand as={Link} to='/' className='brand-container d-flex align-items-center'>
                        <div className='brand-icon-container position-relative'>
                            <Amblem size={48} />
                        </div>
                        <span className='brand-text fw-bold ms-3 d-none d-sm-inline'>
                            ABS Yönetici Paneli
                        </span>
                        <span className='brand-text fw-bold ms-3 d-inline d-sm-none'>
                            ABS Yönetici
                        </span>
                    </Navbar.Brand>
                    <Navbar.Toggle aria-controls='navbar-nav' className='border-0 manager-toggler' />
                    <Navbar.Collapse id='navbar-nav' className='justify-content-end'>
                        <Nav className='ms-auto nav-links'>
                            <Nav.Link as={Link} to='/manager/home' className='nav-link-manager mx-2 d-flex align-items-center'>
                                <div className="nav-icon-container me-2">
                                    <FaHome />
                                </div>
                                <span>Ana Sayfa</span>
                            </Nav.Link>
                            <Nav.Link as={Link} to='/manager/applications' className='nav-link-manager mx-2 d-flex align-items-center'>
                                <div className="nav-icon-container me-2">
                                    <FaBriefcase />
                                </div>
                                <span>Başvurular</span>
                            </Nav.Link>
                            <Nav.Link as={Link} to='/manager/academic-fields' className='nav-link-manager mx-2 d-flex align-items-center'>
                                <div className="nav-icon-container me-2">
                                    <FaFileSignature />
                                </div>
                                <span>Kriterler</span>
                            </Nav.Link>
                            <Nav.Link as={Link} to='/manager/jobs' className='nav-link-manager mx-2 d-flex align-items-center'>
                                <div className="nav-icon-container me-2">
                                    <FaUsers />
                                </div>
                                <span>Jüri Ataması</span>
                            </Nav.Link>
                            
                            <div className="vertical-divider d-none d-lg-block"></div>

                            <div className="nav-link-user mx-2 d-flex align-items-center">
                                <NotificationDropdown />
                            </div>

                            <NavDropdown
                                title={
                                    <div className='d-inline-flex align-items-center'>
                                        <div className='manager-avatar-container me-2'>
                                            <div className='manager-avatar-circle'>
                                                <FaUser />
                                            </div>
                                        </div>
                                        <div className='d-flex flex-column align-items-start'>
                                            <span className='fw-bold manager-name'>{userInfo.name} {userInfo.surname}</span>
                                            <small className='text-light manager-role'>{userInfo.role}</small>
                                        </div>
                                    </div>
                                }
                                id='username-dropdown'
                                className='dropdown-manager mx-2 nav-link-fade'>
                                <NavDropdown.Item as={Link} to='/profile' className='dropdown-item-manager py-2 text-white'>
                                    <FaUser className='me-2 dropdown-icon' />
                                    <span>Profilim</span>
                                </NavDropdown.Item>
                                <NavDropdown.Divider />
                                <NavDropdown.Item onClick={logoutHandler} className='dropdown-item-manager py-2 text-danger'>
                                    <FaSignOutAlt className='me-2 dropdown-icon' />
                                    <span>Çıkış yap</span>
                                </NavDropdown.Item>
                            </NavDropdown>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
        </header>
    );
};

export default ManagerHeader;