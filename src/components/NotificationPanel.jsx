import React, { useState, useRef, useEffect } from 'react';
import { Bell, Heart, UserPlus, CheckCircle } from 'lucide-react';
import './NotificationPanel.css';

const timeAgo = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);

    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return date.toLocaleDateString();
};

const getNotificationIcon = (type) => {
    switch (type) {
        case 'like':
            return <Heart size={14} fill="#ff4d4d" color="#ff4d4d" />;
        case 'friend_added':
            return <UserPlus size={14} color="#10b981" />;
        case 'completed':
            return <CheckCircle size={14} color="#FF004D" />;
        default:
            return <Bell size={14} />;
    }
};

const getNotificationMessage = (notif) => {
    switch (notif.type) {
        case 'like':
            return (
                <>
                    <strong>{notif.fromName}</strong> liked your rec{' '}
                    {notif.recTitle && <span className="rec-title">"{notif.recTitle}"</span>}
                </>
            );
        case 'friend_added':
            return (
                <>
                    <strong>{notif.fromName}</strong> connected with you 🤝
                </>
            );
        case 'completed':
            return (
                <>
                    <strong>{notif.fromName}</strong> completed your rec{' '}
                    {notif.recTitle && <span className="rec-title">"{notif.recTitle}"</span>} ✅
                </>
            );
        default:
            return <strong>{notif.fromName}</strong>;
    }
};

const NotificationPanel = ({ notifications = [], unreadCount = 0, onMarkAllRead, onClearAll }) => {
    const [isOpen, setIsOpen] = useState(false);
    const panelRef = useRef(null);

    // Close on outside click
    useEffect(() => {
        const handleClick = (e) => {
            if (panelRef.current && !panelRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClick);
        }
        return () => document.removeEventListener('mousedown', handleClick);
    }, [isOpen]);

    const handleBellClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsOpen(!isOpen);
    };

    const handleMarkRead = (e) => {
        e.stopPropagation();
        if (onMarkAllRead) onMarkAllRead();
    };

    const handleClearAll = (e) => {
        e.stopPropagation();
        if (onClearAll) onClearAll();
    };

    return (
        <div className="notification-wrapper" ref={panelRef}>
            <button className="notification-bell icon-btn" onClick={handleBellClick} aria-label="Notifications">
                <Bell size={24} />
                {unreadCount > 0 && (
                    <span className="notification-badge">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <>
                    <div className="notification-backdrop" onClick={() => setIsOpen(false)} />
                    <div className="notification-panel">
                        <div className="notification-panel-header">
                            <h3>Notifications</h3>
                            <div className="notification-header-actions">
                                {unreadCount > 0 && (
                                    <button className="mark-read-btn" onClick={handleMarkRead}>
                                        Mark read
                                    </button>
                                )}
                                {notifications.length > 0 && (
                                    <button className="clear-all-btn" onClick={handleClearAll}>
                                        Clear all
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="notification-list">
                            {notifications.length === 0 ? (
                                <div className="notification-empty">
                                    <Bell size={32} />
                                    <p>No notifications yet</p>
                                </div>
                            ) : (
                                notifications.map((notif) => (
                                    <div
                                        key={notif.id}
                                        className={`notification-item ${!notif.read ? 'unread' : ''}`}
                                    >
                                        {notif.fromPhoto ? (
                                            <img
                                                src={notif.fromPhoto}
                                                alt={notif.fromName}
                                                className="notification-avatar"
                                            />
                                        ) : (
                                            <div className="notification-avatar-fallback">
                                                {notif.fromName?.[0] || '?'}
                                            </div>
                                        )}
                                        <div className="notification-content">
                                            <p className="notification-text">
                                                {getNotificationIcon(notif.type)}{' '}
                                                {getNotificationMessage(notif)}
                                            </p>
                                            <span className="notification-time">
                                                {timeAgo(notif.created_at)}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default NotificationPanel;
