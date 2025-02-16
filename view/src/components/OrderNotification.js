import { useEffect, useState } from "react";
import socket from "../Socket";
import { parseISO } from "date-fns";

// Helper function to calculate time difference
const timeAgo = (date) => {
    const now = new Date();
    const createdAt = parseISO(date);

    if (isNaN(createdAt)) {
        return "Invalid date";
    }

    const timeDifference = now - createdAt;
    const seconds = Math.floor(timeDifference / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) {
        return "Just now";
    } else if (minutes < 60) {
        return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
    } else if (hours < 24) {
        return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    } else {
        return `${days} day${days > 1 ? "s" : ""} ago`;
    }
};

const OrderNotification = () => {
    const [notifications, setNotifications] = useState([]);
    const [count, setCount] = useState(0);

    // Load notifications from localStorage on mount
    useEffect(() => {
        const storedNotifications = JSON.parse(localStorage.getItem("notifications")) || [];
        setNotifications(storedNotifications);
        setCount(storedNotifications.length);
    }, []);

    // Function to play notification sound
    const playNotificationSound = () => {
        const audio = new Audio("/notification.mp3");
        audio.play().catch((err) => console.error("Error playing sound:", err));
    };

    // Listen for new order notifications
    useEffect(() => {
        socket.on("newOrder", (order) => {
            const updatedNotifications = [order, ...notifications];
            setNotifications(updatedNotifications);
            setCount(updatedNotifications.length);
            localStorage.setItem("notifications", JSON.stringify(updatedNotifications));

            playNotificationSound();
        });

        return () => {
            socket.off("newOrder");
        };
    }, [notifications]); // Dependency array ensures updates happen correctly

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
        localStorage.setItem("notifications", JSON.stringify(updatedNotifications)); // Update localStorage
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
                <i className="fa fa-bell"></i>
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
                                    href={notif.orderType === "Normal" ? "/normal-orders" : "/fast-orders"}
                                    key={index}
                                    onClick={() => handleNotificationClick(index)}
                                >
                                    <div className="notif-icon notif-primary">
                                        <i className="fa fa-shopping-cart"></i>
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

export default OrderNotification;