import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, LogOut, X, Check, XCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getFriendsList, removeFriend, getPendingRequests, acceptFriendRequest, rejectFriendRequest } from '../services/friendsService';
import RecommendationCard from '../components/RecommendationCard';
import './Profile.css';

const Profile = ({ recs = [], onDelete, onEdit, likedRecIds = [], onToggleLike, completedRecIds = [], onToggleCompleted }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [friends, setFriends] = useState([]);
    const [loadingFriends, setLoadingFriends] = useState(true);
    const [pendingRequests, setPendingRequests] = useState([]);

    const myRecs = recs.filter(r => r.userId === user?.uid);

    useEffect(() => {
        const loadData = async () => {
            if (user) {
                try {
                    const [friendsList, pending] = await Promise.all([
                        getFriendsList(user.uid),
                        getPendingRequests(user.uid),
                    ]);
                    setFriends(friendsList);
                    setPendingRequests(pending);
                } catch (err) {
                    console.error('Error loading profile data:', err);
                }
            }
            setLoadingFriends(false);
        };
        loadData();
    }, [user]);

    const handleAccept = async (requestId, fromUid) => {
        try {
            await acceptFriendRequest(requestId, fromUid, user.uid);
            setPendingRequests(prev => prev.filter(r => r.id !== requestId));
            const updatedFriends = await getFriendsList(user.uid);
            setFriends(updatedFriends);
        } catch (err) {
            console.error('Error accepting request:', err);
        }
    };

    const handleReject = async (requestId) => {
        try {
            await rejectFriendRequest(requestId);
            setPendingRequests(prev => prev.filter(r => r.id !== requestId));
        } catch (err) {
            console.error('Error rejecting request:', err);
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (err) {
            console.error('Logout failed:', err);
        }
    };

    return (
        <div className="profile-page container">
            <header className="profile-header">
                <div className="profile-avatar">
                    {user?.photoURL ? (
                        <img
                            src={user.photoURL}
                            alt={user.displayName || 'Profile'}
                            style={{
                                width: 64,
                                height: 64,
                                borderRadius: '50%',
                                objectFit: 'cover',
                            }}
                        />
                    ) : (
                        <User size={48} />
                    )}
                </div>
                <div className="profile-info">
                    <h1>{user?.displayName || 'User'}</h1>
                    <p>{user?.email || ''}</p>
                </div>
                <div className="profile-stats">
                    <div className="stat">
                        <span className="stat-value">{myRecs.length}</span>
                        <span className="stat-label">Shared</span>
                    </div>
                    <div className="stat">
                        <span className="stat-value">{friends.length}</span>
                        <span className="stat-label">Friends</span>
                    </div>
                </div>
            </header>

            <section className="profile-section">
                <h2>My Recommendations</h2>
                <div className="masonry-grid">
                    {myRecs.length > 0 ? (
                        myRecs.map(item => (
                            <RecommendationCard
                                key={item.id}
                                item={item}
                                isOwner={true}
                                onDelete={onDelete}
                                onEdit={onEdit}
                                isLiked={likedRecIds.includes(item.id)}
                                onToggleLike={onToggleLike}
                                isCompleted={completedRecIds.includes(item.id)}
                                onToggleCompleted={onToggleCompleted}
                            />
                        ))
                    ) : (
                        <p className="empty-state">You haven't shared anything yet.</p>
                    )}
                </div>
            </section>

            <section className="profile-section">
                <h2>Friends ({friends.length})</h2>
                {loadingFriends ? (
                    <p className="empty-state">Loading...</p>
                ) : friends.length > 0 ? (
                    <div className="friends-grid">
                        {friends.map(friend => (
                            <div key={friend.id} className="friend-card">
                                <button
                                    className="friend-remove-btn"
                                    title="Remove friend"
                                    onClick={async () => {
                                        await removeFriend(user.uid, friend.uid);
                                        setFriends(prev => prev.filter(f => f.id !== friend.id));
                                    }}
                                >
                                    <X size={14} />
                                </button>
                                {friend.photoURL ? (
                                    <img src={friend.photoURL} alt={friend.displayName} className="friend-card-avatar" />
                                ) : (
                                    <div className="friend-card-avatar-fallback">
                                        {friend.displayName?.[0] || '?'}
                                    </div>
                                )}
                                <span className="friend-card-name">{friend.displayName}</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="empty-state">No friends yet. Tap the connect button on someone's post to add them!</p>
                )}
            </section>

            {/* Pending Friend Requests */}
            {pendingRequests.length > 0 && (
                <section className="profile-section">
                    <h2>Pending Requests ({pendingRequests.length})</h2>
                    <div className="pending-list">
                        {pendingRequests.map(req => (
                            <div key={req.id} className="pending-item">
                                <div className="pending-user">
                                    {req.fromPhoto ? (
                                        <img src={req.fromPhoto} alt={req.fromName} className="pending-avatar" />
                                    ) : (
                                        <div className="pending-avatar-fallback">{req.fromName?.[0] || '?'}</div>
                                    )}
                                    <div className="pending-info">
                                        <span className="pending-name">{req.fromName}</span>
                                        <span className="pending-email">{req.fromEmail}</span>
                                    </div>
                                </div>
                                <div className="pending-actions">
                                    <button
                                        className="pending-accept"
                                        title="Accept"
                                        onClick={() => handleAccept(req.id, req.fromUid)}
                                    >
                                        <Check size={16} />
                                    </button>
                                    <button
                                        className="pending-reject"
                                        title="Decline"
                                        onClick={() => handleReject(req.id)}
                                    >
                                        <XCircle size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            <section className="profile-section">
                <h2>Settings</h2>
                <div className="settings-list">
                    <button className="settings-item" onClick={handleLogout}>
                        <LogOut size={20} />
                        <span>Log Out</span>
                    </button>
                </div>
            </section>
        </div>
    );
};

export default Profile;
