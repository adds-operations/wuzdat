import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signInWithPopup, signInWithRedirect, getRedirectResult, signOut } from 'firebase/auth';
import { auth, googleProvider } from '../firebaseClient';
import { ensureUserProfile } from '../services/friendsService';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

// Detect if the app is running inside an in-app browser (Instagram, TikTok, etc.)
const isInAppBrowser = () => {
    const ua = navigator.userAgent || navigator.vendor || '';
    return /FBAN|FBAV|Instagram|Line|Twitter|Snapchat|TikTok|Musical|BytedanceWebview|MicroMessenger|WeChat/i.test(ua);
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!auth) {
            setLoading(false);
            return;
        }

        // Handle redirect result (for in-app browser sign-in)
        getRedirectResult(auth).catch((error) => {
            console.error('Redirect sign-in error:', error);
        });

        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            setUser(firebaseUser);
            if (firebaseUser) {
                // Auto-create user profile in Firestore on first login
                await ensureUserProfile(firebaseUser);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const signInWithGoogle = async () => {
        if (!auth || !googleProvider) {
            console.error('Firebase Auth not configured');
            return;
        }
        try {
            if (isInAppBrowser()) {
                // In-app browsers block popups — use redirect instead
                await signInWithRedirect(auth, googleProvider);
            } else {
                await signInWithPopup(auth, googleProvider);
            }
        } catch (error) {
            console.error('Google sign-in error:', error);
            // Fallback: if popup fails (e.g. blocked), try redirect
            if (error.code === 'auth/popup-blocked' || error.code === 'auth/cancelled-popup-request') {
                await signInWithRedirect(auth, googleProvider);
            } else {
                throw error;
            }
        }
    };

    const logout = async () => {
        if (!auth) return;
        try {
            await signOut(auth);
        } catch (error) {
            console.error('Sign-out error:', error);
            throw error;
        }
    };

    const value = {
        user,
        loading,
        signInWithGoogle,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
