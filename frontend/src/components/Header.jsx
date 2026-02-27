import './Header.css'
import { FaSearch } from "react-icons/fa";
import { CgProfile } from "react-icons/cg";
import { IoBookSharp, IoClose } from "react-icons/io5";
import { useState, useRef, useEffect } from 'react';
import SearchBar from './SearchBar';
import { FaBookBookmark } from "react-icons/fa6";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Header() {
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();
    const { user, profile, signOut } = useAuth();

    const toHome = () => navigate(`/`);
    const toAuth = () => navigate('/auth');
    const toWishlist = () => navigate('/wishlist');
    const toDashboard = () => navigate('/dashboard'); 

    const handleProfileClick = () => {
        if (user) {
            setShowDropdown(!showDropdown);
        } else {
            toAuth();
        }
    };

    const handleWishlistClick = () => {
        if (user) {
            toWishlist();
        } else {
            toAuth();
        }
    };

    const handleLogout = async () => {
        await signOut();
        setShowDropdown(false);
        navigate('/');
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Get user initials for avatar — prefer username, fallback to email
    const getUserInitials = () => {
        if (profile?.username) {
            return profile.username.charAt(0).toUpperCase();
        }
        if (!user?.email) return '?';
        return user.email.charAt(0).toUpperCase();
    };

    return (
        <>
            <div className='header'>
                <div className='headerleft'>
                    <IoBookSharp className='booksicon' />
                    <button className='sitename' onClick={() => toHome()}>
                        Marked
                    </button>
                </div>
                <div className='headerright'>
                    <FaBookBookmark
                        className='wishlist-icon'
                        onClick={handleWishlistClick}
                        style={{ cursor: 'pointer' }}
                    />
                    {isSearchOpen ?
                        <IoClose className='search' onClick={() => setIsSearchOpen(false)} />
                        :
                        <FaSearch className='search' onClick={() => setIsSearchOpen(true)} />
                    }
                    <div className='profile-container' ref={dropdownRef}>
                        {user ? (
                            <div
                                className='user-avatar'
                                onClick={handleProfileClick}
                            >
                                {getUserInitials()}
                            </div>
                        ) : (
                            <CgProfile
                                className='profile'
                                onClick={handleProfileClick}
                            />
                        )}
                        {showDropdown && user && (
                            <div className='profile-dropdown'>
                                {profile?.username && (
                                    <div className='dropdown-username'>{profile.username}</div>
                                )}
                                <div className='dropdown-email'>{user.email}</div>
                                  <button
                                    className='dropdown-profile'
                                    onClick={() => {
                                        setShowDropdown(false);
                                        toDashboard();
                                    }}
                                >
                                    View Profile
                                </button>
                                <button
                                    className='dropdown-logout'
                                    onClick={handleLogout}
                                >
                                    Sign Out
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <SearchBar
                isOpen={isSearchOpen}
                onClose={() => setIsSearchOpen(false)}
            />
        </>
    );
}

export default Header;
