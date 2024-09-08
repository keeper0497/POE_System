import React from "react";
import { Link } from "react-router-dom";
import "../styles/Navbar.css";

const Navbar = () => {
    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <Link to="/" className="navbar-logo">PEO System</Link>
            </div>
            <ul className="navbar-links">
                <li>
                    <Link to="/" className="navbar-link">Overview</Link>
                </li>
                <li>
                    <Link to="/view-project" className="navbar-link">Project</Link>
                </li>
                <li>
                    <Link to="/calendar-project" className="navbar-link">Calendar</Link>
                </li>
                <li>
                    <Link to="/view-profile" className="navbar-link">Profile</Link>
                </li>
            </ul>
        </nav>
    );
}

export default Navbar;
