import { useState } from 'react';
import './App.css';
import Explore from'./pages/explore.jsx';
import Genre from './pages/Genre.jsx'
import SearchPage from './pages/SearchPage.jsx';
import { Routes , Route} from 'react-router-dom';

function App() {
    return(
        <Routes>
            <Route path="/" element={<Explore/>} />
            <Route path="/genre" element={<Genre/>}/>
            <Route path="/search" element={<SearchPage/>}/>
        </Routes>
    );
}
export default App;
