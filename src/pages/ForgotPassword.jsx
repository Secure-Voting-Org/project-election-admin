import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Eye, EyeOff } from 'lucide-react';

import logo from '../assets/logo.png';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await fetch(`http://${window.location.hostname}:8081/api/admin/forgot-password/send-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (data.success) {
                setMessage('OTP sent to your email. Please check your inbox.');
                setStep(2);
            } else {
                setError(data.error || 'Failed to send OTP');
            }
        } catch (err) {
            setError('Server connection failed.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await fetch(`http://${window.location.hostname}:8081/api/admin/forgot-password/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp })
            });

            const data = await response.json();

            if (data.success) {
                setMessage('OTP verified! Please set your new password.');
                setStep(3);
            } else {
                setError(data.error || 'Invalid OTP');
            }
        } catch (err) {
            setError('Server connection failed.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError('');

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch(`http://${window.location.hostname}:8081/api/admin/forgot-password/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp, newPassword })
            });

            const data = await response.json();

            if (data.success) {
                setMessage('Password reset successful! Redirecting to login...');
                setTimeout(() => navigate('/'), 2000);
            } else {
                setError(data.error || 'Password reset failed');
            }
        } catch (err) {
            setError('Server connection failed.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-wrapper">
            <div className="auth-card">
                {/* Visual Side */}
                <div className="auth-visual">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                        <img
                            src={logo}
                            alt="TrustBallot Logo"
                            style={{ height: '80px', width: 'auto', background: 'white', borderRadius: '12px', padding: '5px' }}
                            className="shadow-xl"
                        />
                        <div>
                            <h2 style={{ margin: 0, fontSize: '1.5rem' }}>TrustBallot</h2>
                            <p style={{ margin: 0, opacity: 0.8, fontSize: '0.9rem' }}>Admin Console</p>
                        </div>
                    </div>

                    <h1 style={{ fontSize: '2.5rem', lineHeight: 1.2, marginBottom: '1.5rem' }}>
                        Password Recovery
                    </h1>
                    <p style={{ opacity: 0.9, lineHeight: 1.6 }}>
                        Reset your admin account password using email verification.
                        An OTP will be sent to your registered email address.
                    </p>

                    <div style={{ marginTop: 'auto' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                            <div style={{
                                width: '33%', height: '4px', borderRadius: '2px',
                                background: step >= 1 ? '#F47920' : 'rgba(255,255,255,0.2)'
                            }}></div>
                            <div style={{
                                width: '33%', height: '4px', borderRadius: '2px',
                                background: step >= 2 ? '#F47920' : 'rgba(255,255,255,0.2)'
                            }}></div>
                            <div style={{
                                width: '33%', height: '4px', borderRadius: '2px',
                                background: step >= 3 ? '#F47920' : 'rgba(255,255,255,0.2)'
                            }}></div>
                        </div>
                        <p style={{ fontSize: '0.85rem', opacity: 0.8 }}>
                            Step {step} of 3: {step === 1 ? 'Email Verification' : step === 2 ? 'OTP Verification' : 'New Password'}
                        </p>
                    </div>
                </div>

                {/* Form Side */}
                <div className="auth-form">
                    <h2 style={{ marginBottom: '0.5rem', color: '#1a237e' }}>
                        {step === 1 ? 'Enter Email' : step === 2 ? 'Verify OTP' : 'Set New Password'}
                    </h2>
                    <p style={{ color: '#666', marginBottom: '2rem' }}>
                        {step === 1 ? 'Enter your registered email address' :
                            step === 2 ? 'Enter the 6-digit code sent to your email' :
                                'Create a new password for your account'}
                    </p>

                    {message && <div style={{ marginBottom: '1rem', color: '#138808', fontSize: '0.9rem', background: '#e8f5e9', padding: '0.75rem', borderRadius: '4px' }}>{message}</div>}
                    {error && <div style={{ marginBottom: '1rem', color: '#dc3545', fontSize: '0.9rem', background: '#ffebee', padding: '0.75rem', borderRadius: '4px' }}>{error}</div>}

                    {step === 1 && (
                        <form onSubmit={handleSendOtp}>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>Email Address</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    style={{
                                        width: '100%', padding: '0.75rem', borderRadius: '8px',
                                        border: '1px solid #ddd', fontSize: '1rem'
                                    }}
                                    placeholder="admin@eci.gov.in"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                style={{
                                    width: '100%', padding: '1rem',
                                    background: '#000080',
                                    color: 'white', border: 'none', borderRadius: '8px',
                                    fontSize: '1rem', fontWeight: 700, cursor: 'pointer',
                                    opacity: isLoading ? 0.7 : 1
                                }}
                            >
                                {isLoading ? 'Sending OTP...' : 'Send OTP'}
                            </button>
                        </form>
                    )}

                    {step === 2 && (
                        <form onSubmit={handleVerifyOtp}>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>Enter OTP</label>
                                <input
                                    type="text"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    style={{
                                        width: '100%', padding: '0.75rem', borderRadius: '8px',
                                        border: '1px solid #ddd', fontSize: '1.5rem', letterSpacing: '0.5rem',
                                        textAlign: 'center'
                                    }}
                                    placeholder="000000"
                                    maxLength="6"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                style={{
                                    width: '100%', padding: '1rem',
                                    background: '#000080',
                                    color: 'white', border: 'none', borderRadius: '8px',
                                    fontSize: '1rem', fontWeight: 700, cursor: 'pointer',
                                    opacity: isLoading ? 0.7 : 1
                                }}
                            >
                                {isLoading ? 'Verifying...' : 'Verify OTP'}
                            </button>

                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                style={{
                                    width: '100%', marginTop: '0.75rem', padding: '0.75rem',
                                    background: 'transparent', color: '#666',
                                    border: '1px solid #ddd', borderRadius: '8px',
                                    fontSize: '0.9rem', cursor: 'pointer'
                                }}
                            >
                                Change Email
                            </button>
                        </form>
                    )}

                    {step === 3 && (
                        <form onSubmit={handleResetPassword}>
                            <div style={{ marginBottom: '1rem', position: 'relative' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>New Password</label>
                                <input
                                    type={showNewPassword ? "text" : "password"}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    style={{
                                        width: '100%', padding: '0.75rem', paddingRight: '3rem', borderRadius: '8px',
                                        border: '1px solid #ddd', fontSize: '1rem'
                                    }}
                                    placeholder="Enter new password"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                    style={{
                                        position: 'absolute',
                                        right: '0.75rem',
                                        top: '2.3rem',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        color: '#666',
                                        display: 'flex',
                                        alignItems: 'center',
                                        padding: '0.25rem'
                                    }}
                                >
                                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>

                            <div style={{ marginBottom: '1.5rem', position: 'relative' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>Confirm Password</label>
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    style={{
                                        width: '100%', padding: '0.75rem', paddingRight: '3rem', borderRadius: '8px',
                                        border: '1px solid #ddd', fontSize: '1rem'
                                    }}
                                    placeholder="Confirm new password"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    style={{
                                        position: 'absolute',
                                        right: '0.75rem',
                                        top: '2.3rem',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        color: '#666',
                                        display: 'flex',
                                        alignItems: 'center',
                                        padding: '0.25rem'
                                    }}
                                >
                                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                style={{
                                    width: '100%', padding: '1rem',
                                    background: '#138808',
                                    color: 'white', border: 'none', borderRadius: '8px',
                                    fontSize: '1rem', fontWeight: 700, cursor: 'pointer',
                                    opacity: isLoading ? 0.7 : 1
                                }}
                            >
                                {isLoading ? 'Resetting Password...' : 'Reset Password'}
                            </button>
                        </form>
                    )}

                    <p style={{ marginTop: '1.5rem', textAlign: 'center', color: '#666', fontSize: '0.9rem' }}>
                        Remember your password? <Link to="/" style={{ color: '#000080', fontWeight: 600, textDecoration: 'none' }}>Login</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
