import { useState, useEffect } from "react";
import api from "../../api";
import "../../styles/task/view_task.css";
import Navbar from "../Navbar";
import { Link, useParams, useNavigate } from "react-router-dom";

function TaskList() {
    const { id } = useParams();  // Project ID from the URL
    const [tasks, setTasks] = useState([]);
    const [projectName, setProjectName] = useState("");
    const navigate = useNavigate();
    const [isSuperUser, setIsSuperUser] = useState(false);

    // Fetch project details and tasks when the project ID changes
    useEffect(() => {
        if (id) {
            fetchProjectDetails();
            fetchTasksByProjectID(id);
            fetchUserDetails();
        }
    }, [id]);

    // Fetch user details
    const fetchUserDetails = () => {
        api
            .get("/api/user/")
            .then((res) => {
                setIsSuperUser(res.data.is_superuser);
            })
            .catch((err) => alert(`Error: ${err.message}`));
    };

    // Fetch project details to display project name
    const fetchProjectDetails = () => {
        api.get(`/api/projects/${id}/`)
            .then((res) => {
                setProjectName(res.data.project_name);
            })
            .catch((err) => alert(`Error fetching project details: ${err.message}`));
    };

    // Fetch tasks based on project ID
    const fetchTasksByProjectID = (projectId) => {
        let endpoint = `/api/projects/${projectId}/tasks/`;
    
        api.get(endpoint)
            .then((res) => {
                const filteredTasks = res.data.filter((task) => task.project === parseInt(projectId)); // Filter tasks by project ID
                setTasks(filteredTasks);  // Set the tasks for the given project
            })
            .catch((err) => alert(`Error fetching tasks: ${err.message}`));
    };

    const deleteTask = (taskId) => {
        api.delete(`/api/task/${taskId}/`)
            .then(() => {
                setTasks(tasks.filter((task) => task.id !== taskId));
                alert("Task deleted successfully");
            })
            .catch((err) => alert(`Error deleting task: ${err.message}`));
    };

    const getStatusClassName = (status) => {
        if (status === "pending") return "status-pending";
        if (status === "ongoing") return "status-ongoing";
        if (status === "done") return "status-completed";
        return "";
    };

    return (
        <div className="tasklist-container">
            <Navbar />
            <h2 className="project-title">Tasks for Project: {projectName}</h2>
            
            

            <div className="tasks-summary">
                {tasks.length > 0 ? (
                    tasks.map((task) => (
                        <div key={task.id} className="task-card">
                            <Link to={`/detail-task/${task.id}`} className="task-link">
                                <div className="task-details">
                                    <h3>{task.task_name}</h3>
                                    <p className="task-description">{task.remarks}</p>
                                    <p className="task-date"><strong>Start:</strong> {task.task_duration_start}</p>
                                    <p className="task-date"><strong>End:</strong> {task.task_duration_end}</p>
                                    {task.file_attachment && (
                                        <p><strong>Attachment:</strong> 
                                            <a href={task.file_attachment} target="_blank" rel="noopener noreferrer">View File</a>
                                        </p>
                                    )}
                                    <div className={`task-status ${getStatusClassName(task.status)}`}>
                                        <p>{task.status}</p>
                                    </div>
                                </div>
                            </Link>
                            {!isSuperUser && (
                                <div className="task-actions">
                                    <button onClick={() => navigate(`/update-task/${task.id}`)} className="update-btn">Update</button>
                                    <button onClick={() => deleteTask(task.id)} className="delete-btn">Delete</button>
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <p>No tasks available for this project.</p>
                )}
                {/* Add Task Button */}
                <div className="add-task-container">
                    <button className="add-task-btn" onClick={() => navigate(`/task/${id}/create`)}>Add Task</button>
                </div>
            </div>
        </div>
    );    
}

export default TaskList;
