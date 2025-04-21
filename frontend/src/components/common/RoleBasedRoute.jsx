import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

const RoleBasedRoute = ({ allowedRoles, allowGuest = true }) => {
  const { userInfo } = useSelector((state) => state.auth);

  if (!userInfo && allowGuest) {
    return <Outlet />;
  }

  if (userInfo) {
    if (allowedRoles && allowedRoles.includes(userInfo.role)) {
      return <Outlet />;
    } else {
      return <Navigate to='/' replace />;
    }
  }

  return <Navigate to='/login' replace />;
};

export default RoleBasedRoute;