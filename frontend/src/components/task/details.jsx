import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api";
import Navbar from "../../components/Navbar";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "../../styles/task/detail.css";
import NotificationModal from "../../components/NotificationModal";  // Import NotificationModal

const SOCKET_URL = "ws://localhost:8000/ws/location/";

function ProjectDetail() {
    const { id } = useParams();  // Get the project ID from the URL
    const navigate = useNavigate();  // For navigation after delete or update
    const [project, setProject] = useState(null);
    const [isSuperUser, setIsSuperUser] = useState(false); // State to track superuser status
    const [employeeLocation, setEmployeeLocation] = useState(null);  // State for employee's location
    const [error, setError] = useState(null);
    const [notifications, setNotifications] = useState([]); // State for notifications
    const [showModal, setShowModal] = useState(false); // State to control modal visibility

    // Fetch user details to determine if the user is a superuser
    const fetchUserDetails = () => {
        api
            .get("/api/user/") // Assuming this endpoint provides user info
            .then((res) => {
                setIsSuperUser(res.data.is_superuser); // Check if the user is a superuser
            })
            .catch((err) => alert(`Error: ${err.message}`));
    };

    // On component mount, fetch user details and projects
    useEffect(() => {
        fetchUserDetails(); // Fetch user details to check superuser status
    }, []);

    // Fetch project details
    useEffect(() => {
        api.get(`/api/projects/${id}/`)
            .then((response) => {
                setProject(response.data);
            })
            .catch((err) => {
                setError(err.message);
            });
    }, [id]);

    // Function to post location to the backend
    const updateLocationInBackend = (latitude, longitude) => {
        if (project?.assign_employee) {
            api.post('/api/update-location/', {
                employee_id: project.assign_employee,
                latitude: latitude,
                longitude: longitude
            })
            .then((response) => {
                console.log("Location updated:", response.data);
            })
            .catch((err) => {
                console.error("Error updating location:", err.message);
            });
        }
    };

    // Function to check if the location is outside the geofence
    const isOutsideGeofence = (lat, lng, centerLat, centerLng, radius) => {
        const distance = Math.sqrt(
            Math.pow(lat - centerLat, 2) + Math.pow(lng - centerLng, 2)
        );
        return distance > radius;
    };

    // Fetch the employee location and automatically post updates every 10 seconds
    useEffect(() => {
        if (navigator.geolocation) {
            // Automatically fetch the location
            const updateLocation = () => {
                navigator.geolocation.getCurrentPosition((position) => {
                    const { latitude, longitude } = position.coords;

                    // Update the employee's location in the backend
                    updateLocationInBackend(latitude, longitude);

                    // Update local state for rendering
                    setEmployeeLocation({ latitude, longitude });

                    // Check if the employee is outside the geofence
                    if (project?.location) {
                        const isOutside = isOutsideGeofence(
                            latitude,
                            longitude,
                            project.location.latitude,
                            project.location.longitude,
                            0.8  // 800 meters radius (converted from 800 km for demonstration purposes)
                        );

                        if (isOutside) {
                            setNotifications(prevNotifications => [
                                ...prevNotifications,
                                "You are outside the geofence area. Please move back inside."
                            ]);
                            setShowModal(true); // Show the modal when there is a notification
                            // Optionally, send notification to the admin (implementation depends on how you want to notify)
                        } else {
                            setNotifications(prevNotifications => 
                                prevNotifications.filter(notification => notification !== "You are outside the geofence area. Please move back inside.")
                            );
                        }
                    }
                }, (error) => {
                    console.error("Error getting location:", error);
                    setError("Unable to fetch employee location.");
                });
            };

            // Fetch the location immediately and every 10 seconds
            updateLocation();  // Initial fetch
            const locationInterval = setInterval(updateLocation, 10000);  // Fetch every 10 seconds

            // Clear interval when component unmounts
            return () => clearInterval(locationInterval);
        } else {
            setError("Geolocation is not supported by this browser.");
        }
    }, [project]);

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

    const handleCloseModal = () => {
        setShowModal(false); // Hide the modal
    };

    if (error) {
        return <div>Error: {error}</div>;
    }

    if (!project) {
        return <div>Loading...</div>;
    }

    const geofenceRadius = 800;  // 800 meters radius for geofence

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

                <MapContainer
                    center={[project.location.latitude, project.location.longitude]}
                    zoom={13}
                    style={{ height: "400px", width: "100%", marginTop: "20px" }}
                >
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />

                    {/* Project location marker */}
                    <Marker position={[project.location.latitude, project.location.longitude]}>
                        <Popup>{project.project_name}</Popup>
                    </Marker>

                    {/* Geofence Circle */}
                    <Circle
                        center={[project.location.latitude, project.location.longitude]}
                        radius={geofenceRadius}
                        color="blue"
                        fillColor="blue"
                        fillOpacity={0.2}
                    />

                    {/* Employee location marker */}
                    {employeeLocation && (
                        <Marker position={[employeeLocation.latitude, employeeLocation.longitude]}>
                            <Popup>Employee's current location</Popup>
                        </Marker>
                    )}
                </MapContainer>

                {/* Conditionally render "Create New Project" button for superusers */}
                {isSuperUser && (
                    <div className="project-actions">
                        <button onClick={handleUpdate} className="btn update-btn">Update Project</button>
                        <button onClick={handleDelete} className="btn delete-btn">Delete Project</button>
                    </div>
                )}

                {/* Show Notification Modal if there are notifications */}
                {showModal && (
                    <NotificationModal 
                        notifications={notifications}
                        onClose={handleCloseModal}
                    />
                )}
            </div>
        </div>
    );
}

export default ProjectDetail;
