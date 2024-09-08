import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api";
import "../../styles/task/read.css";
import Navbar from "../../components/Navbar";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

function ProjectList() {
    const [projects, setProjects] = useState([]);
    const navigate = useNavigate(); // Use useNavigate instead of useHistory
    const [statusSummary, setStatusSummary] = useState({
        done: 0,
        ongoing: 0,
        upcoming: 0,
    }); // State for status summary

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = () => {
        api
            .get("/api/projects/")
            .then((res) => setProjects(res.data))
            .catch((err) => alert(`Error: ${err.message}`));
    };

    const handleCreateProject = () => {
        navigate("/create-project"); // Use navigate instead of history.push
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

    const getStatusClassName = (status) => {
        if (status === "done") return "status-done";
        if (status === "ongoing") return "status-ongoing";
        if (status === "upcoming") return "status-upcoming";
        return "";
    };

    return (
        <div>
            <Navbar />
            <div className="project-list"> 
                <h2>Projects</h2>
                <div className="status-summary">
                    <p className="statuscode-done"><strong>Done:</strong> {statusSummary.done}</p>
                    <p className="statuscode-ongoing"><strong>Ongoing:</strong> {statusSummary.ongoing}</p>
                    <p className="statuscode-upcoming"><strong>Upcoming:</strong> {statusSummary.upcoming}</p>
                </div>
                <button onClick={handleCreateProject} className="create-project-btn">
                    Create New Project
                </button>
                <div className="map-container"> {/* Add map-container class here */}
                    <MapContainer center={[13.6051, 124.2460]} zoom={13} style={{ height: "400px", width: "100%" }}>
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        />
                        {projects.map((project) => (
                            <Marker
                                key={project.id}
                                position={[project.location.latitude, project.location.longitude]}
                            >
                                <Popup>
                                    <div className={`popup-content ${getStatusClassName(project.status)}`}>
                                        <strong>{project.project_name}</strong><br />
                                        Start: {project.project_start}<br />
                                        End: {project.project_end}
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                </div>
            </div>
        </div>
    );
}

export default ProjectList;
