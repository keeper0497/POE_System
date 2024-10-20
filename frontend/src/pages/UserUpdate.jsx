import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";
import Navbar from "../components/Navbar";  // Assuming you have a Navbar component
import "../styles/UserUpdate.css"

function UpdateUser() {
    const { id } = useParams();  // Get the user ID from URL params
    const navigate = useNavigate();  // Initialize navigation
    const [formData, setFormData] = useState({
        username: "",
        password: "",
    });
    const [error, setError] = useState(null);

    // Fetch user details
    useEffect(() => {
        api.get(`/api/user/${id}/`)
            .then((res) => {
                setFormData({
                    username: res.data.username,
                    password: "",  // Password remains blank by default
                });
            })
            .catch((err) => {
                setError(`Error fetching user: ${err.message}`);
            });
    }, [id]);

    // Handle form input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // Submit the updated data
    const handleSubmit = (e) => {
        e.preventDefault();
        api.put(`/api/user/update/${id}/`, formData)
            .then(() => {
                alert("User updated successfully!");
                navigate("/users-list");  // Redirect to user list page
            })
            .catch((err) => {
                setError(`Error updating user: ${err.message}`);
            });
    };

    if (error) {
        return <h2>{error}</h2>;
    }

    return (
        <div>
            <Navbar />
            <div className="update-user-container">
                <h2>Update User</h2>
                <form onSubmit={handleSubmit}>
                    <label>
                        Username:
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                        />
                    </label>
                    <label>
                        Password:
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </label>
                    <button type="submit">Update User</button>
                </form>
            </div>
        </div>
    );
}

export default UpdateUser;
