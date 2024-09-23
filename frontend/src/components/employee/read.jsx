import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api";
import "../../styles/employee/read.css";
import Navbar from "../../components/Navbar";

function ReadProfile() {
    const [profile, setProfile] = useState(null);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

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
                setError(`Error: ${err.message}`);
            });
    };

    const handleLogout = () => {
        // Add your logout logic here, e.g., clearing tokens, etc.
        // For demonstration, we just navigate to the login page.
        navigate('/login');
    };

    if (error) {
        return (
            <div>
                <Navbar />
                <div className="read-profile">
                    <h2>{error}</h2>
                    <button onClick={() => navigate('/create-profile')}>Create Profile</button>
                    <button onClick={handleLogout} className="logout-btn">Log Out</button>
                </div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div>
                <Navbar />
                <div className="read-profile">
                    <h2>Loading Profile...</h2>
                </div>
            </div>
        );
    }

    return (
        <div>
            <Navbar />
            <div className="read-profile">
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
                <button onClick={() => navigate('/update-profile')}>Edit Profile</button>
                <button onClick={handleLogout} className="logout-btn">Log Out</button>
            </div>
        </div>
    );
}

export default ReadProfile;
