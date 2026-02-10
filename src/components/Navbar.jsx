import React from 'react';
import { NavLink } from 'react-router-dom';
import { User, Heart, Maximize2 } from 'lucide-react';
import './Navbar.css';

const Navbar = ({ isFocusMode, onToggleFocus }) => {
    return (
        <nav className="navbar">
            <div className="container navbar-content">
                <NavLink to="/" className="logo">wuzdat</NavLink>

                <div className="nav-links">
                    <NavLink
                        to="/"
                        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                    >
                        Public
                    </NavLink>
                    <NavLink
                        to="/friends"
                        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                    >
                        Friends
                    </NavLink>
                    <NavLink
                        to="/completed"
                        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                    >
                        Completed
                    </NavLink>
                </div>

                <div className="nav-actions">
                    <button
                        className={`icon-btn ${isFocusMode ? 'active' : ''}`}
                        aria-label="Toggle Focus Mode"
                        onClick={onToggleFocus}
                        title={isFocusMode ? "Exit Focus Mode" : "Enter Focus Mode"}
                    >
                        <Maximize2 size={24} />
                    </button>
                    <NavLink to="/liked" className="icon-btn" aria-label="Liked">
                        <Heart size={24} />
                    </NavLink>

                    <NavLink to="/profile" className="icon-btn" aria-label="Profile">
                        <User size={24} />
                    </NavLink>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
