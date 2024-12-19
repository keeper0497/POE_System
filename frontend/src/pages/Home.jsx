import { useState, useEffect } from "react";
import api from "../api";
import "../styles/Home.css";
import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";
import NotificationModal from "../components/NotificationModal";
import { Bar } from "react-chartjs-2"; // Import the Bar chart component
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import { useNavigate } from "react-router-dom";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

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
    const [userName, setUserName] = useState(""); // Store first name
    const [lastNotifiedLocation, setLastNotifiedLocation] = useState(null);
    const [lastNotificationTime, setLastNotificationTime] = useState(null);
    const [assignedProjects, setAssignedProjects] = useState([]); // Track assigned projects
    const [triggerCheck, setTriggerCheck] = useState(false); // Trigger for geofence checks

    const notificationCooldown = 5 * 60 * 1000; // 5 minutes cooldown
    const thresholdDistance = 0.1; // Threshold for significant movement in kilometers
    const geofenceRadius = 0.8; // Geofence radius in kilometers (800 meters)
    const navigate = useNavigate();

    useEffect(() => {
        fetchUserDetails();
    }, []);

    const fetchUserDetails = () => {
        api
            .get("/api/user/")
            .then((res) => {
                console.log("User details response from API:", res.data);
    
                // Check if `res.data.id` exists and is valid
                if (res.data.id) {
                    setEmployeeId(res.data.id);
                    console.log("Employee ID set to:", res.data.id);
                    getProjects(res.data.id);
                    setIsSuperUser(res.data.is_superuser);
                    fetchNotifications();
                } else {
                    console.error("Invalid employee ID in user details:", res.data.id);
                    setEmployeeId(null); // Set to null to avoid unexpected behavior
                }
            })
            .catch((err) => alert(`Error fetching user details: ${err.message}`));
    };
    

    console.log("employeeId " + employeeId);
    // console.log("assignedProjects " + assignedProjects);

    useEffect(() => {
        if (employeeId) {
            console.log(`Setting up WebSocket for employeeId: ${employeeId}`);
            // const ws = new WebSocket(`ws://localhost:8000/ws/notifications/${employeeId}/`);
            const ws = new WebSocket(`wss://poe-system.onrender.com/ws/notifications/${employeeId}/`);


    
            ws.onopen = () => {
                console.log("WebSocket connection established");
            };
    
            ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                const notificationMessage = data.notification;
    
                // Show notification for admin and users
                if (isSuperUser || data.target === employeeId) {
                    setNotifications((prev) => [
                        ...prev,
                        { message: notificationMessage, created_at: new Date().toISOString() },
                    ]);
                    setShowModal(false);

                    saveNotificationToDatabase(notificationMessage);
                }
            };
    
            ws.onerror = (error) => {
                console.error("WebSocket error: ", error);
            };
    
            ws.onclose = (event) => {
                console.warn("WebSocket closed: ", event);
            };
    
            return () => ws.close();
        }
    }, [employeeId]);


    useEffect(() => {
        if (employeeId && assignedProjects.length > 0) {
            console.log(
                `Starting location checks for employeeId: ${employeeId} with ${assignedProjects.length} assigned projects.`
            );
    
            // Initial geolocation check
            updateLocationAndCheck();
    
            // Set interval to check every 10 seconds
            const interval = setInterval(() => {
                updateLocationAndCheck();
            }, 60 * 1000);
    
            // Clear interval on component unmount
            return () => clearInterval(interval);
        } else {
            console.log(
                `Waiting for employeeId and assignedProjects. employeeId: ${employeeId}, assignedProjects: ${assignedProjects.length}`
            );
        }
    }, [employeeId, assignedProjects]);

    // Start geofence checks when the trigger is activated
    useEffect(() => {
        if (triggerCheck && employeeId && assignedProjects.length > 0) {
            console.log("Trigger activated: Starting geofence checks.");

            // Initial geolocation check
            updateLocationAndCheck();

            // Set interval for geofence checks
            const interval = setInterval(updateLocationAndCheck, 60 * 1000);

            // Clear interval on component unmount
            return () => clearInterval(interval);
        } else if (triggerCheck) {
            console.warn(
                "Trigger activated, but prerequisites are not met. Waiting for employeeId and assignedProjects."
            );
        }
    }, [triggerCheck, employeeId, assignedProjects]);


    const fetchNotifications = () => {
        api.get("/api/notifications/")
            .then((res) => {
                console.log("Fetched notifications:", res.data);
                setNotifications(res.data);
            })
            .catch((err) => alert(`Error fetching notifications: ${err.message}`));
    };

    const getProjects = (employeeId) => {
        api
            .get("/api/projects/")
            .then((res) => {
                console.log("Full projects response from API:", res.data);
                setProjects(res.data);
                calculateStatusSummary(res.data);
    
                const assigned = res.data.filter((project) => {
                    console.log(
                        `Project details: ${JSON.stringify(project)}`
                    );
                    console.log(
                        `Comparing assign_employee (${typeof project.assign_employee}, value: '${project.assign_employee}') with employeeId (${typeof employeeId}, value: '${employeeId}')`
                    );
    
                    return (
                        String(project.assign_employee).trim() === String(employeeId).trim() &&
                        project.status === "ongoing"
                    );
                });
    
                console.log("Filtered assigned projects:", assigned);
                setAssignedProjects(assigned);
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

    // Function to calculate if the user is inside the geofence
    const isInsideGeofence = (lat, lng, centerLat, centerLng, radius) => {
        console.log("Checking geofence for coordinates:", { lat, lng, centerLat, centerLng, radius }); // Log geofence check
        const earthRadius = 6371; // Earth's radius in kilometers
        const dLat = (centerLat - lat) * (Math.PI / 180);
        const dLng = (centerLng - lng) * (Math.PI / 180);

        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(lat * (Math.PI / 180)) * Math.cos(centerLat * (Math.PI / 180)) *
                  Math.sin(dLng / 2) * Math.sin(dLng / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = earthRadius * c;

        console.log("Calculated distance:", distance); // Log calculated distance
        return distance <= radius; // Returns true if within geofence radius
    };

     // Check geofence and send notification if the user is logged in and assigned to an ongoing project
     const checkGeofenceAtTimeIn = (latitude, longitude) => {
        const currentTime = new Date();
        console.log("Checking geofence for current time:", currentTime); // Log current time
    
        assignedProjects.forEach((project) => {
            const projectTimeIn = new Date(project.time_in); // Convert project.time_in to Date object
            console.log("Checking project time_in:", projectTimeIn, "for project:", project.project_name); // Log project time_in
    
            // Extract hours and minutes for comparison
            const currentHoursMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
            const projectHoursMinutes = projectTimeIn.getHours() * 60 + projectTimeIn.getMinutes();
    
            // Check if the current time is equal to or greater than project time_in
            if (currentHoursMinutes >= projectHoursMinutes) {
                console.log("Time matches or exceeds for project:", project.project_name); // Log matching time
    
                const isInside = isInsideGeofence(
                    latitude,
                    longitude,
                    project.location.latitude,
                    project.location.longitude,
                    geofenceRadius
                );
    
                const message = isInside
                    ? `User ${userName} is inside the geofence for project "${project.project_name}".`
                    : `User ${userName} is outside the geofence for project "${project.project_name}".`;
    
                console.log("Geofence validation result for project:", project.project_name, "Message:", message); // Log result
                sendNotificationToAdminsAndUsers(message); // Notify admins and assigned user
            } else {
                console.log(
                    `Time does not match for project: ${project.project_name}. Current time: ${currentHoursMinutes} minutes, Project time_in: ${projectHoursMinutes} minutes`
                ); // Log mismatch
            }
        });
    };
    
    


     // Send notification to admins and assigned user
     const sendNotificationToAdminsAndUsers = (message) => {
        const fullMessage = `${userName}: ${message}`; // Add user's name to the message
        console.log("Preparing to send notification:", fullMessage); // Log notification message
        setNotifications((prev) => [...prev, { message, created_at: new Date().toISOString() }]);
        setShowModal(true);

        // Save notification to backend
        api.post("/api/notifications/", { message })
            .then(() => console.log("Notification sent"))
            .catch((err) => console.error("Error sending notification:", err.message));
    };

    const saveNotificationToDatabase = (message) => {
        const fullMessage = `${userName}: ${message}`; // Add user's name to the message
        console.log("Saving notification to database:", fullMessage); // Log saving to database
        api.post('/api/notifications/', { message })
            .then((response) => {
                console.log("Notification saved to database:", response.data);
            })
            .catch(err => {
                console.error("Error saving notification:", err.response ? err.response.data : err.message);
            });
    };

    // Update user's geolocation and validate geofence
    const updateLocationAndCheck = () => {
        if (!navigator.geolocation) {
            console.error("Geolocation is not supported by this browser.");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                console.log(`Current location: Latitude ${latitude}, Longitude ${longitude}`);
                checkGeofenceAtTimeIn(latitude, longitude);
            },
            (error) => console.error("Error getting location:", error),
            { enableHighAccuracy: true }
        );
    };

    // const handleTriggerActivation = () => {

    //     console.log("Attempting to activate geofence trigger...");
    //     console.log("Current employeeId:", employeeId);
    //     console.log("Assigned projects:", assignedProjects);

    //     if (!employeeId || assignedProjects.length === 0) {
    //         alert("Cannot start geofence checks: Ensure employee and projects are loaded.");
    //     } else {
    //         console.log("Triggering geofence checks...");
    //         setTriggerCheck(true); // Activate the trigger
    //     }
    // };

    // Trigger geolocation checks only aftsetIntervaler a user gesture (e.g., clicking a button)
    const handleGeolocationCheck = () => {
        updateLocationAndCheck();
        const interval = setInterval(updateLocationAndCheck, 60 * 1000); // Check every 60 seconds
        return () => clearInterval(interval);
    };

    // Chart data configuration
    const chartData = {
        labels: ["Done", "Ongoing", "Upcoming"],
        datasets: [
            {
                label: "Projects",
                data: [statusSummary.done, statusSummary.ongoing, statusSummary.upcoming],
                backgroundColor: ["#4CAF50", "#FFC107", "#2196F3"], // Green, Yellow, Blue
                borderColor: ["#388E3C", "#FFA000", "#1976D2"],
                borderWidth: 1,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: { display: true, position: "top" },
            title: { display: true, text: "Project Status Overview" },
        },
        scales: {
            y: { beginAtZero: true },
        },
    };

    // Triggered when the user wants to create a new project
    const handleCreateProject = () => {
        if (isSuperUser) {
            navigate("/create-project");
        }
    };

    const handleViewProjectMap = () => {
        navigate("/view-project")
    };

    return (
        <div className="home-container">
            <Navbar />
            <div className="bell-icon-container">
                <span className="bell-icon" onClick={() => setShowModal(true)}>
                    <i className="fa fa-bell"></i>
                    {notifications.length > 0 && <span className="notification-count">{notifications.length}</span>}
                </span>
            </div>
            <h2>Dashboard</h2>
            {/* <button onClick={handleTriggerActivation} disabled={triggerCheck}>
                {triggerCheck ? "Geofence Checks Running" : "Start Geofence Checks"}
            </button> */}
            
                <div className="status-summary">
                    <p className="statuscode-done"><strong>Done:</strong> {statusSummary.done}</p>
                    <p className="statuscode-ongoing"><strong>Ongoing:</strong> {statusSummary.ongoing}</p>
                    <p className="statuscode-upcoming"><strong>Upcoming:</strong> {statusSummary.upcoming}</p>
                </div>
            <div className="dashboard-content">
    
                <div className="projects-summary">
                    {projects.length > 0 ? (
                        projects.map((project) => (
                            <div key={project.id} className={`project-summary ${project.status}`}>
                                <Link to={`/detail-project/${project.id}`} className="project-link">
                                    <div className="project-details">
                                        <h4>{project.project_name}</h4>
                                        <p>Start Date: {project.project_start}</p>
                                        <p>End Date: {project.project_end}</p>
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

                {/* Bar Chart */}
                <div className="chart-container" style={{ width: "80%", margin: "0 auto" }}>
                    <div className="bar-graph">
                        <Bar data={chartData} options={chartOptions} />
                    </div>

                    
                    <div className="button-group">
                        {isSuperUser && (
                            <button onClick={handleCreateProject} className="button project-create-btn">
                                Create Project
                            </button>
                        )}
                        <button onClick={handleViewProjectMap} className="button view-map-btn">
                            View Map
                        </button>
                    </div>
                    
                </div>

                
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
