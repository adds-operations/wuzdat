import React, { useState, useEffect } from 'react';
import { X, Search, Check, XCircle, UserPlus, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
    searchUserByEmail,
    sendFriendRequest,
    getPendingRequests,
    acceptFriendRequest,
    rejectFriendRequest,
    getSentRequests,
} from '../services/friendsService';
import './AddModal.css';
import './AddFriendModal.css';

const AddFriendModal = ({ isOpen, onClose, onFriendsChanged }) => {
    const { user } = useAuth();
    const [searchEmail, setSearchEmail] = useState('');
    const [searchResult, setSearchResult] = useState(null);
    const [searchError, setSearchError] = useState('');
    const [searching, setSearching] = useState(false);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [sentRequests, setSentRequests] = useState([]);
    const [actionMsg, setActionMsg] = useState('');
    const [loadingRequests, setLoadingRequests] = useState(false);

    // Load pending and sent requests when modal opens
    useEffect(() => {
        if (isOpen && user) {
            loadRequests();
        }
    }, [isOpen, user]);

    const loadRequests = async () => {
        setLoadingRequests(true);
        try {
            const [pending, sent] = await Promise.all([
                getPendingRequests(user.uid),
                getSentRequests(user.uid),
            ]);
            setPendingRequests(pending);
            setSentRequests(sent);
        } catch (err) {
            console.error('Error loading requests:', err);
        } finally {
            setLoadingRequests(false);
        }
    };

    if (!isOpen) return null;

    const handleSearch = async (e) => {
        e.preventDefault();
        setSearchResult(null);
        setSearchError('');
        setActionMsg('');

        if (!searchEmail.trim()) return;

        setSearching(true);
        try {
            const found = await searchUserByEmail(searchEmail.trim(), user.uid);
            if (found) {
                setSearchResult(found);
            } else {
                setSearchError('No user found with that email.');
            }
        } catch (err) {
            setSearchError('Error searching. Try again.');
        } finally {
            setSearching(false);
        }
    };

    const handleSendRequest = async (toUid) => {
        try {
            await sendFriendRequest(user, toUid);
            setActionMsg('Friend request sent!');
            setSearchResult(null);
            setSearchEmail('');
            await loadRequests();
        } catch (err) {
            setActionMsg(err.message || 'Could not send request.');
        }
    };

    const handleAccept = async (requestId, fromUid) => {
        try {
            await acceptFriendRequest(requestId, fromUid, user.uid);
            setActionMsg('Friend added!');
            await loadRequests();
            if (onFriendsChanged) onFriendsChanged();
        } catch (err) {
            setActionMsg('Error accepting request.');
        }
    };

    const handleReject = async (requestId) => {
        try {
            await rejectFriendRequest(requestId);
            setActionMsg('Request declined.');
            await loadRequests();
        } catch (err) {
            setActionMsg('Error declining request.');
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="friend-modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Friends</h2>
                    <button className="close-btn" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                {/* Search Section */}
                <div className="modal-section">
                    <h3>Find Friends</h3>
                    <form onSubmit={handleSearch}>
                        <div className="invite-row">
                            <input
                                type="email"
                                placeholder="Search by email..."
                                className="invite-input"
                                value={searchEmail}
                                onChange={(e) => setSearchEmail(e.target.value)}
                                required
                            />
                            <button type="submit" className="invite-btn" disabled={searching}>
                                {searching ? '...' : <Search size={18} />}
                            </button>
                        </div>
                    </form>

                    {searchResult && (
                        <div className="search-result">
                            <div className="search-user">
                                {searchResult.photoURL ? (
                                    <img src={searchResult.photoURL} alt="" className="search-avatar" />
                                ) : (
                                    <div className="search-avatar-fallback">{searchResult.displayName?.[0] || '?'}</div>
                                )}
                                <div className="search-user-info">
                                    <span className="search-user-name">{searchResult.displayName}</span>
                                    <span className="search-user-email">{searchResult.email}</span>
                                </div>
                            </div>
                            <button
                                className="send-request-btn"
                                onClick={() => handleSendRequest(searchResult.uid)}
                            >
                                <UserPlus size={16} /> Add
                            </button>
                        </div>
                    )}

                    {searchError && <p className="search-error">{searchError}</p>}
                    {actionMsg && <p className="success-msg"><Check size={14} /> {actionMsg}</p>}
                </div>

                {/* Pending Requests Section */}
                {pendingRequests.length > 0 && (
                    <div className="modal-section">
                        <h3>Pending Requests</h3>
                        <div className="requests-list">
                            {pendingRequests.map(req => (
                                <div key={req.id} className="request-item">
                                    <div className="search-user">
                                        {req.fromPhoto ? (
                                            <img src={req.fromPhoto} alt="" className="search-avatar" />
                                        ) : (
                                            <div className="search-avatar-fallback">{req.fromName?.[0] || '?'}</div>
                                        )}
                                        <div className="search-user-info">
                                            <span className="search-user-name">{req.fromName}</span>
                                            <span className="search-user-email">{req.fromEmail}</span>
                                        </div>
                                    </div>
                                    <div className="request-actions">
                                        <button
                                            className="accept-btn"
                                            onClick={() => handleAccept(req.id, req.fromUid)}
                                            title="Accept"
                                        >
                                            <Check size={16} />
                                        </button>
                                        <button
                                            className="reject-btn"
                                            onClick={() => handleReject(req.id)}
                                            title="Decline"
                                        >
                                            <XCircle size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Sent Requests Section */}
                {sentRequests.length > 0 && (
                    <div className="modal-section">
                        <h3>Sent Requests</h3>
                        <div className="requests-list">
                            {sentRequests.map(req => (
                                <div key={req.id} className="request-item sent">
                                    <div className="search-user">
                                        <Clock size={16} className="pending-icon" />
                                        <div className="search-user-info">
                                            <span className="search-user-name">Pending...</span>
                                            <span className="search-user-email">Sent to user</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {!loadingRequests && pendingRequests.length === 0 && sentRequests.length === 0 && !searchResult && !searchError && !actionMsg && (
                    <p className="empty-hint">Search for friends by their email address.</p>
                )}
            </div>
        </div>
    );
};

export default AddFriendModal;
