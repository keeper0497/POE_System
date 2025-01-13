import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from "react-router-dom";  // Import useNavigate for redirection
import api from '../../api';
import "../../styles/task/create_task.css";
import Navbar from '../../components/Navbar';

const CreateTask = ({ currentUser }) => {
  const { id } = useParams();  // Get the project ID from the URL
  const navigate = useNavigate();  // Initialize useNavigate for redirection
  const [notifications, setNotifications] = useState([]); // Notifications state
  const [showModal, setShowModal] = useState(false); // Modal visibility state
  const [formData, setFormData] = useState({
    task_name: '',
    task_duration_start: '',
    task_duration_end: '',
    file_attachment: null,
    status: 'pending',  // Default status value
    remarks: '',  // Default remarks value
  });
  const [project, setProject] = useState(null);  // To hold the project details
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch the project details to verify permissions
    const fetchProject = async () => {
      try {
        const response = await api.get(`/api/projects/${id}/`);
        setProject(response.data);
      } catch (err) {
        console.error("Error fetching project:", err);
      }
    };
    fetchProject();
  }, [id]);

  useEffect(() =>{
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

  // Check if the current user is assigned to the project
  const isUserAssigned = project && currentUser?.id === project.assign_employee.id;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, file_attachment: e.target.files[0] });
  };

  const handleModalToggle = () => {
    setShowModal(!showModal);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isUserAssigned) {
      setError("You are not authorized to add tasks to this project.");
      return;
    }

    const taskData = new FormData();
    taskData.append('task_name', formData.task_name);
    taskData.append('task_duration_start', formData.task_duration_start);
    taskData.append('task_duration_end', formData.task_duration_end);
    taskData.append('file_attachment', formData.file_attachment);
    taskData.append('status', formData.status);
    taskData.append('remarks', formData.remarks);
    taskData.append('project', id);  // Attach project ID to the task

    try {
      const response = await api.post(`/api/projects/${id}/tasks/`, taskData);
      if (response.status === 201) {
        alert('Task created successfully!');
        setError('');
        // Redirect to Task List page for the project
        navigate(`/task/${id}/list`);
      } else {
        setError('Failed to create task. Please try again.');
      }
    } catch (err) {
      setError('Error creating task. Please try again.');
      console.error(err);
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
      <div className="create-task">
        <h2>Create a New Task</h2>
        {!isUserAssigned ? (
          <p>You do not have permission to add tasks to this project.</p>
        ) : (
          <form onSubmit={handleSubmit}>
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
              Task Duration Start:
              <input
                type="date"
                name="task_duration_start"
                value={formData.task_duration_start}
                onChange={handleChange}
                required
              />
            </label>
            <label>
              Task Duration End:
              <input
                type="date"
                name="task_duration_end"
                value={formData.task_duration_end}
                onChange={handleChange}
                required
              />
            </label>
            <label>
              File Attachment:
              <input type="file" name="file_attachment" onChange={handleFileChange} />
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
                <option value="ongoing">Ongoing</option>
                <option value="done">Done</option>
              </select>
            </label>
            <label>
              Remarks:
              <textarea
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
                rows="4"
                placeholder="Enter any remarks here..."
              />
            </label>
            <button type="submit">Create Task</button>
            {error && <p className="error-message">{error}</p>}
          </form>
        )}
      </div>
    </div>
  );
};

export default CreateTask;
