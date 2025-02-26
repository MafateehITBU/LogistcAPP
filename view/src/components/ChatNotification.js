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

const ChatNotification = () => {
    const [notifications, setNotifications] = useState([]);
    const [count, setCount] = useState(0);

    // Load notifications from localStorage on mount
    useEffect(() => {
        const storedNotifications = JSON.parse(localStorage.getItem("chatNotifications")) || [];
        setNotifications(storedNotifications);
        setCount(storedNotifications.length);
    }, []);

    // Function to play notification sound
    const playNotificationSound = () => {
        const audio = new Audio("/notification.mp3");
        audio.play().catch((err) => console.error("Error playing sound:", err));
    };

    // Listen for new message notifications
    useEffect(() => {
        socket.on("newMessage", (newMessage) => {
            if (newMessage.message.senderModel !== "Admin") {
                // Remove old notification if conversationId already exists
                const updatedNotifications = notifications.filter(
                    (notif) => notif.conversation !== newMessage.conversation
                );

                // Add new notification at the top
                updatedNotifications.unshift(newMessage);

                // Update state and localStorage
                setNotifications(updatedNotifications);
                setCount(updatedNotifications.length);
                localStorage.setItem("chatNotifications", JSON.stringify(updatedNotifications));

                playNotificationSound();
            }
        });

        return () => {
            socket.off("newMessage");
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
        localStorage.setItem("chatNotifications", JSON.stringify(updatedNotifications)); // Update localStorage
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
                className="dropdown-menu messages-notif-box animated fadeIn"
                aria-labelledby="messageDropdown"
            >
                <li>
                    <div className="dropdown-title">
                        You have {count} new messages
                    </div>
                </li>
                <li>
                    <div className="message-notif-scroll scrollbar-outer">
                        <div className="notif-center">
                            {notifications.map((notif, index) => (
                                <a
                                    href="/chats"
                                    key={index}
                                    onClick={() => handleNotificationClick(index)}
                                >
                                    <div className="notif-img">
                                        <img
                                            src={notif.profilePicture || "/default-avatar.png"}
                                            alt="Img Profile"
                                        />
                                    </div>
                                    <div className="notif-content">
                                        <span className="subject">{notif.senderName}</span>
                                        <span className="block"> {notif.message.text} </span>
                                        <span className="time">{timeAgo(notif.createdAt)}</span>
                                    </div>
                                </a>
                            ))}
                        </div>
                    </div>
                </li>
                <li>
                    <a className="see-all" href="/chats">
                        See all messages <i className="fa fa-angle-right"></i>
                    </a>
                </li>
            </ul>
        </li>
    );
};

export default ChatNotification;