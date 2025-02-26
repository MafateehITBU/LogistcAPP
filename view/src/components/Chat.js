import React, { useEffect, useState, useContext } from "react";
import axiosInstance from "../axiosConfig";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { SocketContext } from '../App';

const Chat = () => {
    const [chats, setChats] = useState([]);
    const [messages, setMessages] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [adminId, setAdminId] = useState(null);
    const [messageText, setMessageText] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const socket = useContext(SocketContext); //get the global socket

    useEffect(() => {
        const token = Cookies.get("jwt");
        if (token) {
            const decoded = jwtDecode(token);
            setAdminId(decoded.id);
        }
    }, []);

    useEffect(() => {
        if (adminId) {
            fetchChats();
        }
    }, [adminId]);

    useEffect(() => {
        if (!socket) return;

        const handleNewMessage = (newMessage) => {
            setMessages((prev) => [...prev, newMessage.message]);

            if (newMessage.conversation === selectedChat) {
                markMessageAsRead(selectedChat);
            } else {
                console.log("Message does NOT belong to the open chat. Ignoring...");
            }
        };

        socket.on("newMessage", handleNewMessage);

        return () => {
            socket.off("newMessage", handleNewMessage);
        };
    }, [socket, selectedChat]);

    const markMessageAsRead = async (chatId) => {
        try {
            if (!chatId) return;
            await axiosInstance.put(`/chat/${chatId}/mark-read`);

            // Update chat list to reflect the message as read
            setChats((prevChats) =>
                prevChats.map((chat) =>
                    chat._id === chatId
                        ? { ...chat, lastMessage: { ...chat.lastMessage, read: true } }
                        : chat
                )
            );
        } catch (error) {
            console.error("Error marking message as read:", error);
        }
    };

    const fetchChats = async () => {
        try {
            if (!adminId) return;
            const response = await axiosInstance.get(`/chat/user/${adminId}`);
            setChats(response.data);
        } catch (e) {
            console.error("Error fetching chats:", e);
        }
    };

    const fetchMessages = async (conversationId, user) => {
        try {
            // Fetch messages for the selected chat
            const response = await axiosInstance.get(`/chat/${conversationId}/messages`);
            setMessages(response.data);
            setSelectedChat(conversationId);
            setSelectedUser(user);

            // Mark the last message as read
            await axiosInstance.put(`/chat/${conversationId}/mark-read`);

            // Update chat list to reflect the change
            setChats(prevChats =>
                prevChats.map(chat =>
                    chat._id === conversationId
                        ? { ...chat, lastMessage: { ...chat.lastMessage, read: true } }
                        : chat
                )
            );

        } catch (e) {
            console.error("Error fetching messages:", e);
        }
    };

    const sendMessage = async () => {
        if (!messageText.trim() || !selectedChat || !selectedUser) return;

        const messageData = {
            senderId: adminId,
            senderModel: "Admin",
            receiverId: selectedUser._id,
            receiverModel: "User", //Change this
            text: messageText.trim(),
        };

        try {
            const response = await axiosInstance.post("/chat/send", messageData);
            setMessageText(""); // Clear input field
        } catch (e) {
            console.error("Error sending message:", e);
        }
    };

    return (
        <div className="container" style={{ marginTop: "75px", marginBottom: "-10px" }}>
            <div className="page-inner">
                <div className="row clearfix">
                    <div className="col-lg-12">
                        <div className="card chat-app">
                            {/* Chat List */}
                            <div id="plist" className="people-list">
                                {/* Search Bar */}
                                <div className="input-group">
                                    <div className="input-group-prepend">
                                        <span className="input-group-text" style={{ height: "33px" }}>
                                            <i className="fa fa-search"></i>
                                        </span>
                                    </div>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Search..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
                                    />
                                </div>
                                {/* Chat List */}
                                <ul className="list-unstyled chat-list mt-2 mb-0">
                                    {chats
                                        .filter(chat => {
                                            const otherParticipant = chat.participants.find(p => p._id !== adminId);
                                            return otherParticipant?.name?.toLowerCase().includes(searchTerm);
                                        })
                                        .map((chat) => {
                                            const otherParticipant = chat.participants.find(p => p._id !== adminId);
                                            return (
                                                <li
                                                    key={chat._id}
                                                    className={`clearfix ${chat.lastMessage?.read === false ? "active" : ""}`}
                                                    onClick={() => fetchMessages(chat._id, otherParticipant)}
                                                >
                                                    <img
                                                        src={otherParticipant?.profilePicture || "https://bootdey.com/img/Content/avatar/avatar1.png"}
                                                        alt="avatar"
                                                    />
                                                    <div className="about d-flex justify-content-between" style={{ width: "70%" }}>
                                                        <div className="name">{otherParticipant?.name || "Unknown"}</div>
                                                        <div className="status">
                                                            {chat.lastMessage?.read === false && <i className="fa fa-circle online"></i>}
                                                        </div>
                                                    </div>
                                                </li>
                                            );
                                        })}
                                </ul>
                            </div>

                            {/* Chat Window */}
                            <div className="chat">
                                {/* Chat Header */}
                                <div className="chat-header clearfix">
                                    <div className="row">
                                        <div className="col-lg-6">
                                            {selectedUser ? (
                                                <>
                                                    <img
                                                        src={selectedUser?.profilePicture || "https://bootdey.com/img/Content/avatar/avatar2.png"}
                                                        alt="avatar"
                                                    />
                                                    <div className="chat-about">
                                                        <h5 className="m-b-0">{selectedUser?.name}</h5>
                                                    </div>
                                                </>
                                            ) : (
                                                <h5 className="m-b-0">Select a conversation</h5>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Chat Messages */}
                                <div className="chat-history"
                                    style={{}}>
                                    <ul className="m-b-0">
                                        {selectedChat ? (
                                            messages.map((msg) => (
                                                <li className={msg.sender === adminId ? "clearfix text-right" : "clearfix"} key={msg._id}>
                                                    <div className="message-data">
                                                        <span className="message-data-time">
                                                            {new Date(msg.createdAt).toLocaleTimeString('en-US', {
                                                                hour: '2-digit',
                                                                minute: '2-digit',
                                                                hour12: true
                                                            })}
                                                        </span>
                                                    </div>
                                                    <div className={msg.sender === adminId ? "message other-message float-right" : "message my-message"}>
                                                        {msg.text}
                                                    </div>
                                                </li>
                                            ))
                                        ) : (
                                            <div className="chat-placeholder">Select a conversation to view messages</div>
                                        )}
                                    </ul>
                                </div>


                                {/* Message Input */}
                                <div className="chat-message clearfix">
                                    <div className="input-group mb-0">
                                        <div className="input-group-prepend">
                                            <span className="input-group-text" style={{ height: "33px", cursor: "pointer" }} onClick={sendMessage}>
                                                <i className="fa fa-send"></i>
                                            </span>
                                        </div>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Enter text here..."
                                            value={messageText}
                                            onChange={(e) => setMessageText(e.target.value)}
                                            onKeyPress={(e) => e.key === "Enter" && sendMessage()} // Send message on Enter key
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Chat;