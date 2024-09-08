import { useState, useEffect } from "react";
import api from "../api";
import "../styles/EmployeeProfile.css";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";

function EmployeeProfile() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();  // Initialize useNavigate

    useEffect(() => {
        fetchUserProfile();
    }, []);

    const fetchUserProfile = () => {
        api
            .get("/api/user-profile-detail/")
            .then((res) => {
                setProfile(res.data);
            })
            .catch((err) => {
                console.error(err);
                setProfile(null);
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const handleCreateProfile = () => {
        navigate("/create-profile");  // Use navigate to redirect
    };

    const handleLogout = () => {
        // Perform logout action, such as clearing tokens and redirecting
        // This is a placeholder; replace with your actual logout logic
        localStorage.removeItem("token"); // Remove the token from localStorage (if used)
        navigate("/login"); // Redirect to the login page
    };

    return (
        <div>
            <Navbar />
            <div className="employee-profile">
                {loading ? (
                    <h2>Loading Profile...</h2>
                ) : profile ? (
                    <div>
                        <h2>User Profile</h2>
                        <p><strong>Position:</strong> {profile.position}</p>
                        <p><strong>Division:</strong> {profile.division}</p>
                        <p><strong>Start Date:</strong> {profile.start_date}</p>
                        <p><strong>Number of Sick Leaves:</strong> {profile.num_sickleave}</p>
                        <p><strong>Number of Vacation Leaves:</strong> {profile.num_vacationleave}</p>
                        <p><strong>Contact Number:</strong> {profile.contact_number}</p>
                        <p><strong>Custom User ID:</strong> {profile.custom_user_id}</p>
                        <p><strong>First Name:</strong> {profile.first_name}</p>
                        <p><strong>Last Name:</strong> {profile.last_name}</p>
                        <p><strong>Middle Name:</strong> {profile.middle_name}</p>
                        {profile.suffix && <p><strong>Suffix:</strong> {profile.suffix}</p>}
                        <p><strong>Email:</strong> {profile.email}</p>
                        <button onClick={handleLogout} className="logout-btn">Log Out</button> {/* Add Log Out button */}
                    </div>
                ) : (
                    <div>
                        <h2>No Profile Found</h2>
                        <p>You don't have a profile yet. Please create one.</p>
                        <button onClick={handleCreateProfile}>Create Profile</button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default EmployeeProfile;
