import { useSelector } from 'react-redux';
import HomeScreen from '../../screens/user/HomeScreen/HomeScreen';
import DashboardScreen from '../../screens/admin/AdminDashboardScreen/AdminDashboardScreen';

const RootHandler = () => {
  const { userInfo } = useSelector((state) => state.auth);
  
  if (userInfo && (userInfo.role === 'Admin' || userInfo.role === 'Yönetici')) {
    return <DashboardScreen />;
  }
  return <HomeScreen />;
};

export default RootHandler;