// BellIcon.jsx
import React from "react";
import "../styles/BellIcon.css"; // Optional: Add styles

const BellIcon = ({ count, onClick }) => {
    return (
        <div className="bell-icon" onClick={onClick}>
            <i className="fa fa-bell" aria-hidden="true"></i>
            {count > 0 && <span className="notification-count">{count}</span>}
        </div>
    );
};

export default BellIcon;
