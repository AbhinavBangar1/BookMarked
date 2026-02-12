import './SearchPage.css'
import Header from '../components/Header';
import Footer from '../components/Footer.jsx'

function SearchPage(){
    return(
        <>
            <Header/>
            <div className='main-result'>
                <div className='filter-bar'>
                    <div className='filter-tab-container'>
                        <button className='tab-option'>Books</button>
                        <button className='tab-option'>Authors</button>
                        <button className='tab-option'>Clubs</button>
                        <button className='tab-option'>Reviews</button>
                        <button className='tab-option'>Comments</button>
                        <button className='tab-option'>Users</button>
                    </div>
                </div>
                <div className='result'>
                </div>
            </div>
            <Footer/>
        </>
    );
}

export default SearchPage;