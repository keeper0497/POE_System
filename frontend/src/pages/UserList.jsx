import React, { useEffect, useState } from "react";
import api from "../api";
import Navbar from "../components/Navbar";  // Assuming you have a Navbar component
import { useNavigate } from "react-router-dom"; // For navigating to update page
import "../styles/UserList.css";  // Assuming you'll create a CSS file for styling

function UsersList() {
    const [users, setUsers] = useState([]);
    const [error, setError] = useState(null);
    const navigate = useNavigate();  // Initialize navigation

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = () => {
        api.get("/api/users/")
            .then((res) => setUsers(res.data))
            .catch((err) => setError(`Error: ${err.message}`));
    };

    const handleUpdate = (userId) => {
        navigate(`/update-user/${userId}`);
    };

    const handleViewDetails = (userId) => {
        navigate(`/user-details/${userId}`);  // Navigate to user details page
    };

    if (error) {
        return (
            <div>
                <Navbar />
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
                <div className="users-container">
                    <h2>No users found</h2>
                </div>
            </div>
        );
    }

    const handleResigration = () => {
        navigate("/register")
    };

    return (
        <div>
            <Navbar />
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
        </div>
    );
}

export default UsersList;
