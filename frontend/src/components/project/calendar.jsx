import React, { useEffect, useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import api from "../../api";
import "../../styles/project/calendar.css";
import Navbar from "../../components/Navbar";
import NotificationModal from "../../components/NotificationModal";

const localizer = momentLocalizer(moment);

function ProjectCalendar() {
    const [projects, setProjects] = useState([]);
    const [events, setEvents] = useState([]);
    const [statusSummary, setStatusSummary] = useState({
        done: 0,
        ongoing: 0,
        upcoming: 0,
    });
    const [notifications, setNotifications] = useState([]);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        api.get("/api/projects/")
            .then((response) => {
                const projects = response.data;

                const events = projects.map((project) => {
                    return {
                        title: project.project_name,
                        start: new Date(project.project_start),
                        end: new Date(project.project_end),
                        allDay: true,
                        status: project.status
                    };
                });

                setEvents(events);
            })
            .catch((err) => console.error(err));

        fetchNotifications();
    }, []);

    const fetchNotifications = () => {
        api.get("/api/notifications/")
            .then((res) => {
                setNotifications(res.data);
            })
            .catch((err) => console.error(`Error fetching notifications: ${err.message}`));
    };

    const eventStyleGetter = (event) => {
        let backgroundColor;
        switch (event.status) {
            case "ongoing":
                backgroundColor = "#FFD700";
                break;
            case "done":
                backgroundColor = "#4CAF50";
                break;
            case "upcoming":
                backgroundColor = "#1E90FF";
                break;
            default:
                backgroundColor = "#888";
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
            <div className="bell-icon-container">
                <span className="bell-icon" onClick={() => setShowModal(true)}>
                    <i className="fa fa-bell"></i>
                    {notifications.length > 0 && <span className="notification-count">{notifications.length}</span>}
                </span>
            </div>
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

            {showModal && (
                <NotificationModal 
                    notifications={notifications} 
                    onClose={() => setShowModal(false)} 
                />
            )}
        </div>
    );
}

export default ProjectCalendar;
