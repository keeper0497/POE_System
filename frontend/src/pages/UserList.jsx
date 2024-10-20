import React, { useEffect, useState } from "react";
import api from "../api";
import Navbar from "../components/Navbar";  // Assuming you have a Navbar component
import { useNavigate } from "react-router-dom"; // For navigating to update page
import "../styles/UserList.css";  // Assuming you'll create a CSS file for styling

function UsersList() {
    const [users, setUsers] = useState([]);
    const [error, setError] = useState(null);
    const navigate = useNavigate();  // Initialize navigation

    // Fetch the list of users when the component mounts
    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = () => {
        api.get("/api/users/")
            .then((res) => {
                setUsers(res.data);
            })
            .catch((err) => {
                setError(`Error: ${err.message}`);
            });
    };

    // Delete user by ID
    const handleDelete = (userId) => {
        api.delete(`/api/user/delete/${userId}/`)
            .then(() => {
                alert("User deleted successfully!");
                fetchUsers();  // Refresh user list after deletion
            })
            .catch((err) => {
                alert(`Error deleting user: ${err.message}`);
            });
    };

    // Navigate to update user page
    const handleUpdate = (userId) => {
        navigate(`/update-user/${userId}`);
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

    return (
        <div>
            <Navbar />
            <div className="users-container">
                <h2>Users List</h2>
                <table className="users-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Username</th>
                            <th>Actions</th> {/* New column for actions */}
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id}>
                                <td>{user.id}</td>
                                <td>{user.username}</td>
                                <td>
                                    <button className="update-btn" onClick={() => handleUpdate(user.id)}>Update</button>
                                    <button className="delete-btn" onClick={() => handleDelete(user.id)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default UsersList;
