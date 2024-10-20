import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api";
import Navbar from "../../components/Navbar";
import "../../styles/project/update.css";
import { MapContainer, TileLayer, Marker, useMapEvents, Popup, Circle } from "react-leaflet";
import "leaflet/dist/leaflet.css";

function UpdateProject() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [project, setProject] = useState(null);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        project_name: "",
        project_start: "",
        project_end: "",
        assign_employee: "",
        status: "ongoing",  // Add status initialization
    });
    const [employees, setEmployees] = useState([]);
    const [location, setLocation] = useState(null);  // State for location

    // Fetch project details
    useEffect(() => {
        api.get(`/api/projects/${id}/`)
            .then((response) => {
                setProject(response.data);
                setFormData({
                    project_name: response.data.project_name,
                    project_start: response.data.project_start,
                    project_end: response.data.project_end,
                    assign_employee: response.data.assign_employee,
                    status: response.data.status,  // Ensure status is captured
                });
                setLocation({
                    lat: response.data.location.latitude,
                    lng: response.data.location.longitude,
                });
            })
            .catch((err) => setError(err.message));
    }, [id]);

    // Fetch list of employees for the dropdown
    useEffect(() => {
        api.get("/api/users/")
            .then((res) => setEmployees(res.data))
            .catch((err) => alert(`Error fetching employees: ${err.message}`));
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const updatedData = {
            ...formData,
            location: location ? { latitude: location.lat, longitude: location.lng } : null,
        };

        api.put(`/api/projects/${id}/`, updatedData)
            .then(() => {
                navigate(`/detail-project/${id}`);
            })
            .catch((err) => setError(err.message));
    };

    // Update location based on user click
    function LocationMarker() {
        useMapEvents({
            click(e) {
                setLocation(e.latlng);
            },
        });

        return location ? <Marker position={location}></Marker> : null;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    if (!project) {
        return <div>Loading...</div>;
    }

    const geofenceRadius = 800;  // 800 meters radius

    return (
        <div>
            <Navbar />
            <div className="update-project">
                <h2>Update Project</h2>
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
                    <button type="submit">Update Project</button>
                </form>

                <div className="map-container">
                    <MapContainer
                        center={location || [13.6051, 124.2460]} // Default center if no location
                        zoom={13}
                        key={location ? location.lat : 'default'} // Force re-render of map on location change
                        style={{ height: "400px", width: "100%" }}
                    >
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        />
                        {location && (
                            <>
                                <Marker position={location}>
                                    <Popup>{formData.project_name}</Popup>
                                </Marker>
                                <Circle
                                    center={location}
                                    radius={geofenceRadius}
                                    color="blue"
                                    fillColor="blue"
                                    fillOpacity={0.2}
                                />
                            </>
                        )}
                        <LocationMarker />
                    </MapContainer>
                </div>
            </div>
        </div>
    );
}

export default UpdateProject;
