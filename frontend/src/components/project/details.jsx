import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api";
import Navbar from "../../components/Navbar";
// import BellIcon from "../../components/BellIcon"; // Import BellIcon component
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "../../styles/project/detail.css";
import { format } from "date-fns";

// Import Leaflet and marker assets
import L from "leaflet";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Fix for marker paths
L.Icon.Default.mergeOptions({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIcon2x,
    shadowUrl: markerShadow,
});

// import NotificationModal from "../../components/NotificationModal"; // Import NotificationModal

const SOCKET_URL = "wss://poe-system.onrender.com/ws/location/";
// const SOCKET_URL = "ws://localhost:8000/ws/location/";

function ProjectDetail() {
    const { id } = useParams();  // Get the project ID from the URL
    const navigate = useNavigate();  // For navigation after delete or update
    const [project, setProject] = useState(null);
    const [isSuperUser, setIsSuperUser] = useState(false);
    const [employeeLocation, setEmployeeLocation] = useState(null);
    const [assignedUser, setAssignedUser] = useState(null);
    const [loggedInUserId, setLoggedInUserId] = useState(null);
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
                setLoggedInUserId(res.data.id);
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

        // Update location if logged-in user is the assigned employee
        useEffect(() => {
            if (project?.status === "ongoing" && navigator.geolocation && project.assign_employee === loggedInUserId) {
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
    
                updateLocation();
                const locationInterval = setInterval(updateLocation, 10000);
    
                return () => clearInterval(locationInterval);
            }
        }, [project, loggedInUserId]);
    
        // Fetch assigned employee's location for admin view
        useEffect(() => {
            if (isSuperUser && project?.assign_employee) {
                const fetchEmployeeLocation = () => {
                    api.get(`/api/employee-location/${project.assign_employee}/`)
                        .then((response) => {
                            setEmployeeLocation(response.data); // Assuming response.data contains latitude and longitude
                        })
                        .catch((err) => {
                            console.error("Error fetching employee location:", err.message);
                        });
                };
    
                fetchEmployeeLocation();
                const locationInterval = setInterval(fetchEmployeeLocation, 10000);
    
                return () => clearInterval(locationInterval);
            }
        }, [isSuperUser, project]);

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

    const handleModalToggle = () => {
        setShowModal(!showModal);
    };

    if (error) {
        return <div>Error: {error}</div>;
    }

    if (!project) {
        return <div>Loading...</div>;
    }

    const geofenceRadius = 800;  // 800 meters radius for geofence

    const formatTime = (time) => {
        if (!time) return "Not set";
        try {
            const [hours, minutes] = time.split(":");
            return `${hours}:${minutes}`;
        } catch {
            return "Invalid time";
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
            
            <div className="project-detail">
                
                <h2>{project.project_name}</h2>
                <p><strong>Start Date:</strong> {project.project_start}</p>
                <p><strong>End Date:</strong> {project.project_end}</p>
                <p><strong>Time In:</strong> {formatTime(project.time_in)}</p>
                <p><strong>Time Out:</strong> {formatTime(project.time_out)}</p>
                <p><strong>Assigned Employee:</strong> {assignedUser || "Not assigned"}</p>
                <p><strong>Status:</strong> {project.status}</p>
                
                {/* Check if location exists before rendering */}
                <p><strong>Location:</strong> {project.location ? `${project.location.latitude}, ${project.location.longitude}` : "Not set"}</p>
                <p><strong>Address:</strong> {project.address}</p>
                <div className="project-button">
                    <div className="project-task">
                        <button onClick={handelTaskDetails} className="btn default-btn">Task Info</button>
                        {!isSuperUser && (
                            <button onClick={handleAddTask} className="btn add-task-btn">Add Task</button>
                        )}
                        {isSuperUser && (
                            <button
                                onClick={() => navigate(`/project/${id}/update-time`)}
                                className="btn update-time-btn"
                            >
                                Update Time
                            </button>
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
                                <Popup>Employee Current Location</Popup>
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
