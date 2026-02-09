import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, MapPin, Activity, FileText, Eye, EyeOff, Lock } from 'lucide-react';

import logo from '../assets/logo.png';

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        username: '',
        password: '',
        confirmPassword: '',
        role: 'PRE_POLL'
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const roles = [
        { id: 'PRE_POLL', label: 'Pre-Poll (Setup)', icon: <MapPin size={18} />, color: '#1565C0', bg: '#E3F2FD' },
        { id: 'LIVE', label: 'Live Control', icon: <Activity size={18} />, color: '#2E7D32', bg: '#E8F5E9' },
        { id: 'POST_POLL', label: 'Post-Poll (Reports)', icon: <FileText size={18} />, color: '#EF6C00', bg: '#FFF3E0' }
    ];

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch(`http://${window.location.hostname}:5001/api/admin/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fullName: formData.fullName,
                    email: formData.email,
                    username: formData.username,
                    password: formData.password,
                    role: formData.role
                })
            });

            const data = await response.json();

            if (data.success) {
                navigate('/?registered=true');
            } else {
                setError(data.error || 'Registration failed');
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
                        <img
                            src={logo}
                            alt="TrustBallot Logo"
                            style={{ height: '80px', width: 'auto', background: 'white', borderRadius: '12px', padding: '5px' }}
                            className="shadow-xl"
                        />
                        <div>
                            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>TrustBallot</h2>
                            <p style={{ margin: 0, opacity: 0.9, fontSize: '0.85rem' }}>Election Commission of India</p>
                        </div>
                    </div>

                    <h1 style={{ fontSize: '2.2rem', lineHeight: 1.2, marginBottom: '1rem', fontWeight: 700 }}>
                        Admin Officer Registration
                    </h1>
                    <p style={{ opacity: 0.95, lineHeight: 1.7, fontSize: '0.95rem', marginBottom: '2.5rem' }}>
                        Register as an authorized Election Commission officer to manage election phases,
                        control constituencies, and generate statutory reports as per the Representation of the People Act, 1951.
                    </p>

                    <div style={{ marginBottom: '2.5rem' }}>
                        <h3 style={{ margin: '0 0 1rem 0', fontSize: '0.95rem', fontWeight: 600, opacity: 0.95 }}>
                            Officer Responsibilities
                        </h3>
                        <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.88rem', lineHeight: 1.9, opacity: 0.9 }}>
                            <li>Manage election configuration and polling schedules</li>
                            <li>Monitor real-time voting activity and turnout</li>
                            <li>Generate Form 20 and Form 21 statutory reports</li>
                            <li>Ensure compliance with ECI guidelines</li>
                        </ul>
                    </div>


                    <div style={{ marginTop: 'auto', paddingTop: '1.5rem', display: 'flex', justifyContent: 'center' }}>
                        <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.6rem 1.5rem',
                            background: 'rgba(255,255,255,0.15)',
                            borderRadius: '8px',
                            fontSize: '0.85rem',
                            fontWeight: 600
                        }}>
                            <Lock size={16} />
                            Restricted Access
                        </div>
                    </div>

                </div>

                {/* Form Side */}
                <div className="auth-form">
                    <h2 style={{ marginBottom: '0.5rem', color: '#1a237e' }}>Admin Registration</h2>
                    <p style={{ color: '#666', marginBottom: '2rem' }}>Select your role and create your account.</p>

                    {/* Role Selector */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 600, fontSize: '0.9rem' }}>Admin Role</label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                            {roles.map((r) => (
                                <div
                                    key={r.id}
                                    onClick={() => setFormData({ ...formData, role: r.id })}
                                    style={{
                                        padding: '0.75rem 0.5rem',
                                        borderRadius: '8px',
                                        border: formData.role === r.id ? `2px solid ${r.color}` : '1px solid #ddd',
                                        background: formData.role === r.id ? r.bg : 'white',
                                        cursor: 'pointer',
                                        textAlign: 'center',
                                        fontSize: '0.8rem',
                                        fontWeight: formData.role === r.id ? 700 : 400,
                                        color: formData.role === r.id ? r.color : '#666',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: '0.25rem',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {r.icon}
                                    <span>{r.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>Full Name</label>
                            <input
                                type="text"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                style={{
                                    width: '100%', padding: '0.75rem', borderRadius: '8px',
                                    border: '1px solid #ddd', fontSize: '1rem'
                                }}
                                placeholder="Enter your full name"
                                required
                            />
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>Email Address</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                style={{
                                    width: '100%', padding: '0.75rem', borderRadius: '8px',
                                    border: '1px solid #ddd', fontSize: '1rem'
                                }}
                                placeholder="admin@eci.gov.in"
                                required
                            />
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>Username</label>
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                style={{
                                    width: '100%', padding: '0.75rem', borderRadius: '8px',
                                    border: '1px solid #ddd', fontSize: '1rem'
                                }}
                                placeholder="Choose a username"
                                required
                            />
                        </div>

                        <div style={{ marginBottom: '1rem', position: 'relative' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>Password</label>
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                style={{
                                    width: '100%', padding: '0.75rem', paddingRight: '3rem', borderRadius: '8px',
                                    border: '1px solid #ddd', fontSize: '1rem'
                                }}
                                placeholder="Create a strong password"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
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
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>

                        <div style={{ marginBottom: '1.5rem', position: 'relative' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>Confirm Password</label>
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                style={{
                                    width: '100%', padding: '0.75rem', paddingRight: '3rem', borderRadius: '8px',
                                    border: '1px solid #ddd', fontSize: '1rem'
                                }}
                                placeholder="Confirm your password"
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

                        {error && <div style={{ marginBottom: '1rem', color: '#dc3545', fontSize: '0.9rem', textAlign: 'center', background: '#ffebee', padding: '0.5rem', borderRadius: '4px' }}>{error}</div>}

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
                            {isLoading ? 'Creating Account...' : 'Create Admin Account'}
                        </button>
                    </form>

                    <p style={{ marginTop: '1.5rem', textAlign: 'center', color: '#666', fontSize: '0.9rem' }}>
                        Already have an account? <Link to="/" style={{ color: '#000080', fontWeight: 600, textDecoration: 'none' }}>Login</Link>
                    </p>
                </div>
            </div>
        </div >
    );
};

export default Register;
