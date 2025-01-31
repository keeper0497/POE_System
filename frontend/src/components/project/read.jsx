import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api";
import "../../styles/project/read.css";
import Navbar from "../../components/Navbar";
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { GeoSearchControl, OpenStreetMapProvider } from "leaflet-geosearch";
import "leaflet/dist/leaflet.css";
import "leaflet-geosearch/dist/geosearch.css";


// Add Search Control to Leaflet Map
const SearchControl = () => {
    const map = useMap();
  
    useEffect(() => {
      const provider = new OpenStreetMapProvider();
  
      const searchControl = new GeoSearchControl({
        provider,
        style: "bar",
        showMarker: true,
        showPopup: true,
        retainZoomLevel: false,
        searchLabel: "Enter address",
      });
  
      map.addControl(searchControl);
      return () => map.removeControl(searchControl);
    }, [map]);
  
    return null;
  };
  

function ProjectList() {
    const [projects, setProjects] = useState([]);
    const [isSuperUser, setIsSuperUser] = useState(false); // State to track superuser status
    const [notifications, setNotifications] = useState([]); // Notifications state
    const [showModal, setShowModal] = useState(false); // Modal visibility state
    const [statusSummary, setStatusSummary] = useState({
        done: 0,
        ongoing: 0,
        upcoming: 0,
    });
    const navigate = useNavigate();

    // Fetch user details to determine if the user is a superuser
    const fetchUserDetails = () => {
        api
            .get("/api/user/") // Assuming this endpoint provides user info
            .then((res) => {
                setIsSuperUser(res.data.is_superuser); // Check if the user is a superuser
            })
            .catch((err) => alert(`Error: ${err.message}`));
    };

    // Fetch project data
    const fetchProjects = () => {
        api
            .get("/api/projects/")
            .then((res) => {
                setProjects(res.data);
                calculateStatusSummary(res.data);
            })
            .catch((err) => alert(`Error: ${err.message}`));
    };

    // Calculate project status summary
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

    // Triggered when the user wants to create a new project
    const handleCreateProject = () => {
        if (isSuperUser) {
            navigate("/create-project");
        }
    };

    // On component mount, fetch user details and projects
    useEffect(() => {
        fetchUserDetails(); // Fetch user details to check superuser status
        fetchProjects();
        fetchNotifications(); // Fetch notifications
    }, []);

    const getStatusClassName = (status) => {
        if (status === "done") return "status-done";
        if (status === "ongoing") return "status-ongoing";
        if (status === "upcoming") return "status-upcoming";
        return "";
    };

    // Fetch notifications for the current user
    const fetchNotifications = async () => {
        try {
            const response = await api.get("/api/notifications/");
            setNotifications(response.data);
        } catch (error) {
            console.error("Error fetching notifications:", error);
        }
    };

    const handleModalToggle = () => {
        setShowModal(!showModal);
        if (!showModal) {
            document.body.classList.add('notification-modal-open');
        } else {
            document.body.classList.remove('notification-modal-open');
        }
    };

    return (
        <div>
            <Navbar />
            <div className="bell-icon-container">
                <span className="bell-icon" onClick={handleModalToggle}>
                    <i className="fa fa-bell"></i>
                    {notifications.length > 0 && (
                        <span className="notification-count">{notifications.length}</span>
                    )}
                </span>
            </div>
            {showModal && (
                <div className="notification-modal">
                    <div className="modal-content">
                        <h3>Notifications</h3>
                        <ul>
                            {notifications.map((notification, index) => (
                                <li key={index}>{notification.message}</li>
                            ))}
                        </ul>
                        <button onClick={handleModalToggle} className="close-modal-btn">
                            Close
                        </button>
                    </div>
                </div>
            )}
            <div className="project-list">
                <h2>Projects</h2>
                <div className="status-summary">
                    <p className="statuscode-done"><strong>Done:</strong> {statusSummary.done}</p>
                    <p className="statuscode-ongoing"><strong>Ongoing:</strong> {statusSummary.ongoing}</p>
                    <p className="statuscode-upcoming"><strong>Upcoming:</strong> {statusSummary.upcoming}</p>
                </div>

                {/* Conditionally render "Create New Project" button for superusers
                {isSuperUser && (
                    <button onClick={handleCreateProject} className="create-project-btn">
                        Create New Project
                    </button>
                )} */}

                <div className="map-container">
                    <MapContainer center={[13.6051, 124.2460]} zoom={13}>
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        />
                        {/* Add Search Control */}
                        <SearchControl />

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
