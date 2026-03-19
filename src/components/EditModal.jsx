import React, { useState, useEffect } from 'react';
import { X, Globe, Lock, Link as LinkIcon } from 'lucide-react';
import './AddModal.css';

const EditModal = ({ isOpen, item, onClose, onSave, friendsList = [] }) => {
    const [formData, setFormData] = useState({
        title: '',
        category: 'Other',
        link: '',
        description: '',
        isPublic: false,
        taggedFriendIds: [],
    });

    // Populate form when item changes
    useEffect(() => {
        if (item) {
            setFormData({
                title: item.title || '',
                category: item.category || 'Other',
                link: item.link || '',
                description: item.description || '',
                isPublic: item.type === 'public',
                taggedFriendIds: item.taggedFriendIds || [],
            });
        }
    }, [item]);

    if (!isOpen || !item) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(item.id, {
            title: formData.title.trim(),
            category: formData.category,
            link: formData.link,
            description: formData.description,
            type: formData.isPublic ? 'public' : 'friends',
            taggedFriendIds: formData.isPublic ? [] : formData.taggedFriendIds,
        });
        onClose();
    };

    const toggleTagFriend = (friendId) => {
        setFormData(prev => ({
            ...prev,
            taggedFriendIds: prev.taggedFriendIds.includes(friendId)
                ? prev.taggedFriendIds.filter(id => id !== friendId)
                : [...prev.taggedFriendIds, friendId]
        }));
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Edit Recommendation</h2>
                    <button className="close-btn" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Link URL</label>
                        <div className="input-with-icon">
                            <LinkIcon size={16} className="input-icon" />
                            <input
                                type="url"
                                required
                                placeholder="Paste URL here..."
                                value={formData.link}
                                onChange={e => setFormData({ ...formData, link: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Title</label>
                        <input
                            type="text"
                            required
                            placeholder="What are you sharing?"
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                        />
                    </div>

                    <div className="form-group">
                        <label>Description</label>
                        <input
                            type="text"
                            placeholder="Add a note (optional)"
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <div className="form-group">
                        <label>Category</label>
                        <select
                            value={formData.category}
                            onChange={e => setFormData({ ...formData, category: e.target.value })}
                        >
                            <option value="YouTube">YouTube</option>
                            <option value="Movies">Movies</option>
                            <option value="Song">Song</option>
                            <option value="Read">Read</option>
                            <option value="Book">Book</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <div className="form-row toggle-row">
                        <label className="toggle-label">
                            <span>Post to Public</span>
                            <span className="sub-label">
                                {formData.isPublic ? <Globe size={14} /> : <Lock size={14} />}
                                {formData.isPublic ? 'Visible to everyone' : 'Only friends'}
                            </span>
                        </label>

                        <label className="switch">
                            <input
                                type="checkbox"
                                checked={formData.isPublic}
                                onChange={e => setFormData({
                                    ...formData,
                                    isPublic: e.target.checked,
                                    taggedFriendIds: e.target.checked ? [] : formData.taggedFriendIds
                                })}
                            />
                            <span className="slider round"></span>
                        </label>
                    </div>

                    {!formData.isPublic && friendsList.length > 0 && (
                        <div className="tag-friends-section">
                            <label className="tag-friends-label">
                                <span>Tag specific friends</span>
                                <span className="tag-optional">(optional)</span>
                            </label>
                            <div className="friend-chips">
                                {friendsList.map(friend => {
                                    const isTagged = formData.taggedFriendIds.includes(friend.id);
                                    return (
                                        <button
                                            key={friend.id}
                                            type="button"
                                            className={`friend-chip ${isTagged ? 'tagged' : ''}`}
                                            onClick={() => toggleTagFriend(friend.id)}
                                        >
                                            {friend.photoURL ? (
                                                <img src={friend.photoURL} alt="" className="chip-avatar" />
                                            ) : (
                                                <span className="chip-avatar-fallback">{friend.displayName?.[0] || '?'}</span>
                                            )}
                                            <span className="chip-name">{friend.displayName}</span>
                                            {isTagged && <X size={12} className="chip-remove" />}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    <button type="submit" className="submit-btn">Save Changes</button>
                </form>
            </div>
        </div>
    );
};

export default EditModal;
