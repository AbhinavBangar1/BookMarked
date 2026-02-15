import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { IoBookSharp } from 'react-icons/io5';
import { HiUser } from 'react-icons/hi';
import '../pages/AuthPage.css';

function ProfileCompletionModal() {
    const [username, setUsername] = useState('');
    const [modalLoading, setModalLoading] = useState(false);
    const [modalError, setModalError] = useState('');
    const { user, needsProfileCompletion, updateProfile } = useAuth();

    // Don't render if profile is complete or user is not logged in
    if (!user || !needsProfileCompletion) return null;

    const handleComplete = async (e) => {
        e.preventDefault();
        if (!username.trim()) {
            setModalError('Username is required');
            return;
        }
        setModalLoading(true);
        setModalError('');

        const { error } = await updateProfile(username.trim(), user.email);
        if (error) {
            setModalError(error.message || 'Failed to save profile. Username may already be taken.');
        }
        setModalLoading(false);
    };

    return (
        <div className="profile-modal-overlay">
            <div className="auth-background">
                <div className="auth-gradient-orb orb-1"></div>
                <div className="auth-gradient-orb orb-2"></div>
                <div className="auth-gradient-orb orb-3"></div>
            </div>
            <div className="profile-modal">
                <div className="auth-logo">
                    <IoBookSharp className="auth-logo-icon" />
                    <span className="auth-logo-text">ZReads</span>
                </div>
                <h2 className="auth-title">Complete Your Profile</h2>
                <p className="auth-subtitle">Choose a username to get started</p>

                <form onSubmit={handleComplete} className="auth-form">
                    <div className="input-group">
                        <HiUser className="input-icon" />
                        <input
                            type="text"
                            placeholder="Choose a username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            minLength={3}
                            maxLength={30}
                            autoFocus
                        />
                    </div>

                    {modalError && <div className="auth-error">{modalError}</div>}

                    <button
                        type="submit"
                        className="auth-submit-btn"
                        disabled={modalLoading}
                    >
                        {modalLoading ? 'Saving...' : 'Continue'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default ProfileCompletionModal;
