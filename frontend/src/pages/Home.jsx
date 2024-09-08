import { useState, useEffect } from "react";
import api from "../api";
import "../styles/Home.css";
import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";

function Home() {
    const [projects, setProjects] = useState([]); // State for projects
    const [statusSummary, setStatusSummary] = useState({
        done: 0,
        ongoing: 0,
        upcoming: 0,
    }); // State for status summary

    useEffect(() => {
        getProjects(); // Fetch projects on component mount
    }, []);

    const getProjects = () => {
        api
            .get("/api/projects/")
            .then((res) => res.data)
            .then((data) => {
                setProjects(data);
                calculateStatusSummary(data); // Calculate the status summary
            })
            .catch((err) => alert(err));
    };

    const calculateStatusSummary = (projects) => {
        const summary = { done: 0, ongoing: 0, upcoming: 0 };

        projects.forEach((project) => {
            if (project.status === "done") {
                summary.done += 1;
            } else if (project.status === "ongoing") {
                summary.ongoing += 1;
            } else if (project.status === "upcoming") {
                summary.upcoming += 1;
            }
        });

        setStatusSummary(summary);
    };

    const getStatusClassName = (status) => {
        if (status === "done") return "status-done";
        if (status === "ongoing") return "status-ongoing";
        if (status === "upcoming") return "status-upcoming";
        return "";
    };

    return (
        <div>
            <Navbar />
            <div className="home-container">
                <h2>Projects Summary</h2>
                <div className="status-summary">
                    <p className="statuscode-done"><strong>Done:</strong> {statusSummary.done}</p>
                    <p className="statuscode-ongoing"><strong>Ongoing:</strong> {statusSummary.ongoing}</p>
                    <p className="statuscode-upcoming"><strong>Upcoming:</strong> {statusSummary.upcoming}</p>
                </div>
                <div className="projects-summary">
                    {projects.length > 0 ? (
                        projects.map((project) => (
                            <div key={project.id} className="project-summary">
                                <Link to={`/detail-project/${project.id}`} className="project-link">
                                    <div className={`project-details ${getStatusClassName(project.status)}`}>
                                        <h3>{project.project_name}</h3>
                                        <p><strong>Start Date:</strong> {project.project_start}</p>
                                        <p><strong>End Date:</strong> {project.project_end}</p>
                                    </div>
                                    <div className={`project-status ${getStatusClassName(project.status)}`}>
                                        <p>{project.status}</p>
                                    </div>
                                </Link>
                            </div>
                        ))
                    ) : (
                        <p>No projects available.</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Home;
