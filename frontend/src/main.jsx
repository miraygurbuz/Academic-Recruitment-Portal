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
import AdminDashboardScreen from './screens/admin/AdminDashboard/AdminDashboardScreen.jsx'
import JobApplicationsList from './components/admin/AdminApplications/AdminApplicationsByJob.jsx'
import AdminRoleManagementScreen from './screens/admin/AdminRoleManagementScreen.jsx'
import AdminFieldsScreen from './screens/admin/AdminFieldsScreen.jsx'

import ManagerAcademicFields from './screens/manager/ManagerAcademicFields/ManagerAcademicFieldsScreen.jsx'
import ManagerAcademicFieldForm from './screens/manager/ManagerAcademicFields/ManagerAcademicFieldForm.jsx'
import ManagerDashboardScreen from './screens/manager/ManagerDashboardScreen.jsx'
import ManagerApplicationsList from './screens/manager/ManagerApplicationsScreen.jsx'
import ManagerApplicationDetailsScreen from './screens/manager/ManagerApplicationDetailsScreen.jsx'
import ManagerApplicationPDFScreen from './screens/manager/ManagerApplicationPDFScreen.jsx'
import ManagerJobsScreen from './screens/manager/ManagerJobsScreen.jsx'
import ManagerJobDetailsScreen from './screens/manager/ManagerJobDetailsScreen.jsx'
import ManagerJobApplicationsScreen from './screens/manager/ManagerJobApplicationsScreen.jsx'
import ManagerAssignJuryScreen from './screens/manager/ManagerAssignJuryScreen.jsx'

import JuryDashboardScreen from './screens/jury/JuryDashboardScreen.jsx'
import JuryJobsScreen from './screens/jury/JuryJobsScreen.jsx'
import JuryJobDetailsScreen from './screens/jury/JuryJobDetailsScreen.jsx'
import JuryJobApplicationsScreen from './screens/jury/JuryJobApplicationsScreen.jsx'
import JuryApplicationDetailsScreen from './screens/jury/JuryApplicationDetailsScreen.jsx'
import JuryApplicationPDFScreen from './screens/jury/JuryApplicationPDFScreen.jsx'

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path='/' element={<App />}>
      <Route index element={<RootHandler />} />
      
      <Route path='' element={<RoleBasedRoute allowedRoles={['Aday']} allowGuest={true} />}>
        <Route path='/home' element={<HomeScreen />} />
        <Route path='/login' element={<LoginScreen />} />
        <Route path='/register' element={<RegisterScreen />} />
        <Route path='/jobs/:id' element={<JobDetailsScreen />} />
      </Route>
      
      <Route path='' element={<PrivateRoute />}>
        <Route path='/profile' element={<ProfileScreen />}/>
        <Route path='/my-applications' element={<MyApplicationsScreen/>}/>
        <Route path='/my-applications/:id' element={<ApplicationDetailsScreen />}/>
        <Route path='/jobs/:id/apply' element={<ApplyJobScreen/>}/>
      </Route>

      <Route path='' element={<RoleBasedRoute allowedRoles={['Admin']} allowGuest={false} />}>
        <Route path='/admin/home' element={<AdminDashboardScreen />} />
        <Route path='/admin/jobs/create' element={<AdminJobCreationScreen />}/>
        <Route path='/admin/jobs' element={<AdminJobsScreen />}/>
        <Route path='/admin/applications' element={<AdminApplicationsScreen />}/>
        <Route path='/admin/applications/:id' element={<AdminApplicationDetailsScreen />}/>
        <Route path='/admin/jobs/:id' element={<AdminJobDetailsScreen />} />
        <Route path='/admin/jobs/:id/edit' element={<AdminJobEditScreen />} />
        <Route path='/admin/jobs/:id/applications' element={<JobApplicationsList />} />
        <Route path='/admin/users' element={<AdminRoleManagementScreen />} />
        <Route path='/admin/fields' element={<AdminFieldsScreen />} />
      </Route>

      <Route path='' element={<RoleBasedRoute allowedRoles={['Yönetici']} allowGuest={false} />}>
        <Route path='/manager/home' element={<ManagerDashboardScreen />} />
        <Route path='/manager/academic-fields' element={<ManagerAcademicFields />}/>
        <Route path='/manager/academic-fields/edit/:id' element={<ManagerAcademicFieldForm />} />
        <Route path='/manager/applications' element={<ManagerApplicationsList />} />
        <Route path='/manager/applications/:id' element={<ManagerApplicationDetailsScreen />} />
        <Route path='/manager/applications/:id/PDF' element={<ManagerApplicationPDFScreen />} />
        <Route path='/manager/jobs' element={<ManagerJobsScreen />} />
        <Route path='/manager/jobs/:id' element={<ManagerJobDetailsScreen />} />
        <Route path='/manager/jobs/:id/applications' element={<ManagerJobApplicationsScreen />} />
        <Route path='/manager/jobs/:id/jury' element={<ManagerAssignJuryScreen />} />
      </Route>

      <Route path='' element={<RoleBasedRoute allowedRoles={['Jüri Üyesi']} allowGuest={false} />}>
        <Route path='/jury/home' element={<JuryDashboardScreen />} />
        <Route path='/jury/jobs' element={<JuryJobsScreen />}/>
        <Route path='/jury/jobs/:id' element={<JuryJobDetailsScreen />} />
        <Route path='/jury/jobs/:jobId/applications' element={<JuryJobApplicationsScreen />} />
        <Route path='/jury/applications/:applicationId' element={<JuryApplicationDetailsScreen />} />
        <Route path='/jury/applications/:id/PDF' element={<JuryApplicationPDFScreen />} />
      </Route>
      
      <Route path='*' element={<NotFoundScreen />} />
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