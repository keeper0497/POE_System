import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api";
import Navbar from "../../components/Navbar";
// import BellIcon from "../../components/BellIcon"; // Import BellIcon component
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "../../styles/project/detail.css";
// import NotificationModal from "../../components/NotificationModal"; // Import NotificationModal

const SOCKET_URL = "wss://poe-system.onrender.com:8000/ws/location/";

function ProjectDetail() {
    const { id } = useParams();  // Get the project ID from the URL
    const navigate = useNavigate();  // For navigation after delete or update
    const [project, setProject] = useState(null);
    const [isSuperUser, setIsSuperUser] = useState(false);
    const [employeeLocation, setEmployeeLocation] = useState(null);
    const [assignedUser, setAssignedUser] = useState(null);
    const [error, setError] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [lastNotifiedLocation, setLastNotifiedLocation] = useState(null);
    const [lastNotificationTime, setLastNotificationTime] = useState(null);

    const notificationCooldown = 5 * 60 * 1000; // 5 minutes cooldown
    const thresholdDistance = 0.1; // 100 meters movement threshold

    // Fetch user details
    const fetchUserDetails = () => {
        api
            .get("/api/user/")
            .then((res) => {
                setIsSuperUser(res.data.is_superuser);
            })
            .catch((err) => alert(`Error: ${err.message}`));
    };

    // Fetch notifications for the logged-in user
    const fetchNotifications = () => {
        api
            .get("/api/notifications/")
            .then((res) => setNotifications(res.data))
            .catch((err) => alert(`Error fetching notifications: ${err.message}`));
    };

    useEffect(() => {
        fetchUserDetails();
        fetchNotifications();
    }, []);

    // Fetch project details
    useEffect(() => {
        api.get(`/api/projects/${id}/`)
            .then((response) => {
                setProject(response.data);

                if (response.data.assign_employee) {
                    return api.get(`/api/user/${response.data.assign_employee}/`);
                }
                throw new Error("No assigned employee found");
            })
            .then((userResponse) => {
                setAssignedUser(userResponse.data.username);
            })
            .catch((err) => {
                setError(err.message);
            });
    }, [id]);

    // Update location in the backend
    const updateLocationInBackend = (latitude, longitude) => {
        if (project?.assign_employee && project?.status === "ongoing") { // Check if status is ongoing
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

    // Check if the employee has moved significantly
    const hasMovedSignificantly = (newLat, newLng) => {
        if (!lastNotifiedLocation) return true; // First notification
        const { latitude, longitude } = lastNotifiedLocation;
        const distanceMoved = Math.sqrt(Math.pow(newLat - latitude, 2) + Math.pow(newLng - longitude, 2));
        return distanceMoved > thresholdDistance;
    };

    // Check location, apply debounce and cooldown logic before triggering notifications
    const checkLocationAndNotify = (latitude, longitude) => {
        const now = Date.now();

        if (hasMovedSignificantly(latitude, longitude) && (!lastNotificationTime || (now - lastNotificationTime) > notificationCooldown)) {
            if (project?.location && project.status === "ongoing") { // Check if project status is ongoing
                const isOutside = isOutsideGeofence(
                    latitude,
                    longitude,
                    project.location.latitude,
                    project.location.longitude,
                    0.8  // 800 meters radius
                );
                
                if (isOutside) {
                    const existingNotification = notifications.find(notification => notification.includes("outside the geofence"));
                    
                    if (!existingNotification) {
                        setNotifications(prevNotifications => [
                            ...prevNotifications,
                            "You are outside the geofence area. Please move back inside."
                        ]);
                        setShowModal(true); // Show modal when there is a notification
                        setLastNotifiedLocation({ latitude, longitude }); // Update last notified location
                        setLastNotificationTime(now); // Set last notification time
                    }
                } else {
                    setNotifications(prevNotifications =>
                        prevNotifications.filter(notification => notification !== "You are outside the geofence area. Please move back inside.")
                    );
                }
            }
        }
    };

    // Fetch the employee location and automatically post updates every 10 seconds if project is ongoing
    useEffect(() => {
        if (project?.status === "ongoing" && navigator.geolocation) {
            const updateLocation = () => {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const { latitude, longitude } = position.coords;

                        updateLocationInBackend(latitude, longitude);
                        setEmployeeLocation({ latitude, longitude });
                        checkLocationAndNotify(latitude, longitude);
                    },
                    (error) => {
                        console.error("Error getting location:", error);
                        setError("Unable to fetch employee location. Please allow location access.");
                    }
                );
            };

            updateLocation();  // Initial fetch
            const locationInterval = setInterval(updateLocation, 10000);  // Fetch every 10 seconds

            return () => clearInterval(locationInterval);
        }
    }, [project]);

    // Handle project actions (add, update, delete)
    const handleAddTask = () => navigate(`/task/${id}/create`);
    const handleDelete = () => {
        api.delete(`/api/projects/${id}/`)
            .then(() => navigate("/"))
            .catch((err) => setError(err.message));
    };
    const handleUpdate = () => navigate(`/update-project/${id}`);
    const handelTaskDetails = () => navigate(`/task/${id}/list`);
    const handleCloseModal = () => setShowModal(false);

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
                <p><strong>Assigned Employee:</strong> {assignedUser || "Not assigned"}</p>
                <p><strong>Status:</strong> {project.status}</p>
                
                {/* Check if location exists before rendering */}
                <p><strong>Location:</strong> {project.location ? `${project.location.latitude}, ${project.location.longitude}` : "Not set"}</p>

                <div className="project-button">
                    <div className="project-task">
                        <button onClick={handelTaskDetails} className="btn default-btn">Task Info</button>
                        {!isSuperUser && (
                            <button onClick={handleAddTask} className="btn add-task-btn">Add Task</button>
                        )}
                    </div>
                </div>

                {/* Only render the map if project location is available */}
                {project.location && (
                    <MapContainer center={[project.location.latitude, project.location.longitude]} zoom={13} style={{ height: "400px", width: "100%" }}>
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        />
                        <Marker position={[project.location.latitude, project.location.longitude]}>
                            <Popup>{project.project_name}</Popup>
                        </Marker>
                        {employeeLocation && (
                            <Marker position={[employeeLocation.latitude, employeeLocation.longitude]}>
                                <Popup>Your Current Location</Popup>
                            </Marker>
                        )}
                        <Circle center={[project.location.latitude, project.location.longitude]} radius={geofenceRadius} color="red" fillOpacity={0.1} />
                    </MapContainer>
                )}

                {isSuperUser && (
                    <div className="project-actions">
                        <button onClick={handleUpdate} className="btn update-btn">Update Project</button>
                        <button onClick={handleDelete} className="btn delete-btn">Delete Project</button>
                    </div>
                )}

                {/* Notification Modal
                <NotificationModal show={showModal} notifications={notifications} onClose={handleCloseModal} /> */}
            </div>
        </div>
    );
}

export default ProjectDetail;
