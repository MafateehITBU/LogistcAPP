import { useEffect, useState } from "react";
import socket from "../Socket";
import { parseISO } from "date-fns";

// Helper function to calculate time difference
const timeAgo = (date) => {
    if (!date) return "Unknown time";

    const createdAt = parseISO(date);
    if (isNaN(createdAt)) return "Invalid date";

    const now = new Date();
    const timeDifference = now - createdAt;

    const seconds = Math.floor(timeDifference / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return "Just now";
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    return `${days} day${days > 1 ? "s" : ""} ago`;
};

const TicketNotification = () => {
    const [notifications, setNotifications] = useState([]);
    const [count, setCount] = useState(0);

    // Load notifications from localStorage on mount
    useEffect(() => {
        const storedNotifications = JSON.parse(localStorage.getItem("ticketNotifications")) || [];

        const validatedNotifications = storedNotifications.map(notif => ({
            ...notif,
            createdAt: notif.createdAt || new Date().toISOString()
        }));

        setNotifications(validatedNotifications);
        setCount(validatedNotifications.length);
    }, []);

    // Play notification sound function
    const playNotificationSound = () => {
        const audio = new Audio("/notification.mp3");
        audio.play().catch((err) => console.error("Error playing sound:", err));
    };

    // Listen for new notifications
    useEffect(() => {
        socket.on("newTicket", (ticket) => {
            const updatedNotifications = [ticket, ...notifications];
            setNotifications(updatedNotifications);
            setCount(updatedNotifications.length);
            localStorage.setItem("ticketNotifications", JSON.stringify(updatedNotifications));

            playNotificationSound();
        });

        return () => {
            socket.off("newTicket");
        };
    }, [notifications]);

    // Update timeAgo dynamically every second
    useEffect(() => {
        const intervalId = setInterval(() => {
            setNotifications((prevNotifications) =>
                prevNotifications.map((notif) => ({
                    ...notif,
                    timeAgo: timeAgo(notif.createdAt),
                }))
            );
        }, 1000);

        return () => clearInterval(intervalId);
    }, []);

    // Function to remove a notification when clicked
    const handleNotificationClick = (index) => {
        const updatedNotifications = notifications.filter((_, i) => i !== index);
        setNotifications(updatedNotifications);
        setCount(updatedNotifications.length);
        localStorage.setItem("ticketNotifications", JSON.stringify(updatedNotifications)); // Update localStorage
    };

    return (
        <li className="nav-item topbar-icon dropdown hidden-caret">
            <a
                className="nav-link dropdown-toggle"
                href="#"
                id="notifDropdown"
                role="button"
                data-bs-toggle="dropdown"
                aria-haspopup="true"
                aria-expanded="false"
            >
                <i className="fa fa-envelope"></i>
                {count > 0 && <span className="notification">{count}</span>}
            </a>
            <ul
                className="dropdown-menu notif-box animated fadeIn"
                aria-labelledby="notifDropdown"
            >
                <li>
                    <div className="dropdown-title">
                        You have {count} new notifications
                    </div>
                </li>
                <li>
                    <div className="notif-scroll scrollbar-outer">
                        <div className="notif-center">
                            {notifications.map((notif, index) => (
                                <a
                                    href="/tickets"
                                    key={index}
                                    onClick={() => handleNotificationClick(index)}
                                >
                                    <div className="notif-icon notif-primary">
                                        <i className="fa-solid fa-ticket"></i>
                                    </div>
                                    <div className="notif-content">
                                        <span className="block">{notif.message}</span>
                                        <span className="time">
                                            {notif.timeAgo || timeAgo(notif.createdAt)}
                                        </span>
                                    </div>
                                </a>
                            ))}
                        </div>
                    </div>
                </li>
            </ul>
        </li>
    );
};

export default TicketNotification;