import React, { useEffect, useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import api from "../../api";
import "../../styles/project/calendar.css";
import Navbar from "../../components/Navbar";

const localizer = momentLocalizer(moment);

function ProjectCalendar() {
    const [projects, setProjects] = useState([]); // State for projects
    const [events, setEvents] = useState([]);
    const [statusSummary, setStatusSummary] = useState({
        done: 0,
        ongoing: 0,
        upcoming: 0,
    }); // State for status summary

    useEffect(() => {
        // Fetch the projects and convert them to calendar events
        api.get("/api/projects/")
            .then((response) => {
                const projects = response.data;

                const events = projects.map((project) => {
                    return {
                        title: project.project_name,
                        start: new Date(project.project_start),
                        end: new Date(project.project_end),
                        allDay: true,
                        status: project.status // Assuming you have a status field
                    };
                });

                setEvents(events);
            })
            .catch((err) => console.error(err));
    }, []);

    // Customizing event colors based on project status
    const eventStyleGetter = (event) => {
        let backgroundColor;
        switch (event.status) {
            case "ongoing":
                backgroundColor = "#FFD700"; // yellow
                break;
            case "done":
                backgroundColor = "#4CAF50"; // green
                break;
            case "upcoming":
                backgroundColor = "#1E90FF"; // blue
                break;
            default:
                backgroundColor = "#888"; // grey
        }

        return {
            style: {
                backgroundColor,
                borderRadius: "5px",
                opacity: 0.8,
                color: "white",
                border: "0px",
                display: "block",
            },
        };
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = () => {
        api
            .get("/api/projects/")
            .then((res) => setProjects(res.data))
            .catch((err) => alert(`Error: ${err.message}`));
    };

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


    return (
        <div>
            <Navbar />
            <div className="calendar-container">
                <h2>Calendar</h2>
                <div className="status-summary">
                    <p className="statuscode-done"><strong>Done:</strong> {statusSummary.done}</p>
                    <p className="statuscode-ongoing"><strong>Ongoing:</strong> {statusSummary.ongoing}</p>
                    <p className="statuscode-upcoming"><strong>Upcoming:</strong> {statusSummary.upcoming}</p>
                </div>
                <Calendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: 500 }}
                    eventPropGetter={eventStyleGetter}
                />
            </div>
        </div>
    );
}

export default ProjectCalendar;
