import { useState, useEffect } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
import "../styles/Form.css";
import LoadingIndicator from "./LoadingIndicator";

function Form({ route, method }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [profile, setProfile] = useState(null);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const name = method === "login" ? "Login" : "Register";

    useEffect(() => {
        if (method === "login" && profile) {
            if (error) {
                navigate("/create-profile");
            } else {
                navigate("/");
            }
        }
    }, [profile, error, method, navigate]);

    console.log("Error test" + error)

    const fetchUserProfile = async () => {
        try {
            const res = await api.get("/api/user-profile-detail/");
            setProfile(res.data); // Set profile if found
            navigate("/"); // Redirect to home if profile exists
        } catch (err) {
            setError(`Error: ${err.message}`);
            navigate("/create-profile"); // Redirect immediately to create profile page
        }
    };

    const handleSubmit = async (e) => {
        setLoading(true);
        e.preventDefault();

        try {
            const res = await api.post(route, { username, password });
            if (method === "login") {
                localStorage.setItem(ACCESS_TOKEN, res.data.access);
                localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
                fetchUserProfile(); // Fetch profile after successful login
            } else {
                navigate("/login");
            }
        } catch (error) {
            alert("Invalid credentials. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="form-container">
            <h1>{name}</h1>
            <input
                className="form-input"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
            />
            <input
                className="form-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
            />
            {loading && <LoadingIndicator />}
            <button className="form-button" type="submit">
                {name}
            </button>
        </form>
    );
}

export default Form;
