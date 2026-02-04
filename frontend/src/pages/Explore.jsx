import React, { useEffect, useState } from "react";
import "./Explore.css";
import Header from '../components/Header.jsx'
import BookCard from "../components/BookCard.jsx";
import Footer from "../components/Footer.jsx"
import Section from "../components/Section.jsx";


function Explore() {
    return(
        <>
            <Header/>
            {/* <BookCard title={"My Life"} img={"https://placehold.co/600x400"} genre={"Horror"}/> */}
            <Section title = {"BestSeller"} section_title={"NewRelease"}/>
            <Section title = {"Lord Of the Rings"} section_title={"Popular"}/>
            <Section title = {"Atomic Habits"} section_title={"BestSellers"}/>
            <Footer/>
        </>
    );
}

export default Explore;