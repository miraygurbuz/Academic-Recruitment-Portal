import './HomeScreen.css'
import Hero from '../../../components/common/Hero';
import { useSelector } from 'react-redux';
import Jobs from '../../../components/common/Jobs';

const HomeScreen = () => {
    const { userInfo } = useSelector((state) => state.auth);

    return (
        <>
            {!userInfo && <Hero />}
                <Jobs />
        </>
    );
}

export default HomeScreen;

