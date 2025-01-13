import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api";
import Navbar from "../../components/Navbar";
import "../../styles/task/update_task.css";

function UpdateTask() {
    const { id } = useParams();  // Assuming the task ID is passed in the URL
    const navigate = useNavigate();
    const [task, setTask] = useState(null);
    const [error, setError] = useState(null);
    const [isSuperUser, setIsSuperUser] = useState(null);  // Initialize as null
    const [notifications, setNotifications] = useState([]); // Notifications state
    const [showModal, setShowModal] = useState(false); // Modal visibility state
    const [formData, setFormData] = useState({
        task_name: "",
        task_duration_start: "",
        task_duration_end: "",
        remarks: "",
        status: "",
        file_attachment: null,  // Handle file upload
    });
    const [originalFile, setOriginalFile] = useState(null);  // Track the original file

    useEffect(() => {
        // Fetch task data by ID
        api.get(`/api/task/${id}/`)
            .then((response) => {
                setTask(response.data);
                setFormData({
                    task_name: response.data.task_name,
                    task_duration_start: response.data.task_duration_start,
                    task_duration_end: response.data.task_duration_end,
                    remarks: response.data.remarks,
                    status: response.data.status,
                    file_attachment: null  // Reset to null since it's a new upload
                });
                setOriginalFile(response.data.file_attachment);  // Store the original file
            })
            .catch((err) => setError(err.message));
    }, [id]);

    // Fetch user details
    const fetchUserDetails = () => {
        api
            .get("/api/user/")
            .then((res) => {
                setIsSuperUser(res.data.is_superuser);  // Set if the user is a superuser
            })
            .catch((err) => alert(`Error: ${err.message}`));
    };

    useEffect(() => {
        fetchUserDetails();  // Fetch the user details to know if the user is a superuser
        fetchNotifications(); // Fetch notifications
    }, []);

    // Fetch notifications for the current user
    const fetchNotifications = async () => {
        try {
            const response = await api.get("/api/notifications/");
            setNotifications(response.data);
        } catch (error) {
            console.error("Error fetching notifications:", error);
        }
    };


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleFileChange = (e) => {
        setFormData({ ...formData, file_attachment: e.target.files[0] });  // Update file field
    };

    const handleModalToggle = () => {
        setShowModal(!showModal);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const updatedFormData = new FormData();
        updatedFormData.append('task_name', formData.task_name);
        updatedFormData.append('task_duration_start', formData.task_duration_start);
        updatedFormData.append('task_duration_end', formData.task_duration_end);
        updatedFormData.append('remarks', formData.remarks);
        updatedFormData.append('status', formData.status);

        if (formData.file_attachment) {
            // Only append the new file if the user selects one
            updatedFormData.append('file_attachment', formData.file_attachment);
        }

        api.put(`/api/task/${id}/`, updatedFormData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        })
        .then(() => {
            navigate(`/detail-task/${id}`);
        })
        .catch((err) => setError(err.response?.data || err.message));
    };

    if (error) {
        return <div>Error: {error}</div>;
    }

    if (!task || isSuperUser === null) {
        // If task data or user role hasn't been fetched yet, show loading
        return <div>Loading...</div>;
    }

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
            <div className="update-task">
                <h2>Update Task</h2>
                <form onSubmit={handleSubmit} encType="multipart/form-data">
                    <label>
                        Task Name:
                        <input
                            type="text"
                            name="task_name"
                            value={formData.task_name}
                            onChange={handleChange}
                            required
                        />
                    </label>
                    <label>
                        Start Date:
                        <input
                            type="date"
                            name="task_duration_start"
                            value={formData.task_duration_start}
                            onChange={handleChange}
                            required
                        />
                    </label>
                    <label>
                        End Date:
                        <input
                            type="date"
                            name="task_duration_end"
                            value={formData.task_duration_end}
                            onChange={handleChange}
                            required
                        />
                    </label>
                    <label>
                        Remarks:
                        <textarea
                            name="remarks"
                            value={formData.remarks}
                            onChange={handleChange}
                        />
                    </label>
                    <label>
                        Status:
                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            required
                        >
                            <option value="pending">Pending</option>
                            <option value="in-progress">In Progress</option>
                            <option value="completed">Completed</option>
                        </select>
                    </label>
                    <label>
                        File Attachment:
                        <input
                            type="file"
                            name="file_attachment"
                            onChange={handleFileChange}
                        />
                        {originalFile && !formData.file_attachment && (
                            // Display the original file if a new file hasn't been selected
                            <p>Current file: <a href={originalFile} target="_blank" rel="noopener noreferrer">View File</a></p>
                        )}
                    </label>
                    {!isSuperUser && (
                        <button type="submit">Update Task</button>  // Only show button if not a superuser
                    )}
                </form>
            </div>
        </div>
    );
}

export default UpdateTask;
