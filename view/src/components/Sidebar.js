import React from "react";
import { useLocation } from "react-router-dom";
import Cookies from "js-cookie";

const Sidebar = () => {
    const location = useLocation();
    const adminRole = Cookies.get("adminRole"); // Get role from cookie

    const isHome = location.pathname === "/";
    const isAdmin = location.pathname === "/admin";
    const isPartner = location.pathname === "/partners";
    const isNormal = location.pathname === "/normalUsers";
    const isFulltimeCaptain = location.pathname === "/fulltimeCaptains";
    const isFreelanceCaptain = location.pathname === "/freelanceCaptains";
    const isCars = location.pathname === "/cars";
    const isInventory = location.pathname === "/inventories";
    const isFastOrder = location.pathname === "/fast-orders";
    const isNormalOrder = location.pathname === "/normal-orders";
    const isTicket = location.pathname === "/tickets";
    const isReward = location.pathname === "/rewards";
    const isSalary = location.pathname === "/salary";
    const isWallet = location.pathname === "/wallet";

    // Conditionally render sidebar items based on the role
    return (
        <div className="sidebar sidebar-style-2" data-background-color="dark">
            {/* Sidebar Logo */}
            <div className="sidebar-logo">
                <div className="logo-header" data-background-color="dark">
                    <a href="/" className="logo">
                        <img
                            src="/img/kaiadmin/logo_light.svg"
                            alt="navbar brand"
                            className="navbar-brand"
                            height="20"
                        />
                    </a>
                    <div className="nav-toggle">
                        <button className="btn btn-toggle toggle-sidebar">
                            <i className="gg-menu-right"></i>
                        </button>
                        <button className="btn btn-toggle sidenav-toggler">
                            <i className="gg-menu-left"></i>
                        </button>
                    </div>
                    <button className="topbar-toggler more">
                        <i className="gg-more-vertical-alt"></i>
                    </button>
                </div>
            </div>

            {/* Sidebar Wrapper */}
            <div className="sidebar-wrapper scrollbar scrollbar-inner">
                <div className="sidebar-content">
                    <ul className="nav nav-secondary">
                        {/* Dashboard link is always visible */}
                        <li className={`nav-item ${isHome ? "active" : ""}`}>
                            <a href="/">
                                <i className="fas fa-home"></i>
                                <p>Dashboard</p>
                            </a>
                        </li>

                        {/* Tables section */}
                        <li className="nav-section">
                            <span className="sidebar-mini-icon">
                                <i className="fa fa-ellipsis-h"></i>
                            </span>
                            <h4 className="text-section">Tables</h4>
                        </li>

                        {/* Admin section */}
                        {(adminRole === "Admin") && (
                            <li className={`nav-item ${isAdmin ? "active" : ""}`}>
                                <a href="/admin">
                                    <i className="fas fa-user"></i>
                                    <p>Admin</p>
                                </a>
                            </li>
                        )}

                        {/* Users section */}
                        {(adminRole === "Admin" || adminRole === "HR") && (
                            <li className={`${isPartner || isNormal ? "active" : ""} nav-item`}>
                                <a data-bs-toggle="collapse" href="#users">
                                    <i className="fas fa-user"></i>
                                    <p>Users</p>
                                    <span className="caret"></span>
                                </a>
                                <div className={`${isPartner || isNormal ? "show" : ""}collapse`} id="users">
                                    <ul className="nav nav-collapse">
                                        <li className={`${isPartner ? "active" : ""}`}>
                                            <a href="/partners">
                                                <span className="sub-item">Partners</span>
                                            </a>
                                        </li>
                                        <li className={`${isNormal ? "active" : ""}`}>
                                            <a href="/normalUsers">
                                                <span className="sub-item">Normal Users</span>
                                            </a>
                                        </li>
                                    </ul>
                                </div>
                            </li>
                        )}

                        {/* Captains section */}
                        {(adminRole === "Admin" || adminRole === "HR" || adminRole === "Dispatcher") && (
                            <li className={`${isFulltimeCaptain || isFreelanceCaptain ? "active" : ""} nav-item  submenu`}>
                                <a data-bs-toggle="collapse" href="#captains">
                                    <i className="fa-solid fa-person"></i>
                                    <p>Captains</p>
                                    <span className="caret"></span>
                                </a>
                                <div className={`${isFulltimeCaptain || isFreelanceCaptain ? "show" : ""}collapse`} id="captains">
                                    <ul className="nav nav-collapse">
                                        <li className={`${isFulltimeCaptain ? "active" : ""}`}>
                                            <a href="/fulltimeCaptains">
                                                <span className="sub-item">Fulltime Captains</span>
                                            </a>
                                        </li>
                                        <li className={`${isFreelanceCaptain ? "active" : ""}`}>
                                            <a href="/freelanceCaptains">
                                                <span className="sub-item">Freelance Captains</span>
                                            </a>
                                        </li>
                                    </ul>
                                </div>
                            </li>
                        )}

                        {/* Cars section */}
                        {(adminRole === "Admin" || adminRole === "Dispatcher") && (
                            <li className={`nav-item ${isCars ? "active" : ""}`}>
                                <a href="/cars">
                                    <i className="fa-solid fa-car"></i>
                                    <p>Cars</p>
                                </a>
                            </li>
                        )}

                        {/* Inventory section */}
                        {(adminRole === "Admin" || adminRole === "StoreKeeper") && (
                            <li className={`nav-item ${isInventory ? "active" : ""}`}>
                                <a href="/inventories">
                                    <i className="fa-solid fa-warehouse"></i>
                                    <p>Inventory</p>
                                </a>
                            </li>
                        )}

                        {/* Orders section */}
                        {(adminRole === "Admin" || adminRole === "Dispatcher") && (
                            <li className={`${isNormalOrder || isFastOrder ? "active" : ""} nav-item`}>
                                <a data-bs-toggle="collapse" href="#orders">
                                    <i className="fa-solid fa-warehouse"></i>
                                    <p>Orders</p>
                                    <span className="caret"></span>
                                </a>
                                <div className={`${isNormalOrder || isFastOrder ? "show" : ""}collapse`} id="orders">
                                    <ul className="nav nav-collapse">
                                        <li className={`${isNormalOrder ? "active" : ""}`}>
                                            <a href="/normal-orders">
                                                <span className="sub-item">Normal Orders</span>
                                            </a>
                                        </li>
                                        <li className={`${isFastOrder ? "active" : ""}`}>
                                            <a href="/fast-orders">
                                                <span className="sub-item">Fast Orders</span>
                                            </a>
                                        </li>
                                    </ul>
                                </div>
                            </li>
                        )}

                        {/* Ticket section */}
                        {(adminRole === "Admin" || adminRole === "SupportTeam") && (
                            <li className={`nav-item ${isTicket ? "active" : ""}`}>
                                <a href="/tickets">
                                    <i className="fa-solid fa-ticket"></i>
                                    <p>Ticket</p>
                                </a>
                            </li>
                        )}

                        {/* Rewards section */}
                        {adminRole === "Admin" && (
                            <li className={`nav-item ${isReward ? "active" : ""}`}>
                                <a href="/rewards">
                                    <i className="fa-solid fa-ticket"></i>
                                    <p>Rewards</p>
                                </a>
                            </li>
                        )}

                        {/* Salary Section */}
                        {(adminRole === "Admin" || adminRole === "HR" || adminRole === "Accountant") && (
                            <li className={`nav-item ${isSalary ? "active" : ""}`}>
                                <a href="/salary">
                                    <i className="fa-solid fa-money-bill"></i>
                                    <p>Salary</p>
                                </a>
                            </li>
                        )}

                        {/* Wallet Section */}
                        {(adminRole === "Admin" || adminRole === "Accountant") && (
                            <li className={`nav-item ${isWallet ? "active" : ""}`}>
                                <a href="/wallet">
                                    <i class="fa-solid fa-wallet"></i>
                                    <p>Wallet</p>
                                </a>
                            </li>
                        )}

                    </ul>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
