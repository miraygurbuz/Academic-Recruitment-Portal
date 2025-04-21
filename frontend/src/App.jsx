import { Outlet } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import Header from './components/user/Header/Header.jsx';
import AdminHeader from './components/admin/AdminHeader/AdminHeader.jsx';
import ManagerHeader from './components/manager/ManagerHeader/ManagerHeader.jsx'
import JuryHeader from './components/jury/JuryHeader/JuryHeader.jsx'
import Footer from './components/common/Footer.jsx';
import ErrorBoundary from './components/common/ErrorBoundary.jsx';
import 'react-toastify/dist/ReactToastify.css';
import './index.css';

const App = () => {
  const { userInfo } = useSelector((state) => state.auth);

  const renderHeader = () => {
    if (!userInfo || userInfo.role === 'Aday') {
      return <Header />;
    } else if (userInfo.role === 'Admin') {
      return <AdminHeader />;
    } else if (userInfo.role === 'Yönetici') {
      return <ManagerHeader />;
    } else if (userInfo.role === 'Jüri Üyesi') {
      return <JuryHeader />;
    } else {
      return <Header />;
    }
  };

  return (
    <>
      {renderHeader()}
      <Container className='my-2'>
        <ToastContainer />
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </Container>
      <Footer />
    </>
  );
};

export default App;