import './CategoryBar.css'

function CategoryBar(){
    return (
        <>
            <div className='main-container'>
                <div className='tab-container'>
                    <button className='tab'>Fiction</button>
                    <button className='tab'>Horror</button>
                    <button className='tab'>Adventure</button>
                    <button className='tab'>Fantasy</button>
                    <button className='tab'>Romance</button>
                    <button className='tab'>Thriller</button>
                </div>
            </div>
        </>
    );
}

export default CategoryBar;