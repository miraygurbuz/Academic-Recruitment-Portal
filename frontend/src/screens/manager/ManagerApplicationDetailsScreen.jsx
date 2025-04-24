import { useParams } from 'react-router-dom';
import ApplicationDetails from '../../components/applications/ApplicationDetails';

const ManagerApplicationDetailsScreen = () => {
  const { id } = useParams();
  
  return (
    <ApplicationDetails 
      applicationId={id}
    />
  );
};

export default ManagerApplicationDetailsScreen;