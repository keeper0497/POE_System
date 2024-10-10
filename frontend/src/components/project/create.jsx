import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";  // Import useNavigate
import api from "../../api";
import "../../styles/project/create.css";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import Navbar from "../../components/Navbar";

function CreateProject() {
    const [formData, setFormData] = useState({
        project_name: "",
        project_start: "",
        project_end: "",
        assign_employee: "",
        status: "upcoming", // default value
    });
    const [location, setLocation] = useState(null);
    const [projects, setProjects] = useState([]);
    const [statusSummary, setStatusSummary] = useState({
        done: 0,
        ongoing: 0,
        upcoming: 0,
    });
    const [employees, setEmployees] = useState([]);  // State for employees
    const [currentUser, setCurrentUser] = useState(null);  // Track current user
    const navigate = useNavigate();  // Initialize useNavigate hook

    useEffect(() => {
        fetchEmployees();  // Fetch employees when component mounts
        fetchProjects();    // Fetch projects
        fetchCurrentUser(); // Fetch current user information
    }, []);

    // Fetch users/employees from the API
    const fetchEmployees = () => {
        api.get("/api/users/")  // Assuming your API endpoint for fetching users
            .then((res) => setEmployees(res.data))
            .catch((err) => alert(`Error: ${err.message}`));
    };

    // Fetch current user information
    const fetchCurrentUser = () => {
        api.get("/api/user/")  // Assuming your API endpoint for fetching current user
            .then((res) => setCurrentUser(res.data))
            .catch((err) => console.error("Error fetching user:", err.message));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const data = {
            ...formData,
            location: location ? { latitude: location.lat, longitude: location.lng } : null,
        };

        api.post("/api/projects/", data)
            .then((res) => {
                if (res.status === 201) {
                    alert("Project created successfully!");
                    setFormData({
                        project_name: "",
                        project_start: "",
                        project_end: "",
                        assign_employee: "",
                        status: "upcoming", // reset to default value
                    });
                    setLocation(null);
                    if (formData.assign_employee !== currentUser.id) {  // Ensure admin doesn't get a notification
                        sendNotificationToEmployee(formData.assign_employee, formData.project_name);
                    }
                    
                    // Redirect to the Home page after project creation
                    navigate("/");  // Redirect to the Home page
                } else {
                    alert("Failed to create project.");
                }
            })
            .catch((err) => alert(`Error: ${err.message}`));
    };

    const sendNotificationToEmployee = (employeeId, projectName) => {
        // Only send notification to the assigned employee, not to the admin
        if (employeeId) {
            const message = `You have been assigned to the project: ${projectName}`;
            api.post('/api/notifications/', { user: employeeId, message })
                .then((response) => {
                    console.log("Notification sent to employee:", response.data);
                })
                .catch((err) => {
                    console.error("Error sending notification:", err.response ? err.response.data : err.message);
                });
        }
    };

    function LocationMarker() {
        useMapEvents({
            click(e) {
                setLocation(e.latlng);
            },
        });

        return location ? <Marker position={location}></Marker> : null;
    }

    const fetchProjects = () => {
        api
            .get("/api/projects/")
            .then((res) => setProjects(res.data))
            .catch((err) => alert(`Error: ${err.message}`));
    };

    // const calculateStatusSummary = (projects) => {
    //     const summary = { done: 0, ongoing: 0, upcoming: 0 };

    //     projects.forEach((project) => {
    //         if (project.status === "done") {
    //             summary.done += 1;
    //         } else if (project.status === "ongoing") {
    //             summary.ongoing += 1;
    //         } else if (project.status === "upcoming") {
    //             summary.upcoming += 1;
    //         }
    //     });

    //     setStatusSummary(summary);
    // };

    return (
        <div>
            <Navbar />
            <div className="create-project">
                <h2>Create Project</h2>
                {/* <div className="status-summary">
                    <p className="statuscode-done"><strong>Done:</strong> {statusSummary.done}</p>
                    <p className="statuscode-ongoing"><strong>Ongoing:</strong> {statusSummary.ongoing}</p>
                    <p className="statuscode-upcoming"><strong>Upcoming:</strong> {statusSummary.upcoming}</p>
                </div> */}
                <div className="create-form">
                    <form onSubmit={handleSubmit}>
                        <label>
                            Project Name:
                            <input
                                type="text"
                                name="project_name"
                                value={formData.project_name}
                                onChange={handleChange}
                                required
                                className="project-name"
                            />
                        </label>
                        <label>
                            Project Start:
                            <input
                                type="date"
                                name="project_start"
                                value={formData.project_start}
                                onChange={handleChange}
                                required
                                className="project-start"
                            />
                        </label>
                        <label>
                            Project End:
                            <input
                                type="date"
                                name="project_end"
                                value={formData.project_end}
                                onChange={handleChange}
                                required
                                className="project-end"
                            />
                        </label>
                        <label>
                            Status:
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                required
                                className="select-status"
                            >
                                <option value="ongoing">Ongoing</option>
                                <option value="done">Done</option>
                                <option value="upcoming">Upcoming</option>
                            </select>
                        </label>
                        <label>
                            Assign Employee:
                            <select
                                name="assign_employee"
                                value={formData.assign_employee}
                                onChange={handleChange}
                                required
                                className="select-employee"
                            >
                                <option value="">Select Employee</option>
                                {employees.map((employee) => (
                                    <option key={employee.id} value={employee.id}>
                                        {employee.username}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <div className="map-container">
                            <MapContainer center={[13.6051, 124.2460]} zoom={13} style={{ height: "400px" }}>
                                <TileLayer
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                />
                                <LocationMarker />
                            </MapContainer>
                        </div>
                        <button type="submit">Create Project</button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default CreateProject;
