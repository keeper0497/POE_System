import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import Navbar from "../components/Navbar";
import "../styles/Register.css";

function Register() {
    const [formData, setFormData] = useState({
        username: "",
        password: "",
    });
    const [passwordStrength, setPasswordStrength] = useState(""); // Track password strength
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        if (name === "password") {
            evaluatePasswordStrength(value); // Check password strength as the user types
        }
    };

    // Function to evaluate password strength
    const evaluatePasswordStrength = (password) => {
        const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!password) {
            setPasswordStrength("");
        } else if (strongPasswordRegex.test(password)) {
            setPasswordStrength("Strong");
        } else if (password.length >= 6) {
            setPasswordStrength("Weak");
        } else {
            setPasswordStrength("Very Weak");
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validate password strength before submitting
        if (passwordStrength !== "Strong") {
            alert("Password must be strong. Ensure it meets all requirements.");
            return;
        }

        api.post("/api/user/register/", formData)
            .then((res) => {
                if (res.status === 201) {
                    alert("User registered successfully!");
                    navigate("/users"); // Redirect to the home page
                } else {
                    alert("Failed to register.");
                }
            })
            .catch((err) => setError(`Error: ${err.message}`));
    };

    return (
        <div>
            <Navbar />
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
                    <p className={`password-strength ${passwordStrength.toLowerCase()}`}>
                        {passwordStrength && `Password Strength: ${passwordStrength}`}
                    </p>
                    <button type="submit">Register</button>
                </form>
                {error && <p className="error-message">{error}</p>}
            </div>
        </div>
    );
}

export default Register;
