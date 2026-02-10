import React from 'react';
import { ExternalLink, Play, Music, Film, Youtube, Globe, Trash2, Edit2, BookOpen, Book, Check, Heart, UserPlus } from 'lucide-react';
import './RecommendationCard.css';

const RecommendationCard = ({ item, isOwner, onDelete, onEdit, isLiked, onToggleLike, isCompleted, onToggleCompleted, feedType }) => {
    const getIcon = (cat) => {
        switch (cat.toLowerCase()) {
            case 'movies': return <Film size={14} />;
            case 'song': return <Music size={14} />;
            case 'songs': return <Music size={14} />; // Keep for backward compatibility if needed
            case 'youtube': return <Youtube size={14} />;
            case 'book': return <Book size={14} />;
            case 'read': return <BookOpen size={14} />;
            default: return <Globe size={14} />;
        }
    };

    return (
        <div className="card group" onClick={() => window.open(item.link, '_blank')}>
            <div className="card-image-container">
                {item.image ? (
                    <img src={item.image} alt={item.title} className="card-image" loading="lazy" />
                ) : (
                    <div className="card-placeholder" />
                )}
                <div className="card-overlay">
                    {/* Show Tick button for Public and Friends feed, but not for Owner */}
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

                    <button
                        className={`action-btn like ${isLiked ? 'liked' : ''}`}
                        title={isLiked ? "Unlike" : "Like"}
                        onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            onToggleLike(item.id);
                        }}
                    >
                        <Heart size={16} fill={isLiked ? "currentColor" : "none"} />
                    </button>

                    {isOwner && (
                        <div className="owner-actions">
                            <button
                                className="action-btn edit"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    onEdit(item.id);
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
                                    onDelete();
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
                <h3 className="card-title">{item.title}</h3>
                {item.description && <p className="card-desc">{item.description}</p>}

                {item.author && (
                    <div className="card-author">
                        <div className="author-info">
                            <img src={item.author.avatar} alt={item.author.name} className="author-avatar" />
                            <span className="author-name">{item.author.name}</span>
                        </div>

                        {/* Add Friend button only on Public page */}
                        {feedType === 'public' && !isOwner && (
                            <button
                                className="action-btn connect"
                                title="Connect"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    console.log('Connect with', item.author.name);
                                }}
                            >
                                <UserPlus size={16} />
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default RecommendationCard;
