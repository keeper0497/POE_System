import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";  // Import useNavigate
import api from "../../api";
import "../../styles/project/create.css";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap, ZoomControl } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import Navbar from "../../components/Navbar";

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
        showMarker: false,
        showPopup: true,
        zoom: 20,
        retainZoomLevel: false,
        searchLabel: "Enter address",
      });
  
      map.addControl(searchControl);
      return () => map.removeControl(searchControl);
    }, [map]);
  
    return null;
  };
  

function CreateProject() {
    const [formData, setFormData] = useState({
        project_name: "",
        project_start: "",
        project_end: "",
        assign_employee: "",
        time_in: "",
        time_out:"",
        status: "upcoming", // default value
        address: "",
    });
    const [location, setLocation] = useState(null);
    const [projects, setProjects] = useState([]);
    const [statusSummary, setStatusSummary] = useState({
        done: 0,
        ongoing: 0,
        upcoming: 0,
    });
    const [employees, setEmployees] = useState([]);  // State for employees
    const [currentUser, setCurrentUser] = useState(null);  // Track current user
    const [notifications, setNotifications] = useState([]); // Notifications state
    const [showModal, setShowModal] = useState(false); // Modal visibility state
    const navigate = useNavigate();  // Initialize useNavigate hook

    useEffect(() => {
        fetchEmployees();  // Fetch employees when component mounts
        fetchProjects();    // Fetch projects
        fetchCurrentUser(); // Fetch current user information
        fetchNotifications(); // Fetch notifications
    }, []);

    // Fetch users/employees from the API
    const fetchEmployees = () => {
        api.get("/api/users/") // Assuming your API endpoint for fetching users
        .then((res) => {
            // Filter out superusers
            const nonSuperusers = res.data.filter(
                (employee) => !employee.is_superuser && employee.id !== 1
            );
            setEmployees(nonSuperusers);
        })
        .catch((err) => alert(`Error: ${err.message}`));
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

    // Fetch current user information
    const fetchCurrentUser = () => {
        api.get("/api/user/")  // Assuming your API endpoint for fetching current user
            .then((res) => setCurrentUser(res.data))
            .catch((err) => console.error("Error fetching user:", err.message));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleModalToggle = () => {
        setShowModal(!showModal);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

         // Validate required fields
        if (!formData.project_name || !formData.project_start || !formData.project_end || !formData.assign_employee) {
            alert("Please fill in all required fields.");
            return;
        }

        if (!formData.time_in || !formData.time_out) {
            alert("Please provide both Time In and Time Out.");
            return;
        }

        if (!location) {
            alert("Please select a location on the map.");
            return;
        }
    
        // Prepare data payload
        const data = {
            ...formData,
            location: location ? { latitude: location.lat, longitude: location.lng } : null,
        };
    
        // Send the data to the backend API
        api.post("/api/projects/", data)
            .then((res) => {
                if (res.status === 201) {
                    alert("Project created successfully!");
    
                    // Reset form fields
                    setFormData({
                        project_name: "",
                        project_start: "",
                        project_end: "",
                        time_in: "",
                        time_out: "",
                        assign_employee: "",
                        status: "upcoming", // Reset to default
                        address: "",
                    });
                    setLocation(null);
    
                    // Send notification to assigned employee (exclude the admin)
                    if (formData.assign_employee !== currentUser.id) {
                        sendNotificationToEmployee(formData.assign_employee, formData.project_name);
                    }
    
                    // Redirect to the Home page after project creation
                    navigate("/");
                } else {
                    alert("Failed to create project.");
                }
            })
            .catch((err) => {
                alert(`Error: ${err.response?.data?.detail || err.message}`);
            });
    };

    const sendNotificationToEmployee = (employeeId, projectName) => {
        // Only send notification to the assigned employee, not to the admin
        if (employeeId) {
            const message = `You have been assigned to the project: ${projectName}`;
            api.post('/api/notifications/', { user: employeeId, message })
                .then((response) => {
                    console.log("Notification sent to employee:", response.data);
                })
                .catch((err) => {
                    console.error("Error sending notification:", err.response ? err.response.data : err.message);
                });
        }
    };

    function LocationMarker() {
        useMapEvents({
            click(e) {
                setLocation(e.latlng);
                getAddressFromCoordinates(e.latlng.lat, e.latlng.lng); // Fetch address on marker placement
            },
        });

        return location ? <Marker position={location}></Marker> : null;
    }

    const fetchProjects = () => {
        api
            .get("/api/projects/")
            .then((res) => setProjects(res.data))
            .catch((err) => alert(`Error: ${err.message}`));
    };

    // Function to fetch address using reverse geocoding
    const getAddressFromCoordinates = async (lat, lng) => {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
            );
            const data = await response.json();
            if (data && data.display_name) {
                setFormData((prevState) => ({
                    ...prevState,
                    address: data.display_name,
                }));
            }
        } catch (error) {
            console.error("Error fetching address:", error);
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
            <div className="create-project">
                <h2>Create Project</h2>
                {/* <div className="status-summary">
                    <p className="statuscode-done"><strong>Done:</strong> {statusSummary.done}</p>
                    <p className="statuscode-ongoing"><strong>Ongoing:</strong> {statusSummary.ongoing}</p>
                    <p className="statuscode-upcoming"><strong>Upcoming:</strong> {statusSummary.upcoming}</p>
                </div> */}
                <div className="create-form">
                    <form onSubmit={handleSubmit}>
                        <label>
                            Project Name:
                            <input
                                type="text"
                                name="project_name"
                                value={formData.project_name}
                                onChange={handleChange}
                                required
                                className="project-name"
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
                                className="project-start"
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
                                className="project-end"
                            />
                        </label>
                        <label>
                            Time In:
                            <input
                                type="time"
                                name="time_in"
                                value={formData.time_in}
                                onChange={handleChange}
                                required
                                className="time-in"
                            />
                        </label>
                        <label>
                            Time out:
                            <input
                                type="time"
                                name="time_out"
                                value={formData.time_out}
                                onChange={handleChange}
                                required
                                className="time-out"
                            />  
                        </label>
                        <label>
                            Status:
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                required
                                className="select-status"
                            >
                                <option value="ongoing">Ongoing</option>
                                <option value="done">Done</option>
                                <option value="upcoming">Upcoming</option>
                            </select>
                        </label>
                        <label>
                            Assign Employees:
                            <select
                                name="assign_employees"
                                multiple
                                value={formData.assign_employees}
                                onChange={(e) => {
                                    const options = e.target.options;
                                    const selectedValues = [];
                                    for (let i = 0; i < options.length; i++) {
                                        if (options[i].selected) {
                                            selectedValues.push(options[i].value);
                                        }
                                    }
                                    setFormData({ ...formData, assign_employees: selectedValues });
                                }}
                                required
                                className="select-employees"
                            >
                                {employees.map((employee) => (
                                    <option key={employee.id} value={employee.id}>
                                        {employee.first_name} {employee.last_name}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <label>
                            Address:
                            <input
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                required
                                className="address"
                            />
                        </label>
                        <div className="map-container">
                            <MapContainer center={[13.6051, 124.2460]} zoom={13} style={{ height: "400px" }}>
                            <SearchControl />
                                <TileLayer
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                />
                                
                                <LocationMarker />
                            </MapContainer>
                        </div>
                        <button type="submit">Create Project</button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default CreateProject;
