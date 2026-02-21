import React, { useEffect } from 'react';
import { PartyPopper } from 'lucide-react';
import './Toast.css';

const Toast = ({ message, isVisible, onClose, duration = 3000 }) => {
    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [isVisible, duration, onClose]);

    if (!isVisible) return null;

    return (
        <div className="toast-container">
            <div className="toast-card">
                <PartyPopper size={36} className="toast-icon" />
                <span className="toast-message">{message}</span>
            </div>
        </div>
    );
};

export default Toast;
