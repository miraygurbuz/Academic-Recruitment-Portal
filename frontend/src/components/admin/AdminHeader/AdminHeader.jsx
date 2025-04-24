import { Navbar, Nav, NavDropdown, Container } from 'react-bootstrap';
import { FaFileSignature, FaSignOutAlt, FaUser, FaHome, FaUsers, FaClipboardList } from 'react-icons/fa';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useLogoutMutation, useGetUserProfileQuery } from '../../../slices/usersApiSlice';
import { logout, updateUser } from '../../../slices/authSlice';
import { useEffect } from 'react';
import Amblem from '../../common/Amblem';
import './AdminHeader.css';

const AdminHeader = () => {
    const { userInfo } = useSelector((state) => state.auth);
    
    const dispatch = useDispatch();
    const navigate = useNavigate();

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
            <Navbar expand='lg' className='navbar-admin shadow-sm py-2' bg='primary' variant='dark'>
                <Container>
                    <Navbar.Brand as={Link} to='/' className='brand-container d-flex align-items-center'>
                        <div className='brand-icon-container position-relative'>
                            <Amblem size={48} />
                        </div>
                        <span className='brand-text fw-bold ms-3 d-none d-sm-inline'>
                            ABS Admin Paneli
                        </span>
                        <span className='brand-text fw-bold ms-3 d-inline d-sm-none'>
                            ABS Admin
                        </span>
                    </Navbar.Brand>
                    <Navbar.Toggle aria-controls='navbar-nav' className='border-0 admin-toggler' />
                    <Navbar.Collapse id='navbar-nav' className='justify-content-end'>
                        <Nav className='ms-auto nav-links'>
                            <Nav.Link as={Link} to='/admin/home' className='nav-link-admin mx-2 d-flex align-items-center'>
                                <div className="nav-icon-container me-2">
                                    <FaHome />
                                </div>
                                <span>Ana Sayfa</span>
                            </Nav.Link>
                            <Nav.Link as={Link} to='/admin/applications' className='nav-link-admin mx-2 d-flex align-items-center'>
                                <div className="nav-icon-container me-2">
                                    <FaClipboardList />
                                </div>
                                <span>Başvuru Yönetimi</span>
                            </Nav.Link>
                            <Nav.Link as={Link} to='/admin/jobs' className='nav-link-admin mx-2 d-flex align-items-center'>
                                <div className="nav-icon-container me-2">
                                    <FaFileSignature />
                                </div>
                                <span>İlan Yönetimi</span>
                            </Nav.Link>
                            <Nav.Link as={Link} to='/admin/users' className='nav-link-admin mx-2 d-flex align-items-center'>
                                <div className="nav-icon-container me-2">
                                    <FaUsers />
                                </div>
                                <span>Üye Yönetimi</span>
                            </Nav.Link>
                            
                            <div className="vertical-divider d-none d-lg-block"></div>
                            
                            <NavDropdown
                                title={
                                    <div className='d-inline-flex align-items-center'>
                                        <div className='admin-avatar-container me-2'>
                                            <div className='admin-avatar-circle'>
                                                <FaUser />
                                            </div>
                                        </div>
                                        <div className='d-flex flex-column align-items-start'>
                                            <span className='fw-bold admin-name'>{userInfo.name} {userInfo.surname}</span>
                                            <small className='text-light admin-role'>{userInfo.role}</small>
                                        </div>
                                    </div>
                                }
                                id='username-dropdown'
                                className='dropdown-admin mx-2 nav-link-fade'>
                                <NavDropdown.Item as={Link} to='/profile' className='dropdown-item-admin py-2 text-white'>
                                    <FaUser className='me-2 dropdown-icon' />
                                    <span>Profilim</span>
                                </NavDropdown.Item>
                                <NavDropdown.Divider />
                                <NavDropdown.Item onClick={logoutHandler} className='dropdown-item-admin py-2 text-danger'>
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

export default AdminHeader;