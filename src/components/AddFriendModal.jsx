import React, { useState, useEffect } from 'react';
import { X, Search, Check, XCircle, UserPlus, Clock, Phone, Mail } from 'lucide-react';
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
    const [inviteMode, setInviteMode] = useState('email'); // 'email' | 'phone'
    const [searchEmail, setSearchEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [searchResult, setSearchResult] = useState(null);
    const [searchError, setSearchError] = useState('');
    const [searching, setSearching] = useState(false);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [sentRequests, setSentRequests] = useState([]);
    const [actionMsg, setActionMsg] = useState('');
    const [loadingRequests, setLoadingRequests] = useState(false);
    const [notFoundEmail, setNotFoundEmail] = useState('');

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

    const sendInviteEmail = (toEmail) => {
        const subject = encodeURIComponent(`Join me on wuzdat!`);
        const body = encodeURIComponent(
            `Hey!\n\nI'd love to connect with you on wuzdat — a place to share and discover great recommendations for movies, songs, books, and more.\n\nJoin here: ${window.location.origin}\n\nSee you there! 🎬🎵📚`
        );
        window.open(`mailto:${toEmail}?subject=${subject}&body=${body}`, '_blank');
    };

    const sendWhatsAppInvite = () => {
        const digits = phoneNumber.replace(/[^\d]/g, '');
        if (!digits) return;
        const message = encodeURIComponent(
            `Hey! 👋\n\nJoin me on wuzdat — a place to share and discover great recommendations for movies, songs, books, and more.\n\nSign up here: ${window.location.origin}\n\nSee you there! 🎬🎵📚`
        );
        window.open(`https://wa.me/${digits}?text=${message}`, '_blank');
        setActionMsg('WhatsApp invite opened!');
    };

    const sendRequestEmail = (toEmail) => {
        const subject = encodeURIComponent(`${user.displayName || 'Someone'} sent you a friend request on wuzdat!`);
        const body = encodeURIComponent(
            `Hey!\n\n${user.displayName || 'A user'} wants to be your friend on wuzdat.\n\nLog in to accept: ${window.location.origin}\n\nSee you there! 🎬🎵📚`
        );
        window.open(`mailto:${toEmail}?subject=${subject}&body=${body}`, '_blank');
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        setSearchResult(null);
        setSearchError('');
        setActionMsg('');
        setNotFoundEmail('');

        if (!searchEmail.trim()) return;

        setSearching(true);
        try {
            const found = await searchUserByEmail(searchEmail.trim(), user.uid);
            if (found) {
                setSearchResult(found);
            } else {
                setSearchError('No user found with that email.');
                setNotFoundEmail(searchEmail.trim());
            }
        } catch (err) {
            setSearchError('Error searching. Try again.');
        } finally {
            setSearching(false);
        }
    };

    const handleSendRequest = async (toUid, toEmail) => {
        try {
            await sendFriendRequest(user, toUid);
            setActionMsg('Friend request sent!');
            if (toEmail) sendRequestEmail(toEmail);
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

                    {/* Email / Phone Toggle */}
                    <div className="invite-toggle">
                        <button
                            className={`toggle-tab${inviteMode === 'email' ? ' active' : ''}`}
                            onClick={() => { setInviteMode('email'); setActionMsg(''); }}
                        >
                            <Mail size={14} /> Email
                        </button>
                        <button
                            className={`toggle-tab${inviteMode === 'phone' ? ' active' : ''}`}
                            onClick={() => { setInviteMode('phone'); setActionMsg(''); }}
                        >
                            <Phone size={14} /> Phone
                        </button>
                    </div>

                    {inviteMode === 'email' ? (
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
                    ) : (
                        <div className="phone-invite-section">
                            <div className="invite-row">
                                <input
                                    type="tel"
                                    placeholder="+91 98765 43210"
                                    className="invite-input"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                />
                            </div>
                            <button
                                className="whatsapp-invite-btn"
                                onClick={sendWhatsAppInvite}
                                disabled={!phoneNumber.replace(/[^\d]/g, '')}
                            >
                                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                                Invite via WhatsApp
                            </button>
                        </div>
                    )}

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
                                onClick={() => handleSendRequest(searchResult.uid, searchResult.email)}
                            >
                                <UserPlus size={16} /> Add
                            </button>
                        </div>
                    )}

                    {searchError && (
                        <div className="search-not-found">
                            <p className="search-error">{searchError}</p>
                            {notFoundEmail && (
                                <button
                                    className="invite-email-btn"
                                    onClick={() => sendInviteEmail(notFoundEmail)}
                                >
                                    ✉️ Invite {notFoundEmail} via Email
                                </button>
                            )}
                        </div>
                    )}
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
                    <p className="empty-hint">
                        {inviteMode === 'email'
                            ? 'Search for friends by their email address.'
                            : 'Enter a phone number to invite via WhatsApp.'}
                    </p>
                )}
            </div>
        </div>
    );
};

export default AddFriendModal;
