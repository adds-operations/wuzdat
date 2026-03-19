import React, { useRef, useCallback } from 'react';
import { Download, X, Music, Film, Youtube, Globe, BookOpen, Book } from 'lucide-react';
import './ShareCard.css';

const ShareCard = ({ item, user, isVisible, onClose }) => {
    const cardRef = useRef(null);

    const getIcon = (cat) => {
        if (!cat) return <Globe size={12} />;
        switch (cat.toLowerCase()) {
            case 'movies': return <Film size={12} />;
            case 'song': case 'songs': return <Music size={12} />;
            case 'youtube': return <Youtube size={12} />;
            case 'book': return <Book size={12} />;
            case 'read': return <BookOpen size={12} />;
            default: return <Globe size={12} />;
        }
    };

    const handleDownload = useCallback(async () => {
        if (!cardRef.current) return;

        try {
            const { default: html2canvas } = await import('html2canvas');

            // Clone the card and inline external images as data URLs to avoid CORS
            const card = cardRef.current;

            const canvas = await html2canvas(card, {
                backgroundColor: '#1a0a10', // Match card gradient start
                scale: 3,
                useCORS: true,
                logging: false,
                imageTimeout: 5000,
                onclone: (clonedDoc) => {
                    // Remove crossOrigin from cloned images to avoid tainted canvas
                    const imgs = clonedDoc.querySelectorAll('img');
                    imgs.forEach(img => {
                        img.removeAttribute('crossorigin');
                        img.removeAttribute('crossOrigin');
                    });
                },
            });

            const link = document.createElement('a');
            link.download = `wuzdat-${item.title?.replace(/[^a-z0-9]/gi, '-').toLowerCase() || 'share'}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (err) {
            console.error('Error generating share image:', err);
            // Fallback: try without CORS (may skip external images)
            try {
                const { default: html2canvas } = await import('html2canvas');
                const canvas = await html2canvas(cardRef.current, {
                    backgroundColor: '#1a0a10',
                    scale: 3,
                    useCORS: false,
                    allowTaint: true,
                    logging: false,
                });
                const link = document.createElement('a');
                link.download = `wuzdat-${item.title?.replace(/[^a-z0-9]/gi, '-').toLowerCase() || 'share'}.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();
            } catch (err2) {
                console.error('Fallback also failed:', err2);
            }
        }
    }, [item]);

    if (!isVisible || !item) return null;

    return (
        <div className="share-overlay" onClick={onClose}>
            <div className="share-confetti">🎉</div>

            <div
                className="share-card"
                ref={cardRef}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Image */}
                <div className="share-card-image-wrap">
                    {item.image ? (
                        <img
                            src={item.image}
                            alt={item.title}
                            className="share-card-image"
                        />
                    ) : (
                        <div className="share-card-image-placeholder">
                            <Globe size={48} />
                        </div>
                    )}
                    <span className="share-card-category">
                        {getIcon(item.category)}
                        {item.category}
                    </span>
                </div>

                {/* Body */}
                <div className="share-card-body">
                    <h3 className="share-card-title">{item.title}</h3>


                    <div className="share-card-divider" />

                    {/* User row */}
                    <div className="share-card-user">
                        {user?.photoURL ? (
                            <img
                                src={user.photoURL}
                                alt={user.displayName}
                                className="share-card-avatar"
                            />
                        ) : (
                            <div className="share-card-avatar-fallback">
                                {user?.displayName?.[0] || '?'}
                            </div>
                        )}
                        <div className="share-card-user-info">
                            <span className="share-card-username">{user?.displayName || 'Anonymous'}</span>
                            <span className="share-card-shared-label">shared a recommendation</span>
                        </div>
                    </div>

                    {/* Branding */}
                    <div className="share-card-branding">
                        <div className="share-card-logo">
                            <img src="/images/logo.png" alt="wuzdat" className="share-card-logo-img" />
                            <span>wuz<span>dat</span></span>
                        </div>
                        <span className="share-card-link-hint">wuzdat.web.app</span>
                    </div>
                </div>
            </div>

            {/* Action buttons */}
            <div className="share-actions" onClick={(e) => e.stopPropagation()}>
                <button className="share-action-btn download" onClick={handleDownload}>
                    <Download size={18} />
                    Save Image
                </button>
                <button className="share-action-btn close" onClick={onClose}>
                    <X size={18} />
                    Done
                </button>
            </div>
        </div>
    );
};

export default ShareCard;
