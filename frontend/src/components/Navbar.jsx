import React from "react";
import { Link } from "react-router-dom";
import { FaHome, FaBook, FaCalendarAlt, FaSignOutAlt, FaUser, FaBell, FaTasks } from "react-icons/fa";
import "../styles/Navbar.css";

const Navbar = () => {
    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <h1>PEO System</h1>
            </div>
            <ul className="navbar-links">
                <li>
                    <Link to="/" className="navbar-link">
                        <FaHome className="navbar-icon" /> Overview
                    </Link>
                </li>
                <li>
                    <Link to="/view-project" className="navbar-link">
                        <FaBook className="navbar-icon" /> Projects
                    </Link>
                </li>
                {/* <li>
                    <Link to="/task/create" className="navbar-link">
                        <FaTasks className="navbar-icon" /> Task
                    </Link>
                </li> */}
                <li>
                    <Link to="/calendar-project" className="navbar-link">
                        <FaCalendarAlt className="navbar-icon" /> Calendar
                    </Link>
                </li>
                <li>
                    <Link to="/view-profile" className="navbar-link">
                        <FaUser className="navbar-icon" /> Profile
                    </Link>
                </li>
                <li>
                    <Link to="/messages" className="navbar-link">
                        <FaBell className="navbar-icon" /> Messages
                    </Link>
                </li>
                
                <li>
                    <Link to="/logout" className="navbar-link">
                        <FaSignOutAlt className="navbar-icon" /> Sign Out
                    </Link>
                </li>
            </ul>
        </nav>
    );
};

export default Navbar;
