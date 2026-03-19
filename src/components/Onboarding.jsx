import React, { useState } from 'react';
import { Share2, Users, Heart, CheckCircle, ArrowRight, Sparkles } from 'lucide-react';
import './Onboarding.css';

const STEPS = [
    {
        icon: <Sparkles size={40} />,
        title: 'Welcome to wuzdat!',
        subtitle: 'Your taste, shared.',
        description: 'Discover great recommendations from people you trust — movies, songs, books, and more.',
        accent: '#FF004D',
    },
    {
        icon: <Share2 size={40} />,
        title: 'Share what you love',
        subtitle: 'Post recommendations',
        description: 'Found something amazing? Share it with everyone or keep it just for your friends.',
        accent: '#ff6b9d',
    },
    {
        icon: <Users size={40} />,
        title: 'Connect with friends',
        subtitle: 'Build your circle',
        description: 'Add friends to see their recommendations and share yours privately with people who matter.',
        accent: '#10b981',
    },
    {
        icon: <Heart size={40} />,
        title: 'Like & Complete',
        subtitle: 'Track your journey',
        description: 'Like the best recs and mark them completed when you\'ve watched, read, or listened. Never forget a recommendation!',
        accent: '#f59e0b',
    },
];

const Onboarding = ({ user, onComplete }) => {
    const [step, setStep] = useState(0);

    const isLast = step === STEPS.length - 1;
    const current = STEPS[step];

    const handleNext = () => {
        if (isLast) {
            localStorage.setItem('wuzdat_onboarded', 'true');
            onComplete();
        } else {
            setStep(step + 1);
        }
    };

    const handleSkip = () => {
        localStorage.setItem('wuzdat_onboarded', 'true');
        onComplete();
    };

    return (
        <div className="onboarding-overlay">
            <div className="onboarding-card">
                {/* Progress dots */}
                <div className="onboarding-dots">
                    {STEPS.map((_, i) => (
                        <div
                            key={i}
                            className={`onboarding-dot ${i === step ? 'active' : ''} ${i < step ? 'done' : ''}`}
                            style={i === step ? { background: current.accent } : {}}
                        />
                    ))}
                </div>

                {/* Content */}
                <div className="onboarding-content" key={step}>
                    <div className="onboarding-icon" style={{ color: current.accent }}>
                        {current.icon}
                    </div>

                    {step === 0 && user?.photoURL && (
                        <img src={user.photoURL} alt="" className="onboarding-avatar" />
                    )}

                    <h2 className="onboarding-title">
                        {step === 0 ? `Hey ${user?.displayName?.split(' ')[0] || 'there'}!` : current.title}
                    </h2>
                    <p className="onboarding-subtitle">{current.subtitle}</p>
                    <p className="onboarding-desc">{current.description}</p>
                </div>

                {/* Actions */}
                <div className="onboarding-actions">
                    <button
                        className="onboarding-next"
                        onClick={handleNext}
                        style={{ background: current.accent }}
                    >
                        {isLast ? (
                            <>
                                <CheckCircle size={18} />
                                Let's Go!
                            </>
                        ) : (
                            <>
                                Next
                                <ArrowRight size={18} />
                            </>
                        )}
                    </button>

                    {!isLast && (
                        <button className="onboarding-skip" onClick={handleSkip}>
                            Skip
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Onboarding;
