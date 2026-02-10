import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Profile from './pages/Profile';
import { MOCK_RECS } from './data/mockData';

function App() {
    const [recs, setRecs] = useState(MOCK_RECS);
    const [likedRecIds, setLikedRecIds] = useState([]);
    const [completedRecIds, setCompletedRecIds] = useState([]);
    const [isFocusMode, setIsFocusMode] = useState(false);

    const handleAddRec = (newRec) => {
        const rec = {
            id: Date.now(),
            image: "", // Placeholder
            ...newRec,
            type: newRec.isPublic ? 'public' : 'friends',
            userId: 'me' // identification for profile page
        };
        setRecs([rec, ...recs]);
    };

    const handleDeleteRec = (id) => {
        setRecs(recs.filter(r => r.id !== id));
    };

    const handleEditRec = (id, updatedFields) => {
        setRecs(recs.map(r => r.id === id ? { ...r, ...updatedFields } : r));
    };

    const toggleLike = (id) => {
        setLikedRecIds(prev =>
            prev.includes(id) ? prev.filter(lid => lid !== id) : [...prev, id]
        );
    };

    const toggleCompleted = (id) => {
        setCompletedRecIds(prev =>
            prev.includes(id) ? prev.filter(cid => cid !== id) : [...prev, id]
        );
    };

    return (
        <BrowserRouter>
            <div className="app">
                <Navbar isFocusMode={isFocusMode} onToggleFocus={() => setIsFocusMode(!isFocusMode)} />
                <Routes>
                    <Route path="/" element={
                        <Home
                            feedType="public"
                            recs={recs}
                            onAddRec={handleAddRec}
                            likedRecIds={likedRecIds}
                            onToggleLike={toggleLike}
                            completedRecIds={completedRecIds}
                            onToggleCompleted={toggleCompleted}
                            isFocusMode={isFocusMode}
                        />
                    } />
                    <Route path="/friends" element={
                        <Home
                            feedType="friends"
                            recs={recs}
                            onAddRec={handleAddRec}
                            likedRecIds={likedRecIds}
                            onToggleLike={toggleLike}
                            completedRecIds={completedRecIds}
                            onToggleCompleted={toggleCompleted}
                            isFocusMode={isFocusMode}
                        />
                    } />
                    <Route path="/completed" element={
                        <Home
                            feedType="completed"
                            recs={recs}
                            onAddRec={handleAddRec}
                            likedRecIds={likedRecIds}
                            onToggleLike={toggleLike}
                            completedRecIds={completedRecIds}
                            onToggleCompleted={toggleCompleted}
                            isFocusMode={isFocusMode}
                        />
                    } />
                    <Route path="/liked" element={
                        <Home
                            feedType="liked"
                            recs={recs}
                            onAddRec={handleAddRec}
                            likedRecIds={likedRecIds}
                            onToggleLike={toggleLike}
                            completedRecIds={completedRecIds}
                            onToggleCompleted={toggleCompleted}
                            isFocusMode={isFocusMode}
                        />
                    } />
                    <Route path="/profile" element={
                        <Profile
                            recs={recs}
                            onDelete={handleDeleteRec}
                            onEdit={handleEditRec}
                            likedRecIds={likedRecIds}
                            onToggleLike={toggleLike}
                            completedRecIds={completedRecIds}
                            onToggleCompleted={toggleCompleted}
                        />
                    } />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </div>
        </BrowserRouter>
    );
}

export default App;
