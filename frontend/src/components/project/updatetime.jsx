import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api";
import "../../styles/project/update-time.css"; // Create this CSS file for styling

function UpdateTimePage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [timeIn, setTimeIn] = useState("");
    const [timeOut, setTimeOut] = useState("");
    const [error, setError] = useState(null);

    useEffect(() => {
        api.get(`/api/projects/${id}/`)
            .then((response) => {
                const project = response.data;
                setTimeIn(project.time_in || "");
                setTimeOut(project.time_out || "");
            })
            .catch((err) => setError(`Error fetching project details: ${err.message}`));
    }, [id]);

    const handleUpdateTime = () => {
        api.patch(`/api/projects/${id}/`, { time_in: timeIn, time_out: timeOut })
            .then(() => navigate(`/detail-project/${id}`)) // Navigate back to project details
            .catch((err) => setError(`Error updating time: ${err.message}`));
    };

    return (
        <div className="update-time-page">
            <h2>Update Time</h2>
            {error && <p className="error">{error}</p>}
            <div className="form-group">
                <label htmlFor="timeIn">Time In:</label>
                <input
                    type="time"
                    id="timeIn"
                    value={timeIn}
                    onChange={(e) => setTimeIn(e.target.value)}
                />
            </div>
            <div className="form-group">
                <label htmlFor="timeOut">Time Out:</label>
                <input
                    type="time"
                    id="timeOut"
                    value={timeOut}
                    onChange={(e) => setTimeOut(e.target.value)}
                />
            </div>
            <button onClick={handleUpdateTime} className="btn save-btn">Save</button>
            <button onClick={() => navigate(`/detail-project/${id}`)} className="btn cancel-btn">Cancel</button>
        </div>
    );
}

export default UpdateTimePage;
