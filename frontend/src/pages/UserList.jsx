import React, { useEffect, useState } from "react";
import api from "../api";
import Navbar from "../components/Navbar";  
import NotificationModal from "../components/NotificationModal";
import { useNavigate } from "react-router-dom"; 
import "../styles/UserList.css";  

function UsersList() {
    const [users, setUsers] = useState([]);
    const [error, setError] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchUsers();
        fetchNotifications();
    }, []);

    const fetchUsers = () => {
        api.get("/api/users/")
            .then((res) => setUsers(res.data))
            .catch((err) => setError(`Error: ${err.message}`));
    };

    const fetchNotifications = () => {
        api.get("/api/notifications/")
            .then((res) => {
                setNotifications(res.data);
            })
            .catch((err) => console.error(`Error fetching notifications: ${err.message}`));
    };

    const handleUpdate = (userId) => {
        navigate(`/update-user/${userId}`);
    };

    const handleViewDetails = (userId) => {
        navigate(`/user-details/${userId}`);
    };

    const handleResigration = () => {
        navigate("/register")
    };

    if (error) {
        return (
            <div>
                <Navbar />
                <div className="bell-icon-container">
                    <span className="bell-icon" onClick={() => setShowModal(true)}>
                        <i className="fa fa-bell"></i>
                        {notifications.length > 0 && <span className="notification-count">{notifications.length}</span>}
                    </span>
                </div>
                <div className="users-container">
                    <h2>{error}</h2>
                </div>
            </div>
        );
    }

    if (users.length === 0) {
        return (
            <div>
                <Navbar />
                <div className="bell-icon-container">
                    <span className="bell-icon" onClick={() => setShowModal(true)}>
                        <i className="fa fa-bell"></i>
                        {notifications.length > 0 && <span className="notification-count">{notifications.length}</span>}
                    </span>
                </div>
                <div className="users-container">
                    <h2>No users found</h2>
                </div>
            </div>
        );
    }

    return (
        <div>
            <Navbar />
            <div className="bell-icon-container">
                <span className="bell-icon" onClick={() => setShowModal(true)}>
                    <i className="fa fa-bell"></i>
                    {notifications.length > 0 && <span className="notification-count">{notifications.length}</span>}
                </span>
            </div>
            <div className="users-container">
                <h2>Users List</h2>
                <table className="users-table">
                    <thead>
                        <tr>
                            <th>First Name</th>
                            <th>Last Name</th>
                            <th>Middle Name</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id}>
                                <td>{user.first_name}</td>
                                <td>{user.last_name}</td>
                                <td>{user.middle_name}</td>
                                <td>
                                    <button className="update-btn" onClick={() => handleUpdate(user.id)}>Update</button>
                                    <button className="view-btn" onClick={() => handleViewDetails(user.id)}>Details</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <button onClick={handleResigration} className="button register-btn">
                    Register
                </button>
            </div>

            {showModal && (
                <NotificationModal 
                    notifications={notifications} 
                    onClose={() => setShowModal(false)} 
                />
            )}
        </div>
    );
}

export default UsersList;
