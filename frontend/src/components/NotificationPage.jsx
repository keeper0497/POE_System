import React, { useState, useEffect } from "react";
import api from "../api";
import "../styles/NotificationPage.css";
import Navbar from "../components/Navbar";

function NotificationsPage() {
    const [messages, setMessages] = useState([]); // All messages
    const [filteredMessages, setFilteredMessages] = useState([]); // Messages for selected user
    const [newMessage, setNewMessage] = useState(""); // Input for the new message
    const [loading, setLoading] = useState(true); // Loading state
    const [isAdmin, setIsAdmin] = useState(false); // Check if current user is admin
    const [currentUser, setCurrentUser] = useState(null); // Current authenticated user
    const [selectedUser, setSelectedUser] = useState(null); // User the admin is replying to
    const [adminId, setAdminId] = useState(null); // Admin user ID
    const [ws, setWs] = useState(null); // WebSocket connection
    const [allUsers, setAllUsers] = useState([]); // To store all users

    // Fetch all users
    const fetchAllUsers = async () => {
        try {
            const response = await api.get("/api/users/");
            setAllUsers(response.data); // Store the list of users
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    // Fetch the authenticated user details
    const fetchCurrentUser = () => {
        api.get("/api/user/").then((res) => {
            setCurrentUser(res.data);
            setIsAdmin(res.data.is_superuser);
        });
    };

    // Fetch admin user ID
    const fetchAdminId = () => {
        api.get("/api/admin/").then((res) => {
            setAdminId(res.data.id); // Dynamically set the admin ID
        });
    };

    // Fetch usernames for messages
    const fetchUsernames = async (messages) => {
        const updatedMessages = await Promise.all(
            messages.map(async (msg) => {
                if (!msg.sender_name) {
                    const response = await api.get(`/api/user/${msg.sender}/`);
                    return { ...msg, sender_name: response.data.username };
                }
                return msg;
            })
        );
        return updatedMessages;
    };

    // Fetch messages between the user and admin
    const fetchMessages = async () => {
        try {
            const res = await api.get("/api/messages/");
            const updatedMessages = await fetchUsernames(res.data);
            setMessages(updatedMessages);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching messages:", error);
        }
    };

    // Filter messages based on selected user
    useEffect(() => {
        if (isAdmin && selectedUser) {
            const filtered = messages.filter(
                (msg) =>
                    (msg.sender === parseInt(selectedUser) && msg.receiver === currentUser.id) ||
                    (msg.sender === currentUser.id && msg.receiver === parseInt(selectedUser))
            );
            setFilteredMessages(filtered);
        } else {
            setFilteredMessages(messages); // For normal users, show all messages
        }
    }, [messages, selectedUser, isAdmin, currentUser]);

    // Send a new message
    const sendMessage = () => {
        if (newMessage.trim() === "") return;

        const receiver = isAdmin ? selectedUser : adminId; // Use actual adminId
        if (!receiver) {
            alert("Receiver not specified");
            return;
        }

        api.post("/api/messages/", {
            sender: currentUser.id,
            receiver: receiver,
            content: newMessage,
        })
            .then((res) => {
                setNewMessage(""); // Clear the input

                // Send message via WebSocket if WebSocket is connected
                if (ws) {
                    ws.send(JSON.stringify(res.data));
                    console.log("Message sent via WebSocket:", res.data); // Log WebSocket message
                }
            })
            .catch((err) => {
                alert(`Error sending message: ${err.message}`);
            });
    };

    // Initialize WebSocket connection
    const initializeWebSocket = () => {
        if (!currentUser || (ws && ws.readyState === WebSocket.OPEN)) {
            return; // Prevent multiple WebSocket connections
        }

        // const webSocket = new WebSocket(`ws://localhost:8000/ws/notifications/${currentUser.id}/`);
        const webSocket = new WebSocket(`wss://poe-system.onrender.com/ws/notifications/${currentUser.id}/`);


        console.log(`Connecting to WebSocket at: wss://poe-system.onrender.com/ws/location/${currentUser.id}/`);

        webSocket.onopen = () => {
            console.log("WebSocket connection established");
            setWs(webSocket); // Set WebSocket only when the connection is established
        };

        webSocket.onmessage = async (event) => {
            const data = JSON.parse(event.data);
            console.log("Message received via WebSocket:", data);

            const notification = data.notification;

            const formattedMessage = {
                id: notification.id,
                sender: notification.sender,
                receiver: notification.receiver,
                content: notification.content,
                timestamp: new Date(notification.timestamp), // Convert timestamp to Date object
                sender_name: notification.sender_name || "",
                receiver_name: notification.receiver_name || "",
            };

            // Fetch sender name if not already present
            if (!formattedMessage.sender_name) {
                const response = await api.get(`/api/user/${formattedMessage.sender}/`);
                formattedMessage.sender_name = response.data.username;
            }

            // Prevent duplicate messages
            setMessages((prev) => {
                if (!prev.some((msg) => msg.id === formattedMessage.id)) {
                    return [...prev, formattedMessage];
                }
                return prev;
            });
        };

        webSocket.onerror = (error) => {
            console.error("WebSocket error:", error);
        };

        webSocket.onclose = () => {
            console.warn("WebSocket connection closed, attempting to reconnect...");
            setWs(null); // Clear the WebSocket reference
            setTimeout(() => initializeWebSocket(), 5000); // Attempt to reconnect after 5 seconds
        };
    };

    useEffect(() => {
        fetchAllUsers();
        fetchCurrentUser();
        fetchAdminId();
        fetchMessages();
    }, []);

    useEffect(() => {
        if (currentUser) {
            initializeWebSocket();
        }
    }, [currentUser]);

    if (loading) {
        return <p>Loading messages...</p>;
    }

    const getUsernameById = (userId) => {
        const user = allUsers.find((user) => user.id === userId);
        return user ? user.first_name : `User ${userId}`; // Fallback if username is not found
    };

    return (
        <div>
            <Navbar />
            <div className="messages-container">
                <h2 className="messages-header">
                    {isAdmin ? "Messages from Users" : "Messages with Admin"}
                </h2>

                {/* For Admin: User Selection */}
                {isAdmin && (
                    <div className="user-selection">
                        <label htmlFor="user-select">Select a User to Reply:</label>
                        <select
                            id="user-select"
                            value={selectedUser || ""}
                            onChange={(e) => setSelectedUser(e.target.value)}
                        >
                            <option value="">-- Select a User --</option>
                            {Array.from(
                                new Set(messages.map((msg) => (msg.sender !== currentUser.id ? msg.sender : msg.receiver)))
                            ).map((userId) => (
                                <option key={userId} value={userId}>
                                    {getUsernameById(userId)}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Messages List */}
                <div className="messages-list">
                    {filteredMessages.length === 0 ? (
                        <p className="no-messages">No messages yet</p>
                    ) : (
                        filteredMessages.map((message, index) => (
                            <div
                                key={index}
                                className={`message-row ${
                                    message.sender === currentUser.id ? "user-message-row" : "admin-message-row"
                                }`}
                            >
                                <div
                                    className={`message-card ${
                                        message.sender === currentUser.id ? "user-message" : "admin-message"
                                    }`}
                                >
                                    <p className="message-sender">
                                        {message.sender === currentUser.id
                                            ? "You"
                                            : message.sender_name || `User ${message.sender}`}
                                    </p>
                                    <p>{message.content}</p>
                                    <div className="message-timestamp">
                                        {new Date(message.timestamp).toLocaleString()}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Message Input */}
                <div className="message-input-container">
                    <input
                        type="text"
                        placeholder={
                            isAdmin
                                ? selectedUser
                                    ? "Reply to selected user..."
                                    : "Select a user to reply"
                                : "Type your message..."
                        }
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className="message-input"
                        disabled={isAdmin && !selectedUser} // Disable input if admin has not selected a user
                    />
                    <button
                        onClick={sendMessage}
                        className="send-button"
                        disabled={isAdmin && !selectedUser} // Disable button if admin has not selected a user
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
}

export default NotificationsPage;
