import { useSelector } from 'react-redux';
import HomeScreen from '../../screens/user/HomeScreen/HomeScreen';
import AdminDashboardScreen from '../../screens/admin/AdminDashboard/AdminDashboardScreen';
import ManagerDashboardScreen from '../../screens/manager/ManagerDashboardScreen';

const RootHandler = () => {
  const { userInfo } = useSelector((state) => state.auth);
  
  if (userInfo && userInfo.role === 'Admin') {
    return <AdminDashboardScreen />;
  } else if (userInfo && userInfo.role === 'Yönetici'){
    return <ManagerDashboardScreen />;
  }
  return <HomeScreen />;
};

export default RootHandler;