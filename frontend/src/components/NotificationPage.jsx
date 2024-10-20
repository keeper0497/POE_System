// NotificationPage.jsx

import React, { useState, useEffect } from "react";
import api from "../api";
import "../styles/NotificationPage.css";
import Navbar from "../components/Navbar";

function NotificationsPage() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get("/api/notifications/")
            .then((res) => {
                setNotifications(res.data);
                setLoading(false);
            })
            .catch((err) => {
                alert(`Error: ${err.message}`);
                setLoading(false);
            });

        const employeeId = 1;  // Set dynamic employee ID
        const ws = new WebSocket(`ws://poe-system.onrender.com:8000/ws/notifications/${employeeId}/`);

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            setNotifications((prevNotifications) => [...prevNotifications, { message: data.notification }]);
        };

        ws.onerror = (error) => {
            console.error("WebSocket error:", error);
        };

        return () => ws.close();
    }, []);

    if (loading) {
        return <p>Loading notifications...</p>;
    }

    return (
        <div>
            <Navbar />
            <div className="notifications-container">
                <h2>Messages</h2>
                <div className="notifications-list">
                    {notifications.length === 0 ? (
                        <p>No notifications available</p>
                    ) : (
                        notifications.map((notification, index) => (
                            <div key={index} className="notification-card">
                                <div className="notification-title">
                                    {notification.message}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

export default NotificationsPage;
