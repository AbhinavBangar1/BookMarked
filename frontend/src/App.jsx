import { useState } from 'react';
import './App.css';
import Explore from './pages/Explore.jsx';
import Genre from './pages/Genre.jsx';
import SearchPage from './pages/SearchPage.jsx';
import BookProfile from './pages/BookProfile.jsx';
import AuthPage from './pages/AuthPage.jsx';
import Wishlist from './pages/Wishlist.jsx';
import { Routes, Route } from 'react-router-dom';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Explore />} />
      <Route path="/genre" element={<Genre />} />
      <Route path="/search" element={<SearchPage />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/book/:id" element={<BookProfile />} /> 
      <Route path="/wishlist" element={<Wishlist />} />
    </Routes>
  );
}

export default App;