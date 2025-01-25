import React from 'react';

const Footer = () => {
    const currentYear = new Date().getFullYear(); // Get the current year dynamically

    return (
        <footer className="footer">
            <div className="container-fluid d-flex justify-content-between">
                <nav className="pull-left">
                    <ul className="nav">
                        <li className="nav-item">
                            <a className="nav-link" href="http://www.themekita.com">
                                ThemeKita
                            </a>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link" href="#"> Help </a>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link" href="#"> Licenses </a>
                        </li>
                    </ul>
                </nav>
                <div className="copyright">
                    {currentYear}, made with <i className="fa fa-heart heart text-danger"></i> by
                    <a href="http://www.themekita.com">ThemeKita</a>
                </div>
                <div>
                    Distributed by
                    <a target="_blank" href="https://themewagon.com/">ThemeWagon</a>.
                </div>
            </div>
        </footer>
    );
}

export default Footer;