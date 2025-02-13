import React from 'react';
import Cookies from 'js-cookie';

const UnAuth = () => {
    const handleLoginRedirect = () => {
        // Remove jwt and role from the cookies
        Cookies.remove('jwt');
        Cookies.remove('adminRole');
    };

    return (
        <div className='unAuth-container'>
            <div className="scene">
                <div className="overlay"></div>
                <div className="overlay"></div>
                <div className="overlay"></div>
                <div className="overlay"></div>
                <span className="bg-403">403</span>
                <div className="text">
                    <span className="hero-text"></span>
                    <span className="msg">can't let <span>you</span> in.</span>
                    <span className="support">
                        <span>unexpected?</span>
                        <a href="/login" onClick={handleLoginRedirect}>Login</a>
                    </span>
                </div>
                <div className="lock"></div>
            </div>
        </div>
    );
};

export default UnAuth;