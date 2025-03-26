import { Outlet } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import Header from './components/user/Header/Header.jsx';
import Footer from './components/common/Footer.jsx';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './index.css';

const App = () => {
  return (
    <>
      <Header />
      <Container className='my-2'>
      <ToastContainer />
        <Outlet />
      </Container>
      <Footer />
    </>
  );
};

export default App;
