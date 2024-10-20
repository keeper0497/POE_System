import { useState, useEffect } from "react";
import api from "../api";
import "../styles/Home.css";
import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";
import NotificationModal from "../components/NotificationModal";

function Home() {
    const [projects, setProjects] = useState([]);
    const [statusSummary, setStatusSummary] = useState({
        done: 0,
        ongoing: 0,
        upcoming: 0,
    });
    const [isSuperUser, setIsSuperUser] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [employeeId, setEmployeeId] = useState(null);
    const [lastNotifiedLocation, setLastNotifiedLocation] = useState(null);
    const [lastNotificationTime, setLastNotificationTime] = useState(null);
    const [assignedProjects, setAssignedProjects] = useState([]); // Track assigned projects

    const notificationCooldown = 5 * 60 * 1000; // 5 minutes cooldown
    const thresholdDistance = 0.1; // Threshold for significant movement in kilometers

    useEffect(() => {
        fetchUserDetails();
    }, []);

    const fetchUserDetails = () => {
        api
            .get("/api/user/")
            .then((res) => {
                setIsSuperUser(res.data.is_superuser);
                setEmployeeId(res.data.id);
                getProjects(res.data.is_superuser);
                fetchNotifications();
            })
            .catch((err) => alert(`Error fetching user details: ${err.message}`));
    };

    useEffect(() => {
        if (employeeId) {
            const ws = new WebSocket(`ws://poe-system.onrender.com:8000/ws/notifications/${employeeId}/`);

            ws.onopen = () => {
                console.log('WebSocket connection established');
            };

            ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                const notificationMessage = data.notification;

                setNotifications((prev) => [...prev, { message: notificationMessage, created_at: new Date().toISOString() }]);
                setShowModal(true);

                saveNotificationToDatabase(notificationMessage);
            };

            ws.onerror = (error) => {
                console.error('WebSocket error: ', error);
            };

            ws.onclose = (event) => {
                console.warn('WebSocket closed: ', event);
            };

            return () => ws.close();
        }
    }, [employeeId]);

    const fetchNotifications = () => {
        api
            .get("/api/notifications/")
            .then((res) => setNotifications(res.data))
            .catch((err) => alert(`Error fetching notifications: ${err.message}`));
    };

    // // WebSocket connection for receiving notifications in real-time
    // const listenForNotifications = (userId, isSuperUser) => {
    //     const ws = new WebSocket(`ws://poe-system.onrender.com:8000/ws/notifications/${userId}/`);

    //     ws.onopen = () => {
    //         console.log('WebSocket connection established');
    //     };

    //     ws.onmessage = (event) => {
    //         const data = JSON.parse(event.data);
    //         const notificationMessage = data.notification;

    //         setNotifications((prev) => [...prev, { message: notificationMessage, created_at: new Date().toISOString() }]);
    //         setShowModal(true);
    //     };

    //     ws.onerror = (error) => {
    //         console.error('WebSocket error: ', error);
    //     };

    //     ws.onclose = (event) => {
    //         console.warn('WebSocket closed: ', event);
    //     };

    //     return () => ws.close(); // Clean up WebSocket on component unmount
    // };

    const getProjects = (isSuperUser) => {
        let endpoint = "/api/projects/";

        api
            .get(endpoint)
            .then((res) => {
                setProjects(res.data);
                calculateStatusSummary(res.data);
                // Filter projects where the user is assigned
                const assigned = res.data.filter(project => project.assign_employee === employeeId && project.status === "ongoing");
                setAssignedProjects(assigned); // Only store assigned projects if user is an employee
            })
            .catch((err) => alert(`Error fetching projects: ${err.message}`));
    };

    const calculateStatusSummary = (projects) => {
        const summary = { done: 0, ongoing: 0, upcoming: 0 };

        projects.forEach((project) => {
            if (project.status === "done") summary.done += 1;
            else if (project.status === "ongoing") summary.ongoing += 1;
            else if (project.status === "upcoming") summary.upcoming += 1;
        });

        setStatusSummary(summary);
    };

    const saveNotificationToDatabase = (message) => {
        api.post('/api/notifications/', { message })
            .then((response) => {
                console.log("Notification saved to database:", response.data);
            })
            .catch(err => {
                console.error("Error saving notification:", err.response ? err.response.data : err.message);
            });
    };

    // Function to check if the user is outside the geofence
    const isOutsideGeofence = (lat, lng, centerLat, centerLng, radius) => {
        const distance = Math.sqrt(
            Math.pow(lat - centerLat, 2) + Math.pow(lng - centerLng, 2)
        );
        return distance > radius;
    };

    const hasMovedSignificantly = (newLat, newLng) => {
        if (!lastNotifiedLocation) return true; // First notification
        const { latitude, longitude } = lastNotifiedLocation;
        const distanceMoved = Math.sqrt(Math.pow(newLat - latitude, 2) + Math.pow(newLng - longitude, 2));
        return distanceMoved > thresholdDistance;
    };

    const checkLocationAndNotify = (latitude, longitude) => {
        const now = Date.now();
        if (hasMovedSignificantly(latitude, longitude) && (!lastNotificationTime || (now - lastNotificationTime) > notificationCooldown)) {
            assignedProjects.forEach((project) => {
                if (project.status === "ongoing" && project.location) {
                    const isOutside = isOutsideGeofence(
                        latitude,
                        longitude,
                        project.location.latitude,
                        project.location.longitude,
                        0.8 // 800 meters radius
                    );

                    if (isOutside) {
                        const notificationMessage = `You are outside the geofence for project ${project.project_name}.`;
                        setNotifications((prev) => [...prev, notificationMessage]);
                        setShowModal(true);
                        saveNotificationToDatabase(notificationMessage);
                        setLastNotifiedLocation({ latitude, longitude });
                        setLastNotificationTime(now);
                    }
                }
            });
        }
    };

    const updateLocation = (latitude, longitude) => {
        // Don't update location for superusers (admins)
        if (!isSuperUser && assignedProjects.length > 0) {
            api.post('/api/update-location/', {
                employee_id: employeeId,
                latitude,
                longitude
            })
            .then((response) => {
                console.log("Location updated:", response.data);
            })
            .catch((err) => {
                console.error("Error updating location:", err.message);
            });
        }
    };

    useEffect(() => {
        if (navigator.geolocation) {
            const updateLocationAndCheck = () => {
                navigator.geolocation.getCurrentPosition((position) => {
                    const { latitude, longitude } = position.coords;
                    updateLocation(latitude, longitude);
                    checkLocationAndNotify(latitude, longitude);
                }, (error) => {
                    console.error("Error getting location:", error);
                });
            };

            updateLocationAndCheck(); // Initial location check
            const locationInterval = setInterval(updateLocationAndCheck, 10 * 1000); // Check every 10 seconds

            return () => clearInterval(locationInterval);
        } else {
            console.error("Geolocation is not supported by this browser.");
        }
    }, [assignedProjects, employeeId]);

    return (
        <div className="home-container">
            <Navbar />
            <div className="bell-icon-container">
                <span className="bell-icon" onClick={() => setShowModal(true)}>
                    <i className="fa fa-bell"></i>
                    {notifications.length > 0 && <span className="notification-count">{notifications.length}</span>}
                </span>
            </div>
            <h2>Overview</h2>
            <div className="status-summary">
                <p className="statuscode-done"><strong>Done:</strong> {statusSummary.done}</p>
                <p className="statuscode-ongoing"><strong>Ongoing:</strong> {statusSummary.ongoing}</p>
                <p className="statuscode-upcoming"><strong>Upcoming:</strong> {statusSummary.upcoming}</p>
            </div>
            <div className="projects-summary">
                {projects.length > 0 ? (
                    projects.map((project) => (
                        <div key={project.id} className={`project-summary ${project.status}`}>
                            <Link to={`/detail-project/${project.id}`} className="project-link">
                                <div className="project-details">
                                    <h3>{project.project_name}</h3>
                                    <p><strong>Start Date:</strong> {project.project_start}</p>
                                    <p><strong>End Date:</strong> {project.project_end}</p>
                                </div>
                                <div className={`project-status ${project.status}`}>
                                    {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                                </div>
                            </Link>
                        </div>
                    ))
                ) : (
                    <p>No projects available.</p>
                )}
            </div>

            {showModal && (
                <NotificationModal 
                    notifications={notifications} 
                    onClose={() => setShowModal(false)} 
                />
            )}
        </div>
    );
}

export default Home;
