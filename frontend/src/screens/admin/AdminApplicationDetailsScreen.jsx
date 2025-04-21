import { useParams } from 'react-router-dom';
import ApplicationDetails from '../../components/applications/ApplicationDetails';

const AdminApplicationDetailsScreen = () => {
  const { id } = useParams();
  
  return (
    <ApplicationDetails 
      applicationId={id} 
    />
  );
};

export default AdminApplicationDetailsScreen;