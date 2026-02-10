import React from 'react';
import { User, Settings, LogOut, Trash2 } from 'lucide-react';
import RecommendationCard from '../components/RecommendationCard';
import './Profile.css';

const Profile = ({ recs = [], onDelete, onEdit }) => {
    const myRecs = recs.filter(r => r.userId === 'me');

    return (
        <div className="profile-page container">
            <header className="profile-header">
                <div className="profile-avatar">
                    <User size={48} />
                </div>
                <div className="profile-info">
                    <h1>Alex User</h1>
                    <p>@alex_recommends</p>
                </div>
                <div className="profile-stats">
                    <div className="stat">
                        <span className="stat-value">{myRecs.length}</span>
                        <span className="stat-label">Shared</span>
                    </div>
                    <div className="stat">
                        <span className="stat-value">128</span>
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
                    {['Sarah', 'Mike', 'Jessica', 'David'].map(name => (
                        <div key={name} className="friend-item">
                            <div className="friend-avatar">{name[0]}</div>
                            <span>{name}</span>
                        </div>
                    ))}
                </div>
            </section>

            <section className="profile-section">
                <h2>Settings</h2>
                <div className="settings-list">
                    <button className="settings-item">
                        <LogOut size={20} />
                        <span>Log Out</span>
                    </button>
                    <button className="settings-item danger">
                        <Trash2 size={20} />
                        <span>Delete Account</span>
                    </button>
                </div>
            </section>
        </div>
    );
};

export default Profile;
