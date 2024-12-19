import { useState, useEffect } from "react";
import api from "../../api";
import "../../styles/employee/update.css";
import Navbar from "../../components/Navbar";

function UpdateProfile() {
    const [formData, setFormData] = useState({
        position: "",
        division: "",
        start_date: "",
        // num_sickleave: "",
        // num_vacationleave: "",
        contact_number: "",
        custom_user_id: "",
        first_name: "",
        last_name: "",
        middle_name: "",
        suffix: "",
        email: "",
    });

    useEffect(() => {
        fetchUserProfile();
    }, []);

    const fetchUserProfile = () => {
        api
            .get("/api/user-profile-detail/")  // Fetch the user's current profile
            .then((res) => {
                setFormData(res.data);  // Populate the form with the fetched data
            })
            .catch((err) => alert(`Error: ${err.message}`));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Prepare payload, excluding username and password
        const { username, password, ...profileData } = formData;

        api
            .put("/api/user-profile-update/", formData)  // Update the profile with the form data
            .then((res) => {
                if (res.status === 200) {
                    alert("Profile updated successfully!");
                } else {
                    alert("Failed to update profile.");
                }
            })
            .catch((err) => alert(`Error: ${err.message}`));
    };

    const positions = [
        "Project Engineer ",
        "Assistant Project Engineer I",
        "Assistant Project Engineer II",

    ];

    const divisions = [
        "Site Engineer",
    ]

    return (
        <div>
            <Navbar />
            <div className="update-profile">
                <h2>Update User Profile</h2>
                <form onSubmit={handleSubmit}>
                <label>
                        First Name:
                        <input
                            type="text"
                            name="first_name"
                            value={formData.first_name}
                            onChange={handleChange}
                            required
                        />
                    </label>
                    <label>
                        Last Name:
                        <input
                            type="text"
                            name="last_name"
                            value={formData.last_name}
                            onChange={handleChange}
                            required
                        />
                    </label>
                    <label>
                        Middle Name:
                        <input
                            type="text"
                            name="middle_name"
                            value={formData.middle_name}
                            onChange={handleChange}
                        />
                    </label>
                    <label>
                        Suffix:
                        <input
                            type="text"
                            name="suffix"
                            value={formData.suffix}
                            onChange={handleChange}
                        />
                    </label>
                    <label>
                        Email:
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </label>
                    <label>
                        Position:
                        <select
                            name="position"
                            value={formData.position}
                            onChange={handleChange}
                            required
                        >
                            <option value="" disabled>Select Position</option>
                            {positions.map((position, index) => (
                                <option key={index} value={position}>
                                    {position}
                                </option>
                            ))}
                        </select>
                    </label>
                    <label>
                        Division:
                        <select
                            name="division"
                            value={formData.division}
                            onChange={handleChange}
                            required
                        >
                            <option value="" disabled>Select Position</option>
                            {divisions.map((division, index) => (
                                <option key={index} value={division}>
                                    {division}
                                </option>
                            ))}
                        </select>
                    </label>
                    <label>
                        Start Date:
                        <input
                            type="date"
                            name="start_date"
                            value={formData.start_date}
                            onChange={handleChange}
                            required
                        />
                    </label>
                    <label>
                        Contact Number:
                        <input
                            type="text"
                            name="contact_number"
                            value={formData.contact_number}
                            onChange={handleChange}
                            required
                        />
                    </label>
                    
                    <button type="submit">Update Profile</button>
                </form>
            </div>
        </div>
    );
}

export default UpdateProfile;
