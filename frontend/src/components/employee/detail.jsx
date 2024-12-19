import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../api";
import Navbar from "../Navbar";

function UserDetails() {
    const { user_id } = useParams();
    const [user, setUser] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        api.get(`/api/user/${user_id}/`)
            .then((res) => setUser(res.data))
            .catch((err) => setError(`Error: ${err.message}`));
    }, [user_id]);

    if (error) return <div>{error}</div>;
    if (!user) return <div>Loading...</div>;

    return (
        <div>
            <Navbar />
            <div className="user-details-container">
                <h2>User Details</h2>
                <p><strong>First Name:</strong> {user.first_name}</p>
                    <p><strong>Last Name:</strong> {user.last_name}</p>
                    <p><strong>Middle Name:</strong> {user.middle_name || "N/A"}</p>
                    {profile.suffix && <p><strong>Suffix:</strong> {user.suffix || "N/A"}</p>}
                    <p><strong>Email:</strong> {user.email}</p>
                    <p><strong>Position:</strong> {user.position}</p>
                    <p><strong>Division:</strong> {user.division}</p>
                    <p><strong>Start Date:</strong> {user.start_date}</p>
                    <p><strong>Contact Number:</strong> {user.contact_number}</p>
            </div>
        </div>
    );
}

export default UserDetails;
