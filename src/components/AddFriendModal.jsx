import React, { useState } from 'react';
import { X, Mail, Link, Check, Copy } from 'lucide-react';
import './AddModal.css'; // Re-use overlay styles
import './AddFriendModal.css';

const AddFriendModal = ({ isOpen, onClose }) => {
    const [email, setEmail] = useState('');
    const [inviteSent, setInviteSent] = useState(false);
    const [linkCopied, setLinkCopied] = useState(false);

    const inviteLink = "https://recshare.app/invite/u/me-123";

    if (!isOpen) return null;

    const handleSendInvite = (e) => {
        e.preventDefault();
        if (email) {
            console.log("Inviting:", email);
            setInviteSent(true);
            setTimeout(() => setInviteSent(false), 3000);
            setEmail('');
        }
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(inviteLink);
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 2000);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="friend-modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Add Friends</h2>
                    <button className="close-btn" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <div className="modal-section">
                    <h3>Invite by Email</h3>
                    <form onSubmit={handleSendInvite}>
                        <div className="invite-row">
                            <input
                                type="email"
                                placeholder="friend@example.com"
                                className="invite-input"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                            <button type="submit" className="invite-btn">
                                {inviteSent ? <Check size={18} /> : 'Send'}
                            </button>
                        </div>
                        {inviteSent && <p className="success-msg"><Check size={14} /> Invite sent!</p>}
                    </form>
                </div>

                <div className="modal-section">
                    <h3>Copy Link</h3>
                    <div className="copy-link-container">
                        <span className="link-text">{inviteLink}</span>
                        <button className="copy-btn" onClick={handleCopyLink}>
                            {linkCopied ? 'Copied' : 'Copy'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddFriendModal;
