import React, { useState } from 'react';
import { ExternalLink, Play, Music, Film, Youtube, Globe, Trash2, Edit2, BookOpen, Book, Check, Heart, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { instantConnect } from '../services/friendsService';
import './RecommendationCard.css';

const RecommendationCard = ({ item, isOwner, onDelete, onEdit, isLiked, onToggleLike, isCompleted, onToggleCompleted, feedType, currentUserId, friendIds = [], onFriendsChanged }) => {
    const { user } = useAuth();
    const [connectStatus, setConnectStatus] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState(item.title);

    const getIcon = (cat) => {
        switch (cat.toLowerCase()) {
            case 'movies': return <Film size={14} />;
            case 'song': return <Music size={14} />;
            case 'songs': return <Music size={14} />;
            case 'youtube': return <Youtube size={14} />;
            case 'book': return <Book size={14} />;
            case 'read': return <BookOpen size={14} />;
            default: return <Globe size={14} />;
        }
    };

    const isOwnPost = item.userId === user?.uid;
    const isAlreadyFriend = item.author?.id && friendIds.includes(item.author.id);

    const handleConnect = async (e) => {
        e.stopPropagation();
        e.preventDefault();
        if (!user || !item.author?.id || isOwnPost || isAlreadyFriend) return;

        setConnectStatus('sending');
        try {
            await instantConnect(user.uid, item.author.id);
            setConnectStatus('sent');
            if (onFriendsChanged) onFriendsChanged();
        } catch (err) {
            if (err.message === 'Already friends') {
                setConnectStatus('sent');
            } else {
                setConnectStatus('error');
                setTimeout(() => setConnectStatus(null), 2000);
            }
        }
    };

    const handleSaveEdit = (e) => {
        e.stopPropagation();
        e.preventDefault();
        if (editTitle.trim() && onEdit) {
            onEdit(item.id, { title: editTitle.trim() });
        }
        setIsEditing(false);
    };

    const handleCardClick = () => {
        if (!isEditing) {
            window.open(item.link, '_blank');
        }
    };

    return (
        <div className="card group" onClick={handleCardClick}>
            <div className="card-image-container">
                {item.image ? (
                    <img src={item.image} alt={item.title} className="card-image" loading="lazy" />
                ) : (
                    <div className="card-placeholder" />
                )}
                <div className="card-overlay">
                    {!isOwner && (
                        <button
                            className={`action-btn tick ${isCompleted ? 'completed' : ''}`}
                            title={isCompleted ? "Marked as Watched" : "Mark as Watched"}
                            onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                onToggleCompleted && onToggleCompleted(item.id);
                            }}
                        >
                            <Check size={16} />
                        </button>
                    )}

                    {!isOwner && (
                        <button
                            className={`action-btn like ${isLiked ? 'liked' : ''}`}
                            title={isLiked ? "Unlike" : "Like"}
                            onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                onToggleLike && onToggleLike(item.id);
                            }}
                        >
                            <Heart size={16} fill={isLiked ? "currentColor" : "none"} />
                        </button>
                    )}

                    {isOwner && (
                        <div className="owner-actions">
                            <button
                                className="action-btn edit"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    setEditTitle(item.title);
                                    setIsEditing(true);
                                }}
                                title="Edit"
                            >
                                <Edit2 size={16} />
                            </button>
                            <button
                                className="action-btn delete"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    if (onDelete) onDelete(item.id);
                                }}
                                title="Delete"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="card-content">
                <div className="card-header">
                    <span className="card-tag">
                        {getIcon(item.category)}
                        {item.category}
                    </span>
                </div>

                {isEditing ? (
                    <div className="edit-title-row" onClick={(e) => e.stopPropagation()}>
                        <input
                            type="text"
                            className="edit-title-input"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            autoFocus
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveEdit(e);
                                if (e.key === 'Escape') setIsEditing(false);
                            }}
                        />
                        <button className="edit-save-btn" onClick={handleSaveEdit}>Save</button>
                    </div>
                ) : (
                    <h3 className="card-title">{item.title}</h3>
                )}

                {item.description && <p className="card-desc">{item.description}</p>}

                {item.author && (
                    <div className="card-author">
                        <div className="author-info">
                            {item.author.avatar ? (
                                <img src={item.author.avatar} alt={item.author.name} className="author-avatar" />
                            ) : (
                                <div className="author-avatar-fallback">{item.author.name?.[0] || '?'}</div>
                            )}
                            <span className="author-name">{item.author.name}</span>
                        </div>

                        {feedType === 'public' && !isOwnPost && !isAlreadyFriend && (
                            <button
                                className={`action-btn connect ${connectStatus === 'sent' ? 'sent' : ''}`}
                                title={connectStatus === 'sent' ? 'Connected' : 'Connect'}
                                onClick={handleConnect}
                                disabled={connectStatus === 'sending' || connectStatus === 'sent'}
                            >
                                {connectStatus === 'sent' ? <Check size={16} /> : <UserPlus size={16} />}
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default RecommendationCard;
