import React, { useRef, useEffect } from "react";
import "../styles/NotificationModal.css";

const NotificationModal = ({ notifications, onClose }) => {
    const modalRef = useRef(null); // Use ref to reference the modal

    useEffect(() => {
        const handleClickOutside = (event) => {
            console.log("Clicked:", event.target); // Log the clicked element
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                console.log("Closing modal because click is outside");
                onClose(); // Close the modal
            }
        };
        
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside); // Cleanup event listener
        };
    }, [onClose]);

    return (
        <div className="notification-modal-container" ref={modalRef}>
            <div className="notification-modal">
                <h2>Notifications</h2>
                <ul>
                    {notifications.length > 0 ? (
                        notifications.map((notification, index) => (
                            <li key={index}>
                                <p>{notification.message}</p>
                                <small>{new Date(notification.created_at).toLocaleString()}</small>
                            </li>
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
