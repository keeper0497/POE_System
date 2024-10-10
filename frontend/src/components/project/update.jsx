import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api";
import Navbar from "../../components/Navbar";
import "../../styles/project/update.css";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
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
    });

    useEffect(() => {
        api.get(`/api/projects/${id}/`)
            .then((response) => {
                setProject(response.data);
                setFormData({
                    project_name: response.data.project_name,
                    project_start: response.data.project_start,
                    project_end: response.data.project_end,
                    assign_employee: response.data.assign_employee,
                });
            })
            .catch((err) => setError(err.message));
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        api.put(`/api/projects/${id}/`, formData)
            .then(() => {
                navigate(`/detail-project/${id}`);
            })
            .catch((err) => setError(err.message));
    };

    if (error) {
        return <div>Error: {error}</div>;
    }

    if (!project) {
        return <div>Loading...</div>;
    }

    const geofenceRadius = 800;  // 800 km radius

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
                        <input
                            type="number"
                            name="assign_employee"
                            value={formData.assign_employee}
                            onChange={handleChange}
                            required
                        />
                    </label>
                    <button type="submit">Update Project</button>
                </form>

                <div className="map-container">
                    {project.location && (
                        <MapContainer
                            center={[project.location.latitude, project.location.longitude]}
                            zoom={13}
                            style={{ height: "545px", width: "100%", marginTop: "0px" }}
                        >
                            <TileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            />
                            <Marker position={[project.location.latitude, project.location.longitude]}>
                                <Popup>{project.project_name}</Popup>
                            </Marker>
                            <Circle
                                center={[project.location.latitude, project.location.longitude]}
                                radius={geofenceRadius}
                                color="blue"
                                fillColor="blue"
                                fillOpacity={0.2}
                            />
                        </MapContainer>
                    )}
                </div>
            </div>
        </div>
    );
}

export default UpdateProject;
