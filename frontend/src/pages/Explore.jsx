// import React, { useEffect, useState } from "react";
// import "./Explore.css";
// import Header from '../components/Header.jsx'
// import BookCard from "../components/BookCard.jsx";
// import Footer from "../components/Footer.jsx"
// import Section from "../components/Section.jsx";
// import CategoryBar from "../components/CategoryBar.jsx";
// import Quote from "../components/Quote.jsx";


// function Explore() {
//     return(
//         <>
//             <Header/>
//             <CategoryBar/>
//             <Quote/>
//             <Section type={"bestseller"} section_title={"Best Sellers"} />
//             <Section type={"toprated"} section_title={"Top Rated"} />
//             <Section type={"popular"} section_title={"Popular"} />
//             <Footer/>
//         </>
//     );
// }

// export default Explore;
import React, { useEffect, useState } from "react";
import "./Explore.css";
import Header from '../components/Header.jsx'
import Footer from "../components/Footer.jsx"
import Section from "../components/Section.jsx";
import CategoryBar from "../components/CategoryBar.jsx";
import Quote from "../components/Quote.jsx";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../supabaseClient";

function Explore() {
    const { user, loading: authLoading } = useAuth();
    const [userBookmarkIds, setUserBookmarkIds] = useState([]);

    useEffect(() => {
        const fetchUserBookmarks = async () => {
            // 1. If no user is logged in, clear the bookmarks list
            if (!user) {
                setUserBookmarkIds([]);
                return;
            }

            try {
                // 2. Fetch only the bookids for the current user from the 'bookmarked' table
                const { data, error } = await supabase
                    .from("bookmarked")
                    .select("bookid")
                    .eq("userid", user.id);
                
                if (error) throw error;

                // 3. Store as a simple array of strings: ['id1', 'id2', ...]
                setUserBookmarkIds(data?.map(item => item.bookid) || []);
            } catch (err) {
                console.error("Error fetching user bookmarks:", err);
                setUserBookmarkIds([]);
            }
        };

        // 4. Only fetch once the AuthProvider has finished initializing
        if (!authLoading) {
            fetchUserBookmarks();
        }
    }, [user, authLoading]);

    return (
        <>
            <Header />
            <CategoryBar />
            <Quote />
            
            {/* 5. Pass the userBookmarkIds array to every Section */}
            <Section 
                type={"bestseller"} 
                section_title={"Best Sellers"} 
                userBookmarkIds={userBookmarkIds} 
            />
            
            <Section 
                type={"toprated"} 
                section_title={"Top Rated"} 
                userBookmarkIds={userBookmarkIds} 
            />
            
            <Section 
                type={"popular"} 
                section_title={"Popular"} 
                userBookmarkIds={userBookmarkIds} 
            />
            
            <Footer />
        </>
    );
}

export default Explore;