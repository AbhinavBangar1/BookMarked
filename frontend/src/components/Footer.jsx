import './Footer.css'
import { FiGithub, FiTwitter, FiMail } from "react-icons/fi";

function Footer(){
    return(
        <>
            <div className='footer-box'>
                <h2 className='footer-text'>ZReads</h2>
                <h3 className='footer-text'>Discover. Read. Review.</h3>
                <p className='footer-text'>
                    Built for readers • No paid reviews
                </p>
                <p className='footer-text'>
                    <a href="#">About</a> • <a href="#">Contact</a> • <a href="#">Privacy</a>
                </p>
                <div className="footer-icons">
                    <FiGithub />
                    <FiTwitter />
                    <FiMail />
                </div>
                <p className='footer-text'>
                    © 2026 BookReview. All rights reserved.
                </p>
            </div>
        </>
    );
}

export default Footer;
