import Hero from '../components/common/Hero'
import { useSelector } from 'react-redux';

const HomeScreen = () => {
    const { userInfo } = useSelector((state) => state.auth);

    return (
        <>
            {!userInfo && <Hero />}
            <div className='container'>
                <h1 className='fw-bold mb-3'>İlanlar</h1>
            </div>
        </>
    );
}

export default HomeScreen;