import { Navbar, Nav, NavDropdown, Container } from 'react-bootstrap';
import { FaSignOutAlt, FaUser, FaHome, FaClipboardList } from 'react-icons/fa';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { useLogoutMutation, useGetUserProfileQuery } from '../../../slices/usersApiSlice';
import { logout, updateUser } from '../../../slices/authSlice';
import { useEffect } from 'react';
import Amblem from '../../common/Amblem';
import NotificationDropdown from '../../common/NotificationDropdown';
import './JuryHeader.css'

const JuryHeader = () => {
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
            <Navbar expand='lg' className='navbar-jury shadow-sm py-2' bg='primary' variant='dark'>
                <Container>
                    <Navbar.Brand as={Link} to='/' className='brand-container d-flex align-items-center'>
                        <div className='brand-icon-container position-relative'>
                            <Amblem size={48} />
                        </div>
                        <span className='brand-text fw-bold ms-3 d-none d-sm-inline'>
                            ABS Jüri Paneli
                        </span>
                        <span className='brand-text fw-bold ms-3 d-inline d-sm-none'>
                            ABS Jüri
                        </span>
                    </Navbar.Brand>
                    <Navbar.Toggle aria-controls='navbar-nav' className='border-0 jury-toggler' />
                    <Navbar.Collapse id='navbar-nav' className='justify-content-end'>
                        <Nav className='ms-auto nav-links'>
                            <Nav.Link as={Link} to='/jury/home' className='nav-link-jury mx-2 d-flex align-items-center'>
                                <div className="nav-icon-container me-2">
                                    <FaHome />
                                </div>
                                <span>Ana Sayfa</span>
                            </Nav.Link>
                            <Nav.Link as={Link} to='/jury/jobs' className='nav-link-jury mx-2 d-flex align-items-center'>
                                <div className="nav-icon-container me-2">
                                    <FaClipboardList />
                                </div>
                                <span>Atanan İlanlar</span>
                            </Nav.Link>
                      
                            <div className="vertical-divider d-none d-lg-block"></div>
                            
                            <div className="nav-link-user mx-2 d-flex align-items-center">
                                <NotificationDropdown />
                            </div>                            

                            <NavDropdown
                                title={
                                    <div className='d-inline-flex align-items-center'>
                                        <div className='jury-avatar-container me-2'>
                                            <div className='jury-avatar-circle'>
                                                <FaUser />
                                            </div>
                                        </div>
                                        <div className='d-flex flex-column align-items-start'>
                                            <span className='fw-bold jury-name'>{userInfo.name} {userInfo.surname}</span>
                                            <small className='text-light jury-role'>{userInfo.role}</small>
                                        </div>
                                    </div>
                                }
                                id='username-dropdown'
                                className='dropdown-jury mx-2 nav-link-fade'>
                                <NavDropdown.Item as={Link} to='/profile' className='dropdown-item-jury py-2 text-white'>
                                    <FaUser className='me-2 dropdown-icon' />
                                    <span>Profilim</span>
                                </NavDropdown.Item>
                                <NavDropdown.Divider />
                                <NavDropdown.Item onClick={logoutHandler} className='dropdown-item-jury py-2 text-danger'>
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

export default JuryHeader;