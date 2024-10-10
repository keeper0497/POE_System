import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api";
import Navbar from "../../components/Navbar";
import "../../styles/project/delete.css";

function DeleteProject() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [project, setProject] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        api.get(`/api/projects/${id}/`)
            .then((response) => {
                setProject(response.data);
            })
            .catch((err) => setError(err.message));
    }, [id]);

    const handleDelete = () => {
        api.delete(`/api/projects/${id}/`)
            .then(() => {
                navigate("/"); // Redirect to home or projects list
            })
            .catch((err) => setError(err.message));
    };

    if (error) {
        return <div>Error: {error}</div>;
    }

    if (!project) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <Navbar />
            <div className="delete-project">
                <h2>Delete Project</h2>
                <p>Are you sure you want to delete the project <strong>{project.project_name}</strong>?</p>
                <button onClick={handleDelete}>Delete Project</button>
            </div>
        </div>
    );
}

export default DeleteProject;
