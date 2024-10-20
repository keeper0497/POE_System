import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import Navbar from "../components/Navbar";  // Import the Navbar component
import "../styles/Register.css";  // Assuming you have a CSS file for the Register page

function Register() {
    const [formData, setFormData] = useState({
        username: "",
        password: "",
    });
    const [error, setError] = useState(null);
    const navigate = useNavigate();  // Initialize useNavigate to redirect after registration

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        api.post("/api/user/register/", formData)
            .then((res) => {
                if (res.status === 201) {
                    alert("User registered successfully!");
                    navigate("/users");  // Redirect to the home page after registration
                } else {
                    alert("Failed to register.");
                }
            })
            .catch((err) => setError(`Error: ${err.message}`));
    };

    return (
        <div>
            <Navbar /> {/* Show the Navbar */}
            <div className="register-container">
                <h2>Register</h2>
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
                    <button type="submit">Register</button>
                </form>
                {error && <p className="error-message">{error}</p>}
            </div>
        </div>
    );
}

export default Register;
