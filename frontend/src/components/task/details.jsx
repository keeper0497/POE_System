import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api";
import Navbar from "../../components/Navbar";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "../../styles/task/detail.css"

function ProjectDetail() {
    const { id } = useParams();  // Get the project ID from the URL
    const navigate = useNavigate();  // For navigation after delete or update
    const [project, setProject] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        api.get(`/api/projects/${id}/`)
            .then((response) => {
                setProject(response.data);
            })
            .catch((err) => {
                setError(err.message);
            });
    }, [id]);

    const handleDelete = () => {
        api.delete(`/api/projects/${id}/`)
            .then(() => {
                navigate("/");  // Redirect to home or project list after deletion
            })
            .catch((err) => setError(err.message));
    };

    const handleUpdate = () => {
        navigate(`/update-project/${id}`);  // Redirect to the update page
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
            <div className="project-detail">
                <h2>{project.project_name}</h2>
                <p><strong>Start Date:</strong> {project.project_start}</p>
                <p><strong>End Date:</strong> {project.project_end}</p>
                <p><strong>Assigned Employee:</strong> {project.assign_employee}</p>
                <p><strong>Status:</strong> {project.status}</p>
                <p><strong>Location:</strong> {project.location ? `${project.location.latitude}, ${project.location.longitude}` : "Not set"}</p>

                {project.location && (
                    <MapContainer
                        center={[project.location.latitude, project.location.longitude]}
                        zoom={13}
                        style={{ height: "400px", width: "100%", marginTop: "20px" }}
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

                <div className="project-actions">
                    <button onClick={handleUpdate} className="btn update-btn">Update Project</button>
                    <button onClick={handleDelete} className="btn delete-btn">Delete Project</button>
                </div>
            </div>
        </div>
    );
}

export default ProjectDetail;
