import React, { useState, useMemo, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { Film, Music, Youtube, Globe, BookOpen, Book } from 'lucide-react';
import './CatchUp.css';

// Sparkle particles
const SPARKLES = Array.from({ length: 14 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${50 + Math.random() * 50}%`,
    duration: `${3 + Math.random() * 4}s`,
    delay: `${Math.random() * 5}s`,
    size: `${2 + Math.random() * 2}px`,
}));

const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
};

const getCategoryIcon = (cat) => {
    if (!cat) return null;
    switch (cat.toLowerCase()) {
        case 'movies': return <Film size={12} />;
        case 'song': case 'songs': return <Music size={12} />;
        case 'youtube': return <Youtube size={12} />;
        case 'book': return <Book size={12} />;
        case 'read': return <BookOpen size={12} />;
        default: return <Globe size={12} />;
    }
};

const SWIPE_THRESHOLD = 80;
const VISIBLE_STACK = 4;

const CatchUp = ({
    recs = [],
    friendIds = [],
}) => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('friends');
    const [topIndex, setTopIndex] = useState(0);
    const [swipedDir, setSwipedDir] = useState(null);
    const dragRef = useRef({ isDragging: false, startX: 0, currentX: 0, didDrag: false });
    const cardRef = useRef(null);

    const friendRecs = useMemo(() => {
        if (!user) return [];
        return recs.filter(item => {
            if (!friendIds.includes(item.userId)) return false;
            if (item.taggedFriendIds && item.taggedFriendIds.length > 0) {
                return item.taggedFriendIds.includes(user.uid);
            }
            return true;
        });
    }, [recs, friendIds, user]);

    const publicRecs = useMemo(() => {
        return recs.filter(item => item.type === 'public').slice(0, 5);
    }, [recs]);

    const displayRecs = activeTab === 'friends' ? friendRecs : publicRecs;
    const remaining = displayRecs.length - topIndex;
    const firstName = user?.displayName?.split(' ')[0] || 'there';

    const handleTabSwitch = useCallback((tab) => {
        setActiveTab(tab);
        setTopIndex(0);
        setSwipedDir(null);
    }, []);

    // ─── Drag Handlers ───
    const getClientPos = (e) => {
        if (e.touches) return { x: e.touches[0].clientX };
        return { x: e.clientX };
    };

    const onDragStart = useCallback((e) => {
        if (e.target.closest('button, a')) return;
        const { x } = getClientPos(e);
        dragRef.current = { isDragging: true, startX: x, currentX: 0, didDrag: false };
        if (cardRef.current) cardRef.current.classList.add('dragging');
    }, []);

    const onDragMove = useCallback((e) => {
        if (!dragRef.current.isDragging) return;
        const { x } = getClientPos(e);
        const deltaX = x - dragRef.current.startX;
        dragRef.current.currentX = deltaX;
        if (Math.abs(deltaX) > 5) dragRef.current.didDrag = true;

        if (cardRef.current) {
            const rotation = deltaX * 0.08;
            const opacity = Math.max(0.4, 1 - Math.abs(deltaX) / 400);
            cardRef.current.style.transform = `translateX(${deltaX}px) rotate(${rotation}deg)`;
            cardRef.current.style.opacity = opacity;
        }
    }, []);

    const onDragEnd = useCallback(() => {
        if (!dragRef.current.isDragging) return;
        dragRef.current.isDragging = false;
        const deltaX = dragRef.current.currentX;

        if (cardRef.current) cardRef.current.classList.remove('dragging');

        if (Math.abs(deltaX) > SWIPE_THRESHOLD) {
            const dir = deltaX > 0 ? 'right' : 'left';
            setSwipedDir(dir);
            setTimeout(() => {
                setTopIndex(prev => prev + 1);
                setSwipedDir(null);
                if (cardRef.current) {
                    cardRef.current.style.transform = '';
                    cardRef.current.style.opacity = '';
                }
            }, 400);
        } else {
            if (cardRef.current) {
                cardRef.current.style.transform = '';
                cardRef.current.style.opacity = '';
            }
        }
    }, []);

    const handleCardTap = useCallback((link) => {
        if (!dragRef.current.didDrag && link) {
            window.open(link, '_blank');
        }
    }, []);

    const visibleCards = displayRecs.slice(topIndex, topIndex + VISIBLE_STACK);

    return (
        <div className="catchup-page">
            {/* Flowy Gradient Background */}
            <div className="catchup-flowy-bg" />
            
            {/* Dither dot pattern over the gradient */}
            <div className="catchup-dither" />
            
            {/* Grain texture */}
            <div className="catchup-grain" />

            {/* Sparkle particles */}
            <div className="catchup-particles">
                {SPARKLES.map(s => (
                    <span
                        key={s.id}
                        className="sparkle"
                        style={{
                            left: s.left,
                            top: s.top,
                            width: s.size,
                            height: s.size,
                            '--duration': s.duration,
                            '--delay': s.delay,
                        }}
                    />
                ))}
            </div>

            {/* Greeting */}
            <header className="catchup-header">
                <h1 className="catchup-greeting">
                    {getGreeting()}, {firstName} 👋
                </h1>
                <p className="catchup-tagline">
                    {activeTab === 'friends'
                        ? 'fresh picks from your circle'
                        : 'trending across the community'}
                </p>
            </header>

            {remaining > 0 && (
                <div className="catchup-count">
                    <span>{remaining}</span> {remaining === 1 ? 'card' : 'cards'} remaining
                </div>
            )}

            {/* Card Deck */}
            <div className="catchup-deck-container">
                {visibleCards.length > 0 ? (
                    <div className="catchup-deck">
                        {[...visibleCards].reverse().map((item, reversedIdx) => {
                            const stackIdx = visibleCards.length - 1 - reversedIdx;
                            const isTop = stackIdx === 0;
                            const translateY = stackIdx * 10;
                            const scale = 1 - stackIdx * 0.035;
                            const zIndex = VISIBLE_STACK - stackIdx;
                            const brightness = 1 - stackIdx * 0.15;

                            return (
                                <div
                                    key={item.id}
                                    ref={isTop ? cardRef : null}
                                    className={`poster-card ${isTop && swipedDir ? `swiped-${swipedDir}` : ''}`}
                                    style={{
                                        transform: `translateY(${translateY}px) scale(${scale})`,
                                        zIndex,
                                        filter: isTop ? 'none' : `brightness(${brightness})`,
                                        pointerEvents: isTop ? 'auto' : 'none',
                                    }}
                                    onMouseDown={isTop ? onDragStart : undefined}
                                    onMouseMove={isTop ? onDragMove : undefined}
                                    onMouseUp={isTop ? () => { onDragEnd(); handleCardTap(item.link); } : undefined}
                                    onMouseLeave={isTop ? onDragEnd : undefined}
                                    onTouchStart={isTop ? onDragStart : undefined}
                                    onTouchMove={isTop ? onDragMove : undefined}
                                    onTouchEnd={isTop ? () => { onDragEnd(); handleCardTap(item.link); } : undefined}
                                >
                                    <div className="poster-image-wrap">
                                        {item.image ? (
                                            <img
                                                src={item.image}
                                                alt={item.title}
                                                className="poster-image"
                                                draggable={false}
                                            />
                                        ) : (
                                            <div className="poster-placeholder" />
                                        )}
                                        <div className="poster-gradient" />
                                        <div className="poster-title-area">
                                            {item.category && (
                                                <div className="poster-category">
                                                    {getCategoryIcon(item.category)}
                                                    {item.category}
                                                </div>
                                            )}
                                            <h3 className="poster-title">{item.title}</h3>
                                            {item.author && (
                                                <div className="poster-author">
                                                    {item.author.avatar && (
                                                        <img
                                                            src={item.author.avatar}
                                                            alt=""
                                                            className="poster-author-avatar"
                                                            draggable={false}
                                                        />
                                                    )}
                                                    <span className="poster-author-name">
                                                        {item.author.name}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        <span className="poster-tap-hint">tap to open</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="catchup-empty">
                        <span className="catchup-empty-icon">
                            {remaining <= 0 && topIndex > 0 ? '🎉' : activeTab === 'friends' ? '📭' : '✨'}
                        </span>
                        <h3>
                            {remaining <= 0 && topIndex > 0
                                ? 'All caught up!'
                                : activeTab === 'friends'
                                    ? 'No new picks'
                                    : 'Nothing new yet'}
                        </h3>
                        <p>
                            {remaining <= 0 && topIndex > 0
                                ? "You've gone through everything. Check back later for more."
                                : activeTab === 'friends'
                                    ? 'No new picks from your friends right now. Check back soon!'
                                    : 'The community is quiet for now. Come back later.'}
                        </p>
                    </div>
                )}
            </div>

            {visibleCards.length > 0 && (
                <div className="catchup-swipe-instruction">
                    ← swipe to go through · tap to open →
                </div>
            )}

            {/* Bottom Toggle */}
            <div className="catchup-toggle-bar">
                <div className="catchup-toggle">
                    <button
                        className={`catchup-toggle-btn ${activeTab === 'friends' ? 'active' : ''}`}
                        onClick={() => handleTabSwitch('friends')}
                    >
                        Friends
                    </button>
                    <button
                        className={`catchup-toggle-btn ${activeTab === 'public' ? 'active' : ''}`}
                        onClick={() => handleTabSwitch('public')}
                    >
                        Public
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CatchUp;
