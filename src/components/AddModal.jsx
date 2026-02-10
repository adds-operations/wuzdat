import React, { useState, useEffect } from 'react';
import { X, Globe, Lock, Link as LinkIcon } from 'lucide-react';
import RecommendationCard from './RecommendationCard';
import './AddModal.css';

const AddModal = ({ isOpen, onClose, onAdd }) => {
    const [formData, setFormData] = useState({
        link: '',
        title: '',
        category: 'Other',
        isPublic: false,
        image: '',
        description: '' // New description field
    });

    const [previewImage, setPreviewImage] = useState(null);

    // Link preview logic
    useEffect(() => {
        if (!formData.link) {
            setFormData(prev => ({ ...prev, image: '', description: '', title: prev.title || '' }));
            setPreviewImage(null);
            return;
        }

        const fetchMetadata = async () => {
            let foundImage = null;
            let foundTitle = null;
            let foundDesc = null;

            try {
                const encodedUrl = encodeURIComponent(formData.link);
                const response = await fetch(`https://api.microlink.io/?url=${encodedUrl}`);
                const data = await response.json();

                if (data.status === 'success') {
                    const { image, title, description } = data.data;
                    if (image?.url) foundImage = image.url;
                    if (title) foundTitle = title;
                    if (description) foundDesc = description;
                }
            } catch (error) {
                console.error("Error fetching link preview:", error);
            }

            // Fallback logic for image if API returned nothing
            if (!foundImage) {
                if (formData.link.includes('youtube') || formData.link.includes('youtu.be')) {
                    foundImage = 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=800&q=80';
                } else if (formData.link.includes('spotify')) {
                    foundImage = 'https://images.unsplash.com/photo-1614680376593-902f74cf0d41?auto=format&fit=crop&w=800&q=80';
                } else {
                    foundImage = 'https://images.unsplash.com/photo-1432821596592-e2c18b78144f?auto=format&fit=crop&w=800&q=80';
                }
            }

            // Auto-categorize if still default
            let cat = 'Other';
            if (formData.link.includes('youtube') || formData.link.includes('youtu.be')) cat = 'YouTube';
            else if (formData.link.includes('spotify')) cat = 'Song'; // Correction: Spotify usually implies Song
            else cat = 'Read'; // Default for generic links

            setFormData(prev => ({
                ...prev,
                image: foundImage, // Always update image
                title: prev.title || foundTitle || '', // Keep user title if exists, else use found title
                description: foundDesc || '',
                category: prev.category === 'Other' ? cat : prev.category
            }));

            setPreviewImage(foundImage);
        };

        const timer = setTimeout(fetchMetadata, 800); // Debounce
        return () => clearTimeout(timer);
    }, [formData.link]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onAdd(formData);
        onClose();
        setFormData({ link: '', title: '', category: 'Other', isPublic: false, image: '', description: '' });
        setPreviewImage(null);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>New Recommendation</h2>
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

                    {formData.image && (
                        <div className="link-preview-container" style={{ marginBottom: '1.25rem' }}>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Preview</label>
                            <RecommendationCard
                                item={{
                                    ...formData,
                                    id: 'preview',
                                    type: formData.isPublic ? 'public' : 'friends'
                                }}
                                isOwner={false} // Preview mode
                            />
                        </div>
                    )}

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
                                onChange={e => setFormData({ ...formData, isPublic: e.target.checked })}
                            />
                            <span className="slider round"></span>
                        </label>
                    </div>

                    <button type="submit" className="submit-btn">Post</button>
                </form>
            </div>
        </div>
    );
};

export default AddModal;
