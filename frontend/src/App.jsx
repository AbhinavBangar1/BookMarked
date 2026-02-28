// import {Toaster} from "react-hot-toast";
// import './App.css';
// import Explore from './pages/Explore.jsx';
// import Genre from './pages/Genre.jsx';
// import GlobalCursor from './components/GlobalCursor';
// // import SearchPage from './pages/SearchPage.jsx';
// import BookProfile from './pages/BookProfile.jsx';
// import AuthPage from './pages/AuthPage.jsx';
// import AuthorPage from './pages/AuthorPage.jsx';
// import Wishlist from './pages/Wishlist.jsx';
// import ProfileCompletionModal from './components/ProfileCompletionModal.jsx';
// import { Routes, Route } from 'react-router-dom';
// import ProfilePage from "./pages/ProfilePage.jsx";

// function App() {
//   return (
//     <>
//       <Toaster position="top-right" />
//       <ProfileCompletionModal />
//       <Routes>
//         <Route path="/" element={<Explore />} />
//         <Route path="/genre" element={<Genre />} />
//         {/* <Route path="/search" element={<SearchPage />} /> */}
//         <Route path="/auth" element={<AuthPage />} />
//         <Route path="/book/:id" element={<BookProfile />} />
//         <Route path="/author/:id" element={<AuthorPage />} />
//         <Route path="/wishlist" element={<Wishlist />} />
//         <Route path="/profile/:userid" element={<ProfilePage />} />
//       </Routes>
//     </>
//   );
// }

// export default App;


import {Toaster} from "react-hot-toast";
import './App.css';
import Explore from './pages/Explore.jsx';
import Genre from './pages/Genre.jsx';
import GlobalCursor from './components/GlobalCursor.jsx';
// import SearchPage from './pages/SearchPage.jsx';
import BookProfile from './pages/BookProfile.jsx';
import AuthPage from './pages/AuthPage.jsx';
import AuthorPage from './pages/AuthorPage.jsx';
import Wishlist from './pages/Wishlist.jsx';
import ProfileCompletionModal from './components/ProfileCompletionModal.jsx';
import { Routes, Route } from 'react-router-dom';
import ProfilePage from "./pages/ProfilePage.jsx";

function App() {
  return (
    <>
      {/* --- ADDED THIS LINE HERE --- */}
      <GlobalCursor />
      
      <Toaster position="top-right" />
      <ProfileCompletionModal />
      <Routes>
        <Route path="/" element={<Explore />} />
        <Route path="/genre" element={<Genre />} />
        {/* <Route path="/search" element={<SearchPage />} /> */}
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/book/:id" element={<BookProfile />} />
        <Route path="/author/:id" element={<AuthorPage />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/profile/:userid" element={<ProfilePage />} />
      </Routes>
    </>
  );
}

export default App;