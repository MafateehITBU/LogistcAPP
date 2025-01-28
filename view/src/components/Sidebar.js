import React from "react";
import { useLocation } from "react-router-dom";

const Sidebar = () => {
    const location = useLocation();
    const isHome = location.pathname === "/";
    const isUser = location.pathname === "/users";
    const isPartner = location.pathname === "/partners";
    const isNormal = location.pathname === "/normalUsers";
    const isFulltimeCaptain = location.pathname === "/fulltimeCaptains";
    const isFreelanceCaptain = location.pathname === "/freelanceCaptains";
    const isCars = location.pathname === "/cars";
    const isInventory = location.pathname === "/inventories";
    const isItems = location.pathname === "/items";
    const isTicket = location.pathname === "/tickets";

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
                        <li className={`nav-item ${isHome ? "active" : ""}`}>
                            <a href="/">
                                <i className="fas fa-home"></i>
                                <p>Dashboard</p>
                            </a>
                        </li>

                        <li className="nav-section">
                            <span className="sidebar-mini-icon">
                                <i className="fa fa-ellipsis-h"></i>
                            </span>
                            <h4 className="text-section">Tables</h4>
                        </li>

                        <li class={`${isPartner || isNormal ? "active" : ""} nav-item`}>
                            <a data-bs-toggle="collapse" href="#users">
                                <i className="fas fa-user"></i>
                                <p>Users</p>
                                <span class="caret"></span>
                            </a>
                            <div class={`${isPartner || isNormal ? "show" : ""}collapse`} id="users">
                                <ul class="nav nav-collapse">
                                    <li class={`${isPartner ? "active" : ""}`}>
                                        <a href="/partners">
                                            <span class="sub-item">Partners</span>
                                        </a>
                                    </li>
                                    <li class={`${isNormal ? "active" : ""}`}>
                                        <a href="/normalUsers">
                                            <span class="sub-item">Normal Users</span>
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </li>

                        <li class={`${isFulltimeCaptain || isFreelanceCaptain ? "active" : ""} nav-item  submenu`}>
                            <a data-bs-toggle="collapse" href="#captanis">
                                <i class="fa-solid fa-person"></i>
                                <p>Captains</p>
                                <span class="caret"></span>
                            </a>
                            <div class={`${isFulltimeCaptain || isFreelanceCaptain ? "show" : ""}collapse `} id="captanis">
                                <ul class="nav nav-collapse">
                                    <li class={`${isFulltimeCaptain ? "active" : ""}`}>
                                        <a href="/fulltimeCaptains">
                                            <span class="sub-item">Fulltime Captains</span>
                                        </a>
                                    </li>
                                    <li class={`${isFreelanceCaptain ? "active" : ""}`}>
                                        <a href="/freelanceCaptains">
                                            <span class="sub-item">Freelance Captains</span>
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </li>

                        <li className={`nav-item ${isCars ? "active" : ""}`}>
                            <a href="/cars">
                                <i class="fa-solid fa-car"></i>
                                <p>Cars</p>
                            </a>
                        </li>

                        <li className={`nav-item ${isInventory ? "active" : ""}`}>
                            <a href="/inventories">
                                <i class="fa-solid fa-warehouse"></i>
                                <p>Inventory</p>
                            </a>
                        </li>

                        <li className={`nav-item ${isTicket ? "active" : ""}`}>
                            <a href="/tickets">
                                <i class="fa-solid fa-ticket"></i>
                                <p>Ticket</p>
                            </a>
                        </li>

                    </ul>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;