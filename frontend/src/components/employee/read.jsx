import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api";
import "../../styles/employee/read.css";
import Navbar from "../../components/Navbar";
import NotificationModal from "../../components/NotificationModal";

function ReadProfile() {
    const [profile, setProfile] = useState(null);
    const [error, setError] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchUserProfile();
        fetchNotifications();
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

    const fetchNotifications = () => {
        api.get("/api/notifications/")
            .then((res) => {
                setNotifications(res.data);
            })
            .catch((err) => console.error(`Error fetching notifications: ${err.message}`));
    };

    const handleLogout = () => {
        navigate('/login');
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
                <div className="profile-container">
                    <h2>{error}</h2>
                    <button onClick={() => navigate('/create-profile')} className="btn default-btn">Create Profile</button>
                    <button onClick={handleLogout} className="btn logout-btn">Log Out</button>
                </div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div>
                <Navbar />
                <div className="bell-icon-container">
                    <span className="bell-icon" onClick={() => setShowModal(true)}>
                        <i className="fa fa-bell"></i>
                        {notifications.length > 0 && <span className="notification-count">{notifications.length}</span>}
                    </span>
                </div>
                <div className="profile-container">
                    <h2>Loading Profile...</h2>
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
            <div className="profile-container">
                <h2>User Profile</h2>
                <div className="profile-details">
                    <p><strong>First Name:</strong> {profile.first_name}</p>
                    <p><strong>Last Name:</strong> {profile.last_name}</p>
                    <p><strong>Middle Name:</strong> {profile.middle_name}</p>
                    {profile.suffix && <p><strong>Suffix:</strong> {profile.suffix}</p>}
                    <p><strong>Email:</strong> {profile.email}</p>
                    <p><strong>Position:</strong> {profile.position}</p>
                    <p><strong>Division:</strong> {profile.division}</p>
                    <p><strong>Start Date:</strong> {profile.start_date}</p>
                    <p><strong>Contact Number:</strong> {profile.contact_number}</p>
                </div>
                <div className="profile-buttons">
                    <button onClick={() => navigate('/update-profile')} className="btn edit-btn">Edit Profile</button>
                    <button onClick={handleLogout} className="btn logout-btn">Log Out</button>
                </div>
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

export default ReadProfile;
