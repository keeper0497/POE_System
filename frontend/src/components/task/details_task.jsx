import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api";
import Navbar from "../Navbar";
import "../../styles/task/details_task.css"; // Create a CSS file for styling this component

function ViewTask() {
    const { id } = useParams(); // Get the task ID from URL parameters
    const [task, setTask] = useState(null); // State to store the task details
    const [loading, setLoading] = useState(true); // Loading state
    const [isSuperUser, setIsSuperUser] = useState(null);  // Initialize as null
    const navigate = useNavigate(); // For navigation
    const [notifications, setNotifications] = useState([]); // Notifications state
    const [showModal, setShowModal] = useState(false); // Modal visibility state

    useEffect(() => {
        fetchTaskDetails(); // Fetch task details when component mounts
        fetchUserDetails();  // Fetch the user details to know if the user is a superuser
    }, [id]);

    useEffect(() => {
        fetchNotifications(); // Fetch notifications
    }, []);

     // Fetch user details
     const fetchUserDetails = () => {
        api
            .get("/api/user/")
            .then((res) => {
                setIsSuperUser(res.data.is_superuser);  // Set if the user is a superuser
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

    const handleModalToggle = () => {
        setShowModal(!showModal);
    };

    const fetchTaskDetails = () => {
        api
            .get(`/api/task/${id}/`) // Fetch task details from the API
            .then((res) => {
                setTask(res.data);
                setLoading(false);
            })
            .catch((err) => {
                alert(`Error fetching task: ${err.message}`);
                navigate("/"); // Navigate to home if there's an error
            });
    };

    const isImageFile = (fileName) => {
        const fileExtension = fileName.split('.').pop().toLowerCase();
        return ['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension);
    };

    if (loading) return <div>Loading...</div>; // Loading state

    return (
        <div className="view-task-container">
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
            <div className="task-details-box">
                <h2 className="task-title">{task.task_name}</h2> 
                <div className="task-info">
                    <p className="task-label"><strong>Description:</strong> {task.remarks}</p>
                    <p className="task-label"><strong>Start Date:</strong> {task.task_duration_start}</p>
                    <p className="task-label"><strong>End Date:</strong> {task.task_duration_end}</p>
                    <p className="task-label"><strong>Status:</strong> <span className={`status ${task.status}`}>{task.status}</span></p>
                    {task.file_attachment && (
                        <>
                            <p className="task-label"><strong>Attachment:</strong></p>
                            <div className="file-preview">
                                {/* Check if the file is an image and render it accordingly */}
                                {isImageFile(task.file_attachment) ? (
                                    <img src={task.file_attachment} alt="Preview" className="image-preview" />
                                ) : (
                                    <iframe src={task.file_attachment} width="100%" height="500px" title="File Preview"></iframe>
                                )}
                            </div>
                            <p><a href={task.file_attachment} target="_blank" rel="noopener noreferrer">View Full File</a></p>
                        </>
                    )}
                    <div className="task-actions">
                        {!isSuperUser && (
                            <button onClick={() => navigate(`/update-task/${task.id}`)} className="update-btn">
                                Update Task
                            </button>
                        )}
                        <button onClick={() => navigate("/")} className="back-btn">
                            Back to Tasks
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ViewTask;
