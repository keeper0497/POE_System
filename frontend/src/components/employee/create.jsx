    import { useState } from "react";
    import api from "../../api";
    import "../../styles/employee/create.css";
    import Navbar from "../../components/Navbar";
    import { useNavigate } from "react-router-dom";

    function CreateProfile() {
        const [formData, setFormData] = useState({
            position: "",
            division: "",
            start_date: "",
            contact_number: "",
            first_name: "",
            last_name: "",
            middle_name: "",
            suffix: "",
            email: "",
        });

        const navigate = useNavigate();

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
                            contact_number: "",
                            first_name: "",
                            last_name: "",
                            middle_name: "",
                            suffix: "",
                            email: "",
                        });
                        navigate("/")
                    } else {
                        alert("Failed to create profile.");
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
            "Construction Section",
        ]

        return (
            <div>
                {/* <Navbar /> */}
                <div className="create-profile">
                    <h2>Create User Profile</h2>
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
                            <input
                                type="text"
                                name="position"
                                value={formData.position}
                                onChange={handleChange}
                                defaultValue={"Project Engineer"}
                            />
                            {/* <select
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
                            </select> */}
                        </label>
                        <label>
                            Division:
                            <input
                                type="text"
                                name="division"
                                value={formData.division}
                                onChange={handleChange}
                                defaultValue={"Construction Section"}
                            />
                            {/* <select
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
                            </select> */}
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
                        
                        <button type="submit">Create Profile</button>
                    </form>
                </div>
            </div>
        );
    }

    export default CreateProfile;
