import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Toast from './components/Toast';

import { db } from './firebaseClient';
import { getFriendIds } from './services/friendsService';
import { AuthProvider, useAuth } from './context/AuthContext';
import {
    collection,
    getDocs,
    addDoc,
    deleteDoc,
    updateDoc,
    doc,
    query,
    orderBy,
    serverTimestamp
} from 'firebase/firestore';

// Wrapper that redirects to /login if not authenticated
const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return null;
    if (!user) return <Navigate to="/login" replace />;
    return children;
};

function AppContent() {
    const { user } = useAuth();
    const [recs, setRecs] = useState([]);
    const [likedRecIds, setLikedRecIds] = useState([]);
    const [completedRecIds, setCompletedRecIds] = useState([]);
    const [toastMessage, setToastMessage] = useState('');
    const [isToastVisible, setIsToastVisible] = useState(false);
    const [friendIds, setFriendIds] = useState([]);
    const [isFocusMode, setIsFocusMode] = useState(false);
    const [loading, setLoading] = useState(true);

    // Load data from Firestore on mount
    useEffect(() => {
        const loadData = async () => {
            if (!db) {
                setLoading(false);
                return;
            }

            try {
                // Fetch recommendations
                const recsQuery = query(collection(db, 'recommendations'), orderBy('created_at', 'desc'));
                const recsSnap = await getDocs(recsQuery);
                const recsData = recsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

                // Fetch likes
                const likesSnap = await getDocs(collection(db, 'likes'));
                const likedIds = likesSnap.docs.map(d => d.data().rec_id);

                // Fetch completed
                const completedSnap = await getDocs(collection(db, 'completed'));
                const completedIds = completedSnap.docs.map(d => d.data().rec_id);

                // Fetch friend IDs
                const fIds = user ? await getFriendIds(user.uid) : [];

                setRecs(recsData);
                setLikedRecIds(likedIds);
                setCompletedRecIds(completedIds);
                setFriendIds(fIds);
            } catch (err) {
                console.error('Error loading data:', err);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [user]);

    const refreshFriends = useCallback(async () => {
        if (user) {
            const fIds = await getFriendIds(user.uid);
            setFriendIds(fIds);
        }
    }, [user]);

    const handleAddRec = useCallback(async (newRec) => {
        const rec = {
            title: newRec.title,
            category: newRec.category,
            image: newRec.image || '',
            link: newRec.link,
            description: newRec.description || '',
            type: newRec.isPublic ? 'public' : 'friends',
            created_at: serverTimestamp(),
            // Attach the authenticated user's info
            userId: user?.uid || 'anonymous',
            author: {
                id: user?.uid || 'anonymous',
                name: user?.displayName || 'Anonymous',
                avatar: user?.photoURL || '',
            },
        };

        if (db) {
            try {
                const docRef = await addDoc(collection(db, 'recommendations'), rec);
                setRecs(prev => [{
                    id: docRef.id,
                    ...rec,
                    created_at: new Date().toISOString()
                }, ...prev]);
                setToastMessage('Thanks for sharing! 🎉');
                setIsToastVisible(true);
            } catch (err) {
                console.error('Error adding rec:', err);
            }
        } else {
            const fallbackRec = { id: String(Date.now()), ...rec };
            setRecs(prev => [fallbackRec, ...prev]);
        }
    }, [user]);

    const handleDeleteRec = useCallback(async (id) => {
        if (db) {
            try {
                await deleteDoc(doc(db, 'recommendations', id));
                // Also clean up any likes/completed for this rec
                const likesSnap = await getDocs(collection(db, 'likes'));
                for (const likeDoc of likesSnap.docs) {
                    if (likeDoc.data().rec_id === id) {
                        await deleteDoc(doc(db, 'likes', likeDoc.id));
                    }
                }
                const completedSnap = await getDocs(collection(db, 'completed'));
                for (const compDoc of completedSnap.docs) {
                    if (compDoc.data().rec_id === id) {
                        await deleteDoc(doc(db, 'completed', compDoc.id));
                    }
                }
            } catch (err) {
                console.error('Error deleting rec:', err);
                return;
            }
        }
        setRecs(prev => prev.filter(r => r.id !== id));
        setLikedRecIds(prev => prev.filter(lid => lid !== id));
        setCompletedRecIds(prev => prev.filter(cid => cid !== id));
    }, []);

    const handleEditRec = useCallback(async (id, updatedFields) => {
        if (db) {
            try {
                await updateDoc(doc(db, 'recommendations', id), updatedFields);
            } catch (err) {
                console.error('Error editing rec:', err);
                return;
            }
        }
        setRecs(prev => prev.map(r => r.id === id ? { ...r, ...updatedFields } : r));
    }, []);

    const toggleLike = useCallback(async (id) => {
        const isLiked = likedRecIds.includes(id);

        if (db) {
            try {
                if (isLiked) {
                    // Find and delete the like doc
                    const likesSnap = await getDocs(collection(db, 'likes'));
                    for (const likeDoc of likesSnap.docs) {
                        if (likeDoc.data().rec_id === id) {
                            await deleteDoc(doc(db, 'likes', likeDoc.id));
                            break;
                        }
                    }
                } else {
                    await addDoc(collection(db, 'likes'), { rec_id: id, created_at: serverTimestamp() });
                }
            } catch (err) {
                console.error('Error toggling like:', err);
                return;
            }
        }

        setLikedRecIds(prev =>
            isLiked ? prev.filter(lid => lid !== id) : [...prev, id]
        );
    }, [likedRecIds]);

    const toggleCompleted = useCallback(async (id) => {
        const isCompleted = completedRecIds.includes(id);

        if (db) {
            try {
                if (isCompleted) {
                    const compSnap = await getDocs(collection(db, 'completed'));
                    for (const compDoc of compSnap.docs) {
                        if (compDoc.data().rec_id === id) {
                            await deleteDoc(doc(db, 'completed', compDoc.id));
                            break;
                        }
                    }
                } else {
                    await addDoc(collection(db, 'completed'), { rec_id: id, created_at: serverTimestamp() });
                }
            } catch (err) {
                console.error('Error toggling completed:', err);
                return;
            }
        }

        setCompletedRecIds(prev =>
            isCompleted ? prev.filter(cid => cid !== id) : [...prev, id]
        );
    }, [completedRecIds]);

    if (loading) {
        return (
            <>
                <Navbar isFocusMode={isFocusMode} onToggleFocus={() => setIsFocusMode(!isFocusMode)} />
                <Toast
                    message={toastMessage}
                    isVisible={isToastVisible}
                    onClose={() => setIsToastVisible(false)}
                />
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '60vh',
                    color: 'var(--text-secondary, #888)',
                    fontSize: '1.1rem'
                }}>
                    Loading...
                </div>
            </>
        );
    }

    return (
        <div className="app">
            <Navbar isFocusMode={isFocusMode} onToggleFocus={() => setIsFocusMode(!isFocusMode)} />
            <Toast
                message={toastMessage}
                isVisible={isToastVisible}
                onClose={() => setIsToastVisible(false)}
            />
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={
                    <ProtectedRoute>
                        <Home
                            feedType="public"
                            recs={recs}
                            onAddRec={handleAddRec}
                            likedRecIds={likedRecIds}
                            onToggleLike={toggleLike}
                            completedRecIds={completedRecIds}
                            onToggleCompleted={toggleCompleted}
                            isFocusMode={isFocusMode}
                            friendIds={friendIds}
                            onFriendsChanged={refreshFriends}
                        />
                    </ProtectedRoute>
                } />
                <Route path="/friends" element={
                    <ProtectedRoute>
                        <Home
                            feedType="friends"
                            recs={recs}
                            onAddRec={handleAddRec}
                            likedRecIds={likedRecIds}
                            onToggleLike={toggleLike}
                            completedRecIds={completedRecIds}
                            onToggleCompleted={toggleCompleted}
                            isFocusMode={isFocusMode}
                            friendIds={friendIds}
                            onFriendsChanged={refreshFriends}
                        />
                    </ProtectedRoute>
                } />
                <Route path="/completed" element={
                    <ProtectedRoute>
                        <Home
                            feedType="completed"
                            recs={recs}
                            onAddRec={handleAddRec}
                            likedRecIds={likedRecIds}
                            onToggleLike={toggleLike}
                            completedRecIds={completedRecIds}
                            onToggleCompleted={toggleCompleted}
                            isFocusMode={isFocusMode}
                            friendIds={friendIds}
                            onFriendsChanged={refreshFriends}
                        />
                    </ProtectedRoute>
                } />
                <Route path="/liked" element={
                    <ProtectedRoute>
                        <Home
                            feedType="liked"
                            recs={recs}
                            onAddRec={handleAddRec}
                            likedRecIds={likedRecIds}
                            onToggleLike={toggleLike}
                            completedRecIds={completedRecIds}
                            onToggleCompleted={toggleCompleted}
                            isFocusMode={isFocusMode}
                            friendIds={friendIds}
                            onFriendsChanged={refreshFriends}
                        />
                    </ProtectedRoute>
                } />
                <Route path="/profile" element={
                    <ProtectedRoute>
                        <Profile
                            recs={recs}
                            onDelete={handleDeleteRec}
                            onEdit={handleEditRec}
                            likedRecIds={likedRecIds}
                            onToggleLike={toggleLike}
                            completedRecIds={completedRecIds}
                            onToggleCompleted={toggleCompleted}
                        />
                    </ProtectedRoute>
                } />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </div>
    );
}

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <AppContent />
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
