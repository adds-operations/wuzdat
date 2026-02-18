import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getFriendsList } from '../services/friendsService';
import RecommendationCard from '../components/RecommendationCard';
import './Profile.css';

const Profile = ({ recs = [], onDelete, onEdit, likedRecIds = [], onToggleLike, completedRecIds = [], onToggleCompleted }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [friends, setFriends] = useState([]);
    const [loadingFriends, setLoadingFriends] = useState(true);

    // Filter to show only the current user's recommendations
    const myRecs = recs.filter(r => r.userId === user?.uid);

    useEffect(() => {
        const loadFriends = async () => {
            if (user) {
                try {
                    const friendsList = await getFriendsList(user.uid);
                    setFriends(friendsList);
                } catch (err) {
                    console.error('Error loading friends:', err);
                }
            }
            setLoadingFriends(false);
        };
        loadFriends();
    }, [user]);

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
                                onDelete={() => onDelete(item.id)}
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
                <h2>Friends</h2>
                <div className="friends-list">
                    {loadingFriends ? (
                        <p className="empty-state">Loading...</p>
                    ) : friends.length > 0 ? (
                        friends.map(friend => (
                            <div key={friend.id} className="friend-item-real">
                                {friend.photoURL ? (
                                    <img src={friend.photoURL} alt={friend.displayName} className="friend-avatar-img" />
                                ) : (
                                    <div className="friend-avatar-fallback">{friend.displayName?.[0] || '?'}</div>
                                )}
                                <span className="friend-name">{friend.displayName}</span>
                            </div>
                        ))
                    ) : (
                        <p className="empty-state">No friends yet. Use the + button to add friends!</p>
                    )}
                </div>
            </section>

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
