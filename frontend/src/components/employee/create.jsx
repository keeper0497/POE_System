    import { useState } from "react";
    import api from "../../api";
    import "../../styles/employee/create.css";
    import Navbar from "../../components/Navbar";

    function CreateProfile() {
        const [formData, setFormData] = useState({
            position: "",
            division: "",
            start_date: "",
            num_sickleave: "",
            num_vacationleave: "",
            contact_number: "",
            custom_user_id: "",
            first_name: "",
            last_name: "",
            middle_name: "",
            suffix: "",
            email: "",
        });

        const handleChange = (e) => {
            const { name, value } = e.target;
            setFormData({ ...formData, [name]: value });
        };

        const handleSubmit = (e) => {
            e.preventDefault();

            api
                .post("/api/user-profile-create/", formData)
                .then((res) => {
                    if (res.status === 201) {
                        alert("Profile created successfully!");
                        setFormData({
                            position: "",
                            division: "",
                            start_date: "",
                            num_sickleave: "",
                            num_vacationleave: "",
                            contact_number: "",
                            custom_user_id: "",
                            first_name: "",
                            last_name: "",
                            middle_name: "",
                            suffix: "",
                            email: "",
                        });
                    } else {
                        alert("Failed to create profile.");
                    }
                })
                .catch((err) => alert(`Error: ${err.message}`));
        };

        return (
            <div>
                <Navbar />
                <div className="create-profile">
                    <h2>Create User Profile</h2>
                    <form onSubmit={handleSubmit}>
                        <label>
                            Position:
                            <input
                                type="text"
                                name="position"
                                value={formData.position}
                                onChange={handleChange}
                                required
                            />
                        </label>
                        <label>
                            Division:
                            <input
                                type="text"
                                name="division"
                                value={formData.division}
                                onChange={handleChange}
                                required
                            />
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
                            Number of Sick Leaves:
                            <input
                                type="number"
                                name="num_sickleave"
                                value={formData.num_sickleave}
                                onChange={handleChange}
                                required
                            />
                        </label>
                        <label>
                            Number of Vacation Leaves:
                            <input
                                type="number"
                                name="num_vacationleave"
                                value={formData.num_vacationleave}
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
                        <label>
                            Custom User ID:
                            <input
                                type="text"
                                name="custom_user_id"
                                value={formData.custom_user_id}
                                onChange={handleChange}
                                required
                            />
                        </label>
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
                                required
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
                        <button type="submit">Create Profile</button>
                    </form>
                </div>
            </div>
        );
    }

    export default CreateProfile;
