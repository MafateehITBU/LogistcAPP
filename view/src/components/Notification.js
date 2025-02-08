import { useEffect, useState } from "react";
import socket from "../Socket";
import { parseISO } from "date-fns";

// Helper function to calculate time difference
const timeAgo = (date) => {
    const now = new Date();
    const createdAt = parseISO(date);

    console.log("CreatedAt: ", createdAt);
    console.log("Now: ", now);

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

const Notification = () => {
    const [notifications, setNotifications] = useState([]);
    const [count, setCount] = useState(0);

    useEffect(() => {
        socket.on("newOrder", (order) => {
            setNotifications((prev) => [order, ...prev]);
            setCount((prev) => prev + 1);
        });

        return () => {
            socket.off("newOrder");
        };
    }, []);

    // Update timeAgo dynamically every second
    useEffect(() => {
        const intervalId = setInterval(() => {
            setNotifications((prevNotifications) =>
                prevNotifications.map((notif) => ({
                    ...notif,
                    timeAgo: timeAgo(notif.createdAt), // Recalculate time ago
                }))
            );
        }, 1000); // Update every second

        return () => clearInterval(intervalId); // Cleanup on component unmount
    }, []);

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
                                <a href="/orders" key={index}>
                                    <div className="notif-icon notif-primary">
                                        <i className="fa fa-shopping-cart"></i>
                                    </div>
                                    <div className="notif-content">
                                        <span className="block">
                                            {notif.message}
                                        </span>
                                        <span className="time">
                                            {notif.timeAgo || timeAgo(notif.createdAt)}
                                        </span>
                                    </div>
                                </a>
                            ))}
                        </div>
                    </div>
                </li>
                <li>
                    <a className="see-all" href="#">
                        See all notifications<i className="fa fa-angle-right"></i>
                    </a>
                </li>
            </ul>
        </li>
    );
};

export default Notification;