import './Header.css'
import { FaSearch } from "react-icons/fa";
import { CgProfile } from "react-icons/cg";
import { IoBookSharp, IoClose } from "react-icons/io5";
import { useState } from 'react';
import SearchBar from './SearchBar';
import { FaBookBookmark } from "react-icons/fa6";

function Header(){
    const [isSearchOpen , setIsSearchOpen]= useState(false);
    return(
        <>
            <div className='header'>
                <div className='headerleft'>
                    <IoBookSharp className='booksicon'/>
                    <p className='sitename'> ZReads.</p>
                </div>
                <div className='headerright'>
                    <FaBookBookmark className='wishlist-icon'/>
                    {isSearchOpen ? 
                        <IoClose className='search' onClick={() => setIsSearchOpen(false)}/> 
                        : 
                        <FaSearch className='search' onClick={() => setIsSearchOpen(true)}/>
                    }
                    <CgProfile className='profile' />
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
