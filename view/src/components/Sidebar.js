import React from "react";
import { useLocation } from "react-router-dom";

const Sidebar = () => {
    const location = useLocation();
    const isHome = location.pathname === "/";
    const isUser = location.pathname === "/users";
    const isCaptain = location.pathname === "/captains";
    const isCars = location.pathname === "/cars";
    const isInventory = location.pathname === "/inventories";
    const isItems = location.pathname === "/items";

    return (
        <div className="sidebar sidebar-style-2" data-background-color="dark">
            {/* Sidebar Logo */}
            <div className="sidebar-logo">
                <div className="logo-header" data-background-color="dark">
                    <a href="index.html" className="logo">
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

                        <li className={`nav-item ${isUser ? "active" : ""}`}>
                            <a href="/users">
                                <i className="fas fa-user"></i>
                                <p>Users</p>
                            </a>
                        </li>

                        <li className={`nav-item ${isCaptain ? "active" : ""}`}>
                            <a href="/captains">
                                <i class="fa-solid fa-person"></i>
                                <p>Captains</p>
                            </a>
                        </li>

                        <li className={`nav-item ${isCars ? "active" : ""}`}>
                            <a href="/cars">
                                <i class="fa-solid fa-car"></i>
                                <p>Cars</p>
                            </a>
                        </li>

                        <li className={`nav-item ${isItems ? "active" : ""}`}>
                            <a href="/items">
                                <i className="fas fa-user"></i>
                                <p>Items</p>
                            </a>
                        </li>

                        <li className={`nav-item ${isInventory ? "active" : ""}`}>
                            <a href="/inventories">
                                <i class="fa-solid fa-warehouse"></i>
                                <p>Inventory</p>
                            </a>
                        </li>

                    </ul>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;