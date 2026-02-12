import React, { useEffect, useState } from "react";
import "./Explore.css";
import Header from '../components/Header.jsx'
import BookCard from "../components/BookCard.jsx";
import Footer from "../components/Footer.jsx"
import Section from "../components/Section.jsx";
import CategoryBar from "../components/CategoryBar.jsx";
import Quote from "../components/Quote.jsx";


function Explore() {
    return(
        <>
            <Header/>
            <CategoryBar/>
            <Quote/>
            {/* <BookCard title={"My Life"} img={"https://placehold.co/600x400"} genre={"Horror"}/> */}
            <Section title = {"BestSeller"} section_title={"NewRelease"}/>
            <Section title = {"Lord Of the Rings"} section_title={"Popular"}/>
            <Section title = {"BestSellers"} section_title={"BestSellers"}/>
            {/* <Section title={"the cock down the block"} section_title={"Smut"}/> */}
            <Footer/>
        </>
    );
}

export default Explore;