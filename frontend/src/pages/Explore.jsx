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
            <Section type = {"bestsellers"} section_title={"BestSellers"}/>
            <Section type = {"toprated"} section_title={"Top Rated"}/>
            <Section type = {"featured"} section_title={"Featured"}/>
            <Footer/>
        </>
    );
}

export default Explore;