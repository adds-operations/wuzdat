import React, { useState } from 'react';
import { ExternalLink, Play, Music, Film, Youtube, Globe, Trash2, Edit2, BookOpen, Book, Check, Heart, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { sendFriendRequest } from '../services/friendsService';
import EditModal from './EditModal';
import './RecommendationCard.css';

const RecommendationCard = ({ item, isOwner: isOwnerProp, onDelete, onEdit, isLiked, likeCount = 0, onToggleLike, isCompleted, onToggleCompleted, feedType, currentUserId, friendIds = [], friendsList = [], onFriendsChanged }) => {
    const { user } = useAuth();
    const [connectStatus, setConnectStatus] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    // Derive ownership: explicit prop OR match logged-in user
    const isOwner = isOwnerProp !== undefined ? isOwnerProp : (item.userId === user?.uid);

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
            await sendFriendRequest(user, item.author.id);
            setConnectStatus('sent');
        } catch (err) {
            if (err.message === 'Already friends' || err.message === 'Friend request already exists') {
                setConnectStatus('sent');
            } else {
                setConnectStatus('error');
                setTimeout(() => setConnectStatus(null), 2000);
            }
        }
    };

    const handleDelete = (e) => {
        e.stopPropagation();
        e.preventDefault();
        if (window.confirm('Delete this recommendation? This cannot be undone.')) {
            if (onDelete) onDelete(item.id);
        }
    };

    const handleEditClick = (e) => {
        e.stopPropagation();
        e.preventDefault();
        setIsEditModalOpen(true);
    };

    const handleEditSave = (id, updatedFields) => {
        if (onEdit) onEdit(id, updatedFields);
    };

    const handleCardClick = () => {
        if (!isEditModalOpen) {
            window.open(item.link, '_blank');
        }
    };

    return (
        <>
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
                                    onClick={handleEditClick}
                                    title="Edit"
                                >
                                    <Edit2 size={16} />
                                </button>
                                <button
                                    className="action-btn delete"
                                    onClick={handleDelete}
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

                    <h3 className="card-title">{item.title}</h3>

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
                                    title={connectStatus === 'sent' ? 'Request Sent' : 'Connect'}
                                    onClick={handleConnect}
                                    disabled={connectStatus === 'sending' || connectStatus === 'sent'}
                                >
                                    {connectStatus === 'sent' ? <Check size={16} /> : <UserPlus size={16} />}
                                </button>
                            )}

                            {feedType === 'public' && likeCount > 0 && (
                                <span className="like-count-badge">
                                    <Heart size={12} fill="currentColor" />
                                    {likeCount}
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <EditModal
                isOpen={isEditModalOpen}
                item={item}
                onClose={() => setIsEditModalOpen(false)}
                onSave={handleEditSave}
                friendsList={friendsList}
            />
        </>
    );
};

export default RecommendationCard;
