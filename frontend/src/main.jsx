import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {
    createBrowserRouter,
    createRoutesFromElements,
    Route,
    RouterProvider,
} from 'react-router-dom'
import 'bootstrap/dist/css/bootstrap.min.css'
import './index.css'
import store from './store'
import App from './App.jsx'
import { Provider } from 'react-redux'

import RootHandler from './components/common/RootHandler.jsx'
import PrivateRoute from './components/common/PrivateRoute.jsx'
import RoleBasedRoute from './components/common/RoleBasedRoute.jsx'

import LoginScreen from './screens/common/LoginScreen.jsx'
import RegisterScreen from './screens/common/RegisterScreen.jsx'
import NotFoundScreen from './screens/common/NotFoundScreen.jsx'
import ProfileScreen from './screens/common/ProfileScreen.jsx'

import HomeScreen from './screens/user/HomeScreen/HomeScreen.jsx'
import JobDetailsScreen from './screens/user/JobDetailsScreen.jsx'
import ApplyJobScreen from './screens/user/ApplyJobScreen.jsx'
import ApplicationDetailsScreen from './screens/user/ApplicationDetailsScreen.jsx'
import MyApplicationsScreen from './screens/user/MyApplicationsScreen.jsx'

import AdminApplicationsScreen from './screens/admin/AdminApplicationsScreen.jsx'
import AdminApplicationDetailsScreen from './screens/admin/AdminApplicationDetailsScreen.jsx'
import AdminJobEditScreen from './screens/admin/AdminJobEditScreen.jsx'
import AdminJobDetailsScreen from './screens/admin/AdminJobDetailsScreen.jsx'
import AdminJobCreationScreen from './screens/admin/AdminJobCreationScreen.jsx'
import AdminJobsScreen from './screens/admin/AdminJobsScreen.jsx'
import DashboardScreen from './screens/admin/AdminDashboardScreen/AdminDashboardScreen.jsx'
import JobApplicationsList from './components/admin/AdminApplications/AdminApplicationsByJob.jsx'

import ManagerAcademicFields from './screens/manager/ManagerAcademicFields/ManagerAcademicFieldsScreen.jsx'
import ManagerAcademicFieldForm from './screens/manager/ManagerAcademicFields/ManagerAcademicFieldForm.jsx'

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path='/' element={<App />}>
      <Route index element={<RootHandler />} />
      
      <Route path='' element={<RoleBasedRoute allowedRoles={['Aday']} allowGuest={true} />}>
        <Route path='/home' element={<HomeScreen />} />
        <Route path='/login' element={<LoginScreen />} />
        <Route path='/register' element={<RegisterScreen />} />
        <Route path="/jobs/:id" element={<JobDetailsScreen />} />
      </Route>
      
      <Route path='' element={<PrivateRoute />}>
        <Route path='/profile' element={<ProfileScreen />}/>
        <Route path='/my-applications' element={<MyApplicationsScreen/>}/>
        <Route path='/my-applications/:id' element={<ApplicationDetailsScreen />}/>
        <Route path='/jobs/:id/apply' element={<ApplyJobScreen/>}/>
      </Route>

      <Route path='' element={<RoleBasedRoute allowedRoles={['Admin']} allowGuest={false} />}>
        <Route path='/admin/home' element={<DashboardScreen />} />
        <Route path='/admin/jobs/create' element={<AdminJobCreationScreen />}/>
        <Route path='/admin/jobs' element={<AdminJobsScreen />}/>
        <Route path='/admin/applications' element={<AdminApplicationsScreen />}/>
        <Route path='/admin/applications/:id' element={<AdminApplicationDetailsScreen />}/>
        <Route path="/admin/jobs/:id" element={<AdminJobDetailsScreen />} />
        <Route path="/admin/jobs/:id/edit" element={<AdminJobEditScreen />} />
        <Route path="/admin/jobs/:id/applications" element={<JobApplicationsList />} />
      </Route>

      <Route path='' element={<RoleBasedRoute allowedRoles={['Yönetici']} allowGuest={false} />}>
        <Route path='/manager/home' element={<DashboardScreen />} />
        <Route path='/manager/academic-fields' element={<ManagerAcademicFields />}/>
        <Route path="/manager/academic-fields/edit/:id" element={<ManagerAcademicFieldForm />} />
      </Route>

      <Route path='' element={<RoleBasedRoute allowedRoles={['Jüri Üyesi']} allowGuest={false} />}>
        <Route path='/jury/home' element={<DashboardScreen />} />
      </Route>
      
      <Route path="*" element={<NotFoundScreen />} />
    </Route>
  )
)

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>
  </Provider>
)