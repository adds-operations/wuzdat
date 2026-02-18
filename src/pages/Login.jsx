import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Film, Music, BookOpen, Youtube, Podcast, Tv } from 'lucide-react';
import './Login.css';

const GoogleIcon = () => (
    <svg width="20" height="20" viewBox="0 0 48 48">
        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
);

const Login = () => {
    const { user, signInWithGoogle } = useAuth();
    const [error, setError] = useState(null);
    const [signingIn, setSigningIn] = useState(false);

    if (user) {
        return <Navigate to="/" replace />;
    }

    const handleSignIn = async () => {
        setError(null);
        setSigningIn(true);
        try {
            await signInWithGoogle();
        } catch (err) {
            setError(err.message || 'Failed to sign in. Please try again.');
        } finally {
            setSigningIn(false);
        }
    };

    return (
        <div className="login-page">
            {/* Floating category icons in background */}
            <div className="login-bg-icons">
                <Film className="bg-icon icon-1" size={28} />
                <Music className="bg-icon icon-2" size={24} />
                <BookOpen className="bg-icon icon-3" size={26} />
                <Youtube className="bg-icon icon-4" size={30} />
                <Podcast className="bg-icon icon-5" size={22} />
                <Tv className="bg-icon icon-6" size={26} />
            </div>

            <div className="login-container">
                <div className="login-badge">✨ Your taste, shared</div>

                <h1 className="login-logo">wuzdat</h1>

                <p className="login-headline">
                    A place to find<br />
                    <span className="highlight">good recommendations</span><br />
                    for everything.
                </p>

                <p className="login-subtitle">
                    Movies, songs, books, shows, podcasts — discover what your friends love and share what you can't stop talking about.
                </p>

                <button
                    className="google-btn"
                    onClick={handleSignIn}
                    disabled={signingIn}
                >
                    <GoogleIcon />
                    {signingIn ? 'Signing in...' : 'Continue with Google'}
                </button>

                {error && <div className="login-error">{error}</div>}

                <p className="login-footer">
                    By signing in, you agree to our Terms of Service
                </p>
            </div>
        </div>
    );
};

export default Login;
