import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FcGoogle } from 'react-icons/fc';
import { IoBookSharp } from 'react-icons/io5';
import { HiMail, HiLockClosed, HiEye, HiEyeOff, HiUser } from 'react-icons/hi';
import './AuthPage.css';

function AuthPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const { signIn, signUp, signInWithGoogle, user, needsProfileCompletion } = useAuth();
    const navigate = useNavigate();

    // Redirect if already logged in AND profile is complete
    useEffect(() => {
        if (user && !needsProfileCompletion) {
            navigate('/');
        }
    }, [user, needsProfileCompletion, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);

        try {
            if (isLogin) {
                const { error } = await signIn(email, password);
                if (error) throw error;
                navigate('/');
            } else {
                if (!username.trim()) {
                    throw new Error('Username is required');
                }
                // Username is stored in user_metadata, profile row
                // will be created automatically by syncProfileToUsersTable
                const { error } = await signUp(email, password, username.trim());
                if (error) throw error;

                setMessage('Account created successfully!');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setError('');
        const { error } = await signInWithGoogle();
        if (error) {
            setError(error.message);
        }
    };

    // Don't render the form if user is logged in (will redirect or show modal)
    if (user) return null;

    return (
        <div className="auth-page">
            <div className="auth-background">
                <div className="auth-gradient-orb orb-1"></div>
                <div className="auth-gradient-orb orb-2"></div>
                <div className="auth-gradient-orb orb-3"></div>
            </div>

            <div className="auth-container">
                <div className="auth-card">
                    {/* Logo */}
                    <div className="auth-logo">
                        <IoBookSharp className="auth-logo-icon" />
                        <span className="auth-logo-text">BookMarked</span>
                    </div>

                    {/* Title */}
                    <h1 className="auth-title">
                        {isLogin ? 'Welcome Back' : 'Create Account'}
                    </h1>
                    <p className="auth-subtitle">
                        {isLogin
                            ? 'Log in to continue your reading journey'
                            : 'Join the community of book lovers'}
                    </p>

                    {/* Google Sign In */}
                    <button
                        className="google-btn"
                        onClick={handleGoogleSignIn}
                        type="button"
                    >
                        <FcGoogle className="google-icon" />
                        <span>Continue with Google</span>
                    </button>

                    {/* Divider */}
                    <div className="auth-divider">
                        <span>or</span>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="auth-form">
                        {/* Username field - only on sign up */}
                        {!isLogin && (
                            <div className="input-group">
                                <HiUser className="input-icon" />
                                <input
                                    type="text"
                                    placeholder="Username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                    minLength={3}
                                    maxLength={30}
                                />
                            </div>
                        )}

                        <div className="input-group">
                            <HiMail className="input-icon" />
                            <input
                                type="email"
                                placeholder="Email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="input-group">
                            <HiLockClosed className="input-icon" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <HiEyeOff /> : <HiEye />}
                            </button>
                        </div>

                        {error && <div className="auth-error">{error}</div>}
                        {message && <div className="auth-success">{message}</div>}

                        <button
                            type="submit"
                            className="auth-submit-btn"
                            disabled={loading}
                        >
                            {loading
                                ? 'Please wait...'
                                : isLogin ? 'Log In' : 'Create Account'}
                        </button>
                    </form>

                    {/* Toggle */}
                    <p className="auth-toggle">
                        {isLogin ? "Don't have an account? " : 'Already have an account? '}
                        <button
                            type="button"
                            onClick={() => {
                                setIsLogin(!isLogin);
                                setError('');
                                setMessage('');
                                setUsername('');
                            }}
                        >
                            {isLogin ? 'Sign Up' : 'Log In'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default AuthPage;
