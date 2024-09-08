import { useState, useEffect } from "react";
import api from "../../api";
import "../../styles/task/create.css";
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
    }); // State for status summary

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
                } else {
                    alert("Failed to create project.");
                }
            })
            .catch((err) => alert(`Error: ${err.message}`));
    };

    function LocationMarker() {
        useMapEvents({
            click(e) {
                setLocation(e.latlng);
            },
        });

        return location ? <Marker position={location}></Marker> : null;
    }

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = () => {
        api
            .get("/api/projects/")
            .then((res) => setProjects(res.data))
            .catch((err) => alert(`Error: ${err.message}`));
    };

    useEffect(() => {
        getProjects(); // Fetch projects on component mount
    }, []);

    const getProjects = () => {
        api
            .get("/api/projects/")
            .then((res) => res.data)
            .then((data) => {
                setProjects(data);
                calculateStatusSummary(data); // Calculate the status summary
            })
            .catch((err) => alert(err));
    };

    const calculateStatusSummary = (projects) => {
        const summary = { done: 0, ongoing: 0, upcoming: 0 };

        projects.forEach((project) => {
            if (project.status === "done") {
                summary.done += 1;
            } else if (project.status === "ongoing") {
                summary.ongoing += 1;
            } else if (project.status === "upcoming") {
                summary.upcoming += 1;
            }
        });

        setStatusSummary(summary);
    };

    return (
        <div>
            <Navbar />
            <div className="create-project">
                <h2>Create Project</h2>
                <div className="status-summary">
                    <p className="statuscode-done"><strong>Done:</strong> {statusSummary.done}</p>
                    <p className="statuscode-ongoing"><strong>Ongoing:</strong> {statusSummary.ongoing}</p>
                    <p className="statuscode-upcoming"><strong>Upcoming:</strong> {statusSummary.upcoming}</p>
                </div>
                <form onSubmit={handleSubmit}>
                    <label>
                        Project Name:
                        <input
                            type="text"
                            name="project_name"
                            value={formData.project_name}
                            onChange={handleChange}
                            required
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
                        />
                    </label>
                    <label>
                        Status:
                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            required
                        >
                            <option value="ongoing">Ongoing</option>
                            <option value="done">Done</option>
                            <option value="upcoming">Upcoming</option>
                        </select>
                    </label>
                    <label>
                        Assign Employee:
                        <input
                            type="number"
                            name="assign_employee"
                            value={formData.assign_employee}
                            onChange={handleChange}
                            required
                        />
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
    );
}

export default CreateProject;
