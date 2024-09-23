import React from "react";
import "../styles/NotificationModal.css"

const NotificationModal = ({ notifications, onClose }) => {
    return (
        <div className="notification-modal-container">
            <div className="notification-modal">
                <h2>Notifications</h2>
                <ul>
                    {notifications.length > 0 ? (
                        notifications.map((notification, index) => (
                            <li key={index}>{notification}</li>
                        ))
                    ) : (
                        <li>No notifications</li>
                    )}
                </ul>
                <button onClick={onClose} className="btn close-btn">Close</button>
            </div>
        </div>
    );
};

export default NotificationModal;