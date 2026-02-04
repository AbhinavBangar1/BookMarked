import React, { useEffect, useState } from "react";
import "./explore.css";
import Header from '../components/Header.jsx'
import BookCard from "../components/BookCard.jsx";
import Footer from "../components/Footer.jsx"
import Section from "../components/Section.jsx";


function Explore() {
    return(
        <>
            <Header/>
            {/*<BookCard title={"My Life"} img={"https://placehold.co/600x400"} genre={"Horror"}/> */}
            <Section title = {"Harry Potter"} section_title={"Trending"}/>
            <Footer/>
        </>
    );
}

export default Explore;