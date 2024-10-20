import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaHome, FaBook, FaCalendarAlt, FaSignOutAlt, FaUser, FaBell, FaEnvelope } from "react-icons/fa";
import "../styles/Navbar.css";

const Navbar = () => {
    const [menuActive, setMenuActive] = useState(false);

    const toggleMenu = () => {
        setMenuActive(!menuActive);
    };

    return (
        <>
            {/* Burger Menu Icon and Web App Name on small screens */}
            <div className="burger-icon-container">
                <div
                    className={`burger-icon ${menuActive ? "active" : ""}`} /* Add active class when navbar is open */
                    onClick={toggleMenu}
                >   
                    
                    <i className="fa fa-bars"></i>
                    <span className="navbar-brand-small">PEO System</span>
                </div>
               
            </div>

            {/* Overlay */}
            <div className={`overlay ${menuActive ? "active" : ""}`} onClick={toggleMenu}>
                {/* <span className="navbar-brand-small">PEO System(s)</span> */}
            </div>

            {/* Navbar */}
            <nav className={`navbar ${menuActive ? "active" : ""}`}>
                <div className="navbar-brand">
                    <h1>PEO System</h1>
                    
                </div>

                <ul className="navbar-links">
                    <li>
                        <Link to="/" className="navbar-link" onClick={toggleMenu}>
                            <FaHome className="navbar-icon" /> Overview
                        </Link>
                    </li>
                    <li>
                        <Link to="/view-project" className="navbar-link" onClick={toggleMenu}>
                            <FaBook className="navbar-icon" /> Projects
                        </Link>
                    </li>
                    <li>
                        <Link to="/calendar-project" className="navbar-link" onClick={toggleMenu}>
                            <FaCalendarAlt className="navbar-icon" /> Calendar
                        </Link>
                    </li>
                    <li>
                        <Link to="/view-profile" className="navbar-link" onClick={toggleMenu}>
                            <FaUser className="navbar-icon" /> Profile
                        </Link>
                    </li>
                    <li>
                        <Link to="/messages" className="navbar-link" onClick={toggleMenu}>
                            <FaEnvelope className="navbar-icon" /> Messages
                        </Link>
                    </li>
                    <li>
                        <Link to="/logout" className="navbar-link" onClick={toggleMenu}>
                            <FaSignOutAlt className="navbar-icon" /> Sign Out
                        </Link>
                    </li>
                </ul>
            </nav>
        </>
    );
};

export default Navbar;
