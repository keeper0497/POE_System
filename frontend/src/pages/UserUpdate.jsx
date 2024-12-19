import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";
import Navbar from "../components/Navbar";
import "../styles/UserUpdate.css";

function UpdateUser() {
    const { id } = useParams();  // Profile ID passed to the component
    const navigate = useNavigate();  // For navigation
    const [userId, setUserId] = useState(null);  // To store the user ID
    const [formData, setFormData] = useState({
        username: "",
        password: "",
    });
    const [error, setError] = useState(null);

    console.log("Profile ID:", id);

    // Fetch the user profile to get the user ID
    useEffect(() => {
        api.get(`/api/user/profile/${id}/`) // Endpoint to fetch profile details
            .then((res) => {
                console.log("Profile Data:", res.data);
                const userIdFromProfile = res.data.user; // Extract the user ID
                setUserId(userIdFromProfile); // Store user ID for the next call
                
                // Fetch user details using the user ID
                return api.get(`/api/user/${userIdFromProfile}/`);
            })
            .then((res) => {
                console.log("User Data:", res.data);
                setFormData({
                    username: res.data.username,
                    password: "",  // Password remains blank for security reasons
                });
            })
            .catch((err) => {
                setError(`Error fetching user details: ${err.message}`);
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
        if (!userId) {
            setError("User ID not found.");
            return;
        }

        // Send updated data to the backend
        api.put(`/api/user/update/${userId}/`, formData)
            .then(() => {
                alert("User updated successfully!");
                navigate("/users");  // Redirect after success
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
                            placeholder="Enter a new password (optional)"
                        />
                    </label>
                    <button type="submit">Update User</button>
                </form>
            </div>
        </div>
    );
}

export default UpdateUser;
