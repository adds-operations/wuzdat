import React, { useState, useMemo } from 'react';
import FilterBar from '../components/FilterBar';
import RecommendationCard from '../components/RecommendationCard';
import { Plus, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AddModal from '../components/AddModal';
import AddFriendModal from '../components/AddFriendModal';
import './Home.css';

const Home = ({ feedType = 'public', recs, onAddRec, likedRecIds = [], onToggleLike, completedRecIds = [], onToggleCompleted, isFocusMode = false, friendIds = [], onFriendsChanged }) => {
    const { user } = useAuth();
    const [activeFilter, setActiveFilter] = useState('All');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isFriendModalOpen, setIsFriendModalOpen] = useState(false);

    const filteredRecs = useMemo(() => {
        return recs.filter(item => {
            let typeMatch = true;
            if (feedType === 'public') {
                typeMatch = item.type === 'public' && !completedRecIds.includes(item.id);
            } else if (feedType === 'friends') {
                // Show posts from friends (both public and friends-only) + own posts
                const isFriend = friendIds.includes(item.userId);
                const isOwn = item.userId === user?.uid;
                typeMatch = (isFriend || isOwn || item.type === 'public') && !completedRecIds.includes(item.id);
            } else if (feedType === 'liked') {
                typeMatch = likedRecIds.includes(item.id);
            } else if (feedType === 'completed') {
                typeMatch = completedRecIds.includes(item.id);
            }

            if (!typeMatch) return false;
            if (activeFilter === 'All') return true;
            return item.category === activeFilter;
        });
    }, [activeFilter, feedType, recs, likedRecIds, completedRecIds, friendIds, user]);

    return (
        <div className="home-page">
            <FilterBar activeFilter={activeFilter} onFilterChange={setActiveFilter} />

            <main className="container main-content">
                <div className={`masonry-grid ${isFocusMode ? 'focus-mode' : ''}`}>
                    {filteredRecs.map(item => (
                        <RecommendationCard
                            key={item.id}
                            item={item}
                            isLiked={likedRecIds.includes(item.id)}
                            onToggleLike={onToggleLike}
                            isCompleted={completedRecIds.includes(item.id)}
                            onToggleCompleted={onToggleCompleted}
                            feedType={feedType}
                            currentUserId={user?.uid}
                            friendIds={friendIds}
                            onFriendsChanged={onFriendsChanged}
                        />
                    ))}
                </div>
            </main>

            <div className="fab-container">
                <button className="fab secondary" aria-label="Add Friend" onClick={() => setIsFriendModalOpen(true)}>
                    <UserPlus size={20} />
                </button>
                <button className="fab" aria-label="Add Recommendation" onClick={() => setIsModalOpen(true)}>
                    <Plus size={24} />
                </button>
            </div>

            <AddModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onAdd={onAddRec}
            />

            <AddFriendModal
                isOpen={isFriendModalOpen}
                onClose={() => setIsFriendModalOpen(false)}
                onFriendsChanged={onFriendsChanged}
            />
        </div>
    );
};

export default Home;
