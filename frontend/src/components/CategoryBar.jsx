import { useNavigate } from 'react-router-dom';
import './CategoryBar.css'

function CategoryBar(){
    const navigate = useNavigate();
    const goToGenre = (genre) => {
        navigate(`/genre?genre=${genre.toLowerCase()}`);
    }
    return (
        <>
            <div className='main'>
                <div className='tab-container'>
                    <button className='tab' onClick={() => goToGenre('fiction')}>Fiction</button>
                    <button className='tab' onClick={() => goToGenre('horror')}>Horror</button>
                    <button className='tab' onClick={() => goToGenre('adventure')}>Adventure</button>
                    <button className='tab' onClick={() => goToGenre('fantasy')}>Fantasy</button>
                    <button className='tab' onClick={() => goToGenre('romance')}>Romance</button>
                    <button className='tab' onClick={() => goToGenre('thriller')}>Thriller</button>
                </div>
            </div>
        </>
    );
}

export default CategoryBar;