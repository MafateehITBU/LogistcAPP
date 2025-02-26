import React, { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import ChatNotification from './ChatNotification';
import OrderNotification from "./OrderNotification";
import TicketNotification from './TicketNotification';
import axiosInstance from '../axiosConfig';
import { useNavigate } from 'react-router-dom';

const Header = () => {
    const [admin, setAdmin] = useState({});
    const navigate = useNavigate();
    const adminRole = Cookies.get('adminRole');

    useEffect(() => {
        fetchAdmin();
    }, []);

    const fetchAdmin = async () => {
        try {
            const response = await axiosInstance.get('/admin/singleAdmin');
            setAdmin(response.data.adminInfo);
        } catch (error) {
            console.error(error);
        }
    };

    const handleProfileClick = () => {
        // Navigate to the profile page and pass admin data as state
        navigate('/profile', { state: { admin } });
    };


    const handleLoginRedirect = () => {
        // Remove jwt and role from the cookies
        Cookies.remove('jwt');
        Cookies.remove('adminRole');
    };

    return (
        <div className='main-header'>
            <nav
                className="navbar navbar-header navbar-header-transparent navbar-expand-lg border-bottom"
                style={{ backgroundColor: "#fff", padding: "10px", marginTop: "-20px" }}
            >
                <div className="container-fluid">
                    <ul className="navbar-nav topbar-nav ms-md-auto align-items-center">
                        <li
                            className="nav-item topbar-icon dropdown hidden-caret d-flex d-lg-none"
                        >
                            <a
                                className="nav-link dropdown-toggle"
                                data-bs-toggle="dropdown"
                                href="#"
                                role="button"
                                aria-expanded="false"
                                aria-haspopup="true"
                            >
                                <i className="fa fa-search"></i>
                            </a>
                        </li>
                        {/* Chat Notification */}
                        <ChatNotification />
                        {/* Ticket Notification */}
                        {(adminRole === "Admin" || adminRole === "SupportTeam") && (
                            <TicketNotification />
                        )}
                        {/* Order Notifications */}
                        {(adminRole === "Admin" || adminRole === "Dispatcher") && (
                            <OrderNotification />
                        )}
                        {/* Quick Actions */}
                        <li className="nav-item topbar-icon dropdown hidden-caret">
                            <a
                                className="nav-link"
                                data-bs-toggle="dropdown"
                                href="#"
                                aria-expanded="false"
                            >
                                <i className="fas fa-layer-group"></i>
                            </a>
                            <div className="dropdown-menu quick-actions animated fadeIn">
                                <div className="quick-actions-header">
                                    <span className="title mb-1">Quick Actions</span>
                                    <span className="subtitle op-7">Shortcuts</span>
                                </div>
                                <div className="quick-actions-scroll scrollbar-outer">
                                    <div className="quick-actions-items">
                                        <div className="row m-0">
                                            <a className="col-6 col-md-4 p-0" href="#">
                                                <div className="quick-actions-item">
                                                    <div className="avatar-item bg-info rounded-circle">
                                                        <i className="fas fa-file-excel"></i>
                                                    </div>
                                                    <span className="text">Reports</span>
                                                </div>
                                            </a>
                                            <a className="col-6 col-md-4 p-0" href="#">
                                                <div className="quick-actions-item">
                                                    <div
                                                        className="avatar-item bg-primary rounded-circle"
                                                    >
                                                        <i className="fas fa-file-invoice-dollar"></i>
                                                    </div>
                                                    <span className="text">Invoice</span>
                                                </div>
                                            </a>
                                            <a className="col-6 col-md-4 p-0" href="#">
                                                <div className="quick-actions-item">
                                                    <div
                                                        className="avatar-item bg-secondary rounded-circle"
                                                    >
                                                        <i className="fas fa-credit-card"></i>
                                                    </div>
                                                    <span className="text">Payments</span>
                                                </div>
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </li>
                        {/* Profile */}
                        <li className="nav-item topbar-user dropdown hidden-caret">
                            <a
                                className="dropdown-toggle profile-pic"
                                data-bs-toggle="dropdown"
                                href="#"
                                aria-expanded="false"
                            >
                                <div className="avatar-sm">
                                    <img
                                        src="/img/profile.jpg"
                                        alt="..."
                                        className="avatar-img rounded-circle"
                                    />
                                </div>
                                <span className="profile-username">
                                    <span className="op-7">Hi,</span>
                                    <span className="fw-bold"> {admin.name} </span>
                                </span>
                            </a>
                            <ul className="dropdown-menu dropdown-user animated fadeIn">
                                <div className="dropdown-user-scroll scrollbar-outer">
                                    <li>
                                        <div className="user-box">
                                            <div className="avatar-lg">
                                                <img
                                                    src="/img/profile.jpg"
                                                    alt="image profile"
                                                    className="avatar-img rounded"
                                                />
                                            </div>
                                            <div className="u-text">
                                                <h4> {admin.name} </h4>
                                                <p className="text-muted"> {admin.email} </p>
                                                <button
                                                    className="btn btn-xs btn-secondary btn-sm"
                                                    onClick={handleProfileClick} // Pass admin data on profile click
                                                >
                                                    View Profile
                                                </button>
                                            </div>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="dropdown-divider"></div>
                                        <a className="dropdown-item" href="#">Account Setting</a>
                                        <div className="dropdown-divider"></div>
                                        <a className="dropdown-item" href="/login" onClick={handleLoginRedirect}>Logout</a>
                                    </li>
                                </div>
                            </ul>
                        </li>
                    </ul>
                </div>
            </nav>
        </div>
    );
};

export default Header;