import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Lock, MapPin, Activity, FileText, Eye, EyeOff } from 'lucide-react';
import API_BASE from '../config/api';

import logo from '../assets/logo.png';


const Login = () => {
    const navigate = useNavigate();
    const [role, setRole] = useState('PRE_POLL');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const roles = [
        { id: 'PRE_POLL', label: 'Pre-Poll (Setup)', icon: <MapPin size={18} />, color: '#000080', bg: '#E3F2FD', shadow: 'rgba(0, 0, 128, 0.2)' },
        { id: 'LIVE', label: 'Live Control', icon: <Activity size={18} />, color: '#138808', bg: '#E8F5E9', shadow: 'rgba(19, 136, 8, 0.2)' },
        { id: 'POST_POLL', label: 'Post-Poll (Reports)', icon: <FileText size={18} />, color: '#F47920', bg: '#FFF3E0', shadow: 'rgba(244, 121, 32, 0.2)' }
    ];

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await fetch(`${API_BASE}/api/admin/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password, role })
            });

            const data = await response.json();

            if (data.success) {
                // Store session
                localStorage.setItem('admin_token', data.token);
                localStorage.setItem('admin_user', JSON.stringify(data.admin));
                navigate('/dashboard');
            } else {
                setError(data.error || 'Login Failed');
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
                    {/* Decorative flag color elements */}
                    <div className="auth-visual-decoration"></div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', position: 'relative', zIndex: 2 }}>
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

                    <h1 style={{ fontSize: '2.5rem', lineHeight: 1.2, marginBottom: '1.5rem', position: 'relative', zIndex: 2 }}>
                        Election Lifecycle Management
                    </h1>
                    <p style={{ opacity: 0.9, lineHeight: 1.6, position: 'relative', zIndex: 2 }}>
                        Secure access for authorized Election Commission officers only.
                        Manage constituencies, control election phases, and generate statutory reports.
                    </p>

                    <div style={{ marginTop: 'auto', display: 'flex', gap: '1rem', position: 'relative', zIndex: 2 }}>
                        <div style={{ padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.2)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem', backdropFilter: 'blur(10px)' }}>
                            <Lock size={16} /> Restricted Access
                        </div>
                    </div>
                </div>

                {/* Login Form Side */}
                <div className="auth-form">
                    <h2 style={{ marginBottom: '0.5rem', color: '#1a237e', textAlign: 'center' }}>Officer Login</h2>
                    <p style={{ color: '#666', marginBottom: '2rem', textAlign: 'center' }}>Select your role and identify yourself.</p>

                    {/* Role Selector */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '2.5rem' }}>
                        {roles.map((r) => (
                            <div
                                key={r.id}
                                onClick={() => setRole(r.id)}
                                style={{
                                    padding: '1.2rem 1rem',
                                    borderRadius: '16px',
                                    border: role === r.id ? `3px solid ${r.color}` : '2.5px solid #e0e8f0',
                                    background: role === r.id ? r.bg : 'linear-gradient(135deg, #f8fafb 0%, #f0f4f8 100%)',
                                    cursor: 'pointer',
                                    textAlign: 'center',
                                    fontSize: '0.9rem',
                                    fontWeight: role === r.id ? 800 : 650,
                                    color: role === r.id ? r.color : '#555',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    transition: 'all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
                                    boxShadow: role === r.id ? `0 10px 30px ${r.shadow}` : '0 3px 12px rgba(0,0,0,0.08)',
                                    transform: role === r.id ? 'translateY(-6px)' : 'translateY(0)',
                                    backdropFilter: 'blur(10px)'
                                }}
                                onMouseEnter={(e) => {
                                  if (role !== r.id) {
                                    e.currentTarget.style.boxShadow = '0 6px 18px rgba(0,0,0,0.12)';
                                    e.currentTarget.style.transform = 'translateY(-3px)';
                                    e.currentTarget.style.borderColor = r.color;
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  if (role !== r.id) {
                                    e.currentTarget.style.boxShadow = '0 3px 12px rgba(0,0,0,0.08)';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.borderColor = '#e0e8f0';
                                  }
                                }}
                            >
                                <div style={{ fontSize: '1.6rem' }}>{r.icon}</div>
                                <span style={{ fontWeight: 'inherit', lineHeight: 1.3 }}>{r.label}</span>
                            </div>
                        ))}
                    </div>

                    <form onSubmit={handleLogin}>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.7rem', fontWeight: 800, fontSize: '0.95rem', color: '#000080', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Username</label>
                            <input
                                type="text"
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                placeholder="Enter your username"
                                style={{
                                    width: '100%', padding: '1rem 1.1rem', borderRadius: '14px',
                                    border: '2.5px solid #e0e8f0', fontSize: '1rem',
                                    fontFamily: 'Inter, sans-serif',
                                    transition: 'all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
                                    backgroundColor: '#f8fafb',
                                    boxShadow: '0 3px 10px rgba(0,0,128,0.08)',
                                    fontWeight: 500
                                }}
                                onFocus={(e) => {
                                  e.target.style.borderColor = '#000080';
                                  e.target.style.boxShadow = '0 0 0 5px rgba(0, 0, 128, 0.15), 0 5px 15px rgba(0,0,128,0.2)';
                                  e.target.style.backgroundColor = 'white';
                                  e.target.style.transform = 'translateY(-1px)';
                                }}
                                onBlur={(e) => {
                                  e.target.style.borderColor = '#e0e8f0';
                                  e.target.style.boxShadow = '0 3px 10px rgba(0,0,128,0.08)';
                                  e.target.style.backgroundColor = '#f8fafb';
                                  e.target.style.transform = 'translateY(0)';
                                }}
                                required
                            />
                        </div>

                        <div style={{ marginBottom: '2rem', position: 'relative' }}>
                            <label style={{ display: 'block', marginBottom: '0.7rem', fontWeight: 800, fontSize: '0.95rem', color: '#000080', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Password</label>
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                style={{
                                    width: '100%', padding: '1rem 1.1rem', paddingRight: '3.2rem', borderRadius: '14px',
                                    border: '2.5px solid #e0e8f0', fontSize: '1rem',
                                    fontFamily: 'Inter, sans-serif',
                                    transition: 'all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
                                    backgroundColor: '#f8fafb',
                                    boxShadow: '0 3px 10px rgba(0,0,128,0.08)',
                                    fontWeight: 500
                                }}
                                onFocus={(e) => {
                                  e.target.style.borderColor = '#000080';
                                  e.target.style.boxShadow = '0 0 0 5px rgba(0, 0, 128, 0.15), 0 5px 15px rgba(0,0,128,0.2)';
                                  e.target.style.backgroundColor = 'white';
                                  e.target.style.transform = 'translateY(-1px)';
                                }}
                                onBlur={(e) => {
                                  e.target.style.borderColor = '#e0e8f0';
                                  e.target.style.boxShadow = '0 3px 10px rgba(0,0,128,0.08)';
                                  e.target.style.backgroundColor = '#f8fafb';
                                  e.target.style.transform = 'translateY(0)';
                                }}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute',
                                    right: '1rem',
                                    top: '2.55rem',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: '#000080',
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '0.35rem',
                                    transition: 'all 0.2s ease',
                                    opacity: 0.7
                                }}
                                onMouseEnter={(e) => {
                                  e.target.style.opacity = '1';
                                  e.target.style.transform = 'scale(1.1)';
                                }}
                                onMouseLeave={(e) => {
                                  e.target.style.opacity = '0.7';
                                  e.target.style.transform = 'scale(1)';
                                }}
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>

                        {error && <div style={{ marginBottom: '1.25rem', color: '#d32f2f', fontSize: '0.9rem', textAlign: 'center', background: 'linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%)', padding: '0.95rem', borderRadius: '10px', borderLeft: '5px solid #d32f2f', boxShadow: '0 2px 8px rgba(211, 47, 47, 0.15)' }}>{error}</div>}

                        <button
                            type="submit"
                            disabled={isLoading}
                            style={{
                                width: '100%', padding: '1.1rem',
                                background: role === 'PRE_POLL' ? 'linear-gradient(135deg, #000080, #1565C0)' : (role === 'LIVE' ? 'linear-gradient(135deg, #138808, #2E7D32)' : 'linear-gradient(135deg, #F47920, #EF6C00)'),
                                color: 'white', border: 'none', borderRadius: '12px',
                                fontSize: '1.05rem', fontWeight: 700, cursor: isLoading ? 'not-allowed' : 'pointer',
                                opacity: isLoading ? 0.75 : 1,
                                boxShadow: '0 6px 20px rgba(0, 0, 128, 0.3)',
                                transition: 'all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
                                letterSpacing: '0.6px',
                                textTransform: 'uppercase'
                            }}
                            onMouseEnter={(e) => !isLoading && (e.target.style.transform = 'translateY(-3px)', e.target.style.boxShadow = '0 8px 25px rgba(0, 0, 128, 0.4)')}
                            onMouseLeave={(e) => !isLoading && (e.target.style.transform = 'translateY(0)', e.target.style.boxShadow = '0 6px 20px rgba(0, 0, 128, 0.3)')}
                        >
                            {isLoading ? 'Verifying...' : 'Access Dashboard'}
                        </button>
                    </form>

                    <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                        <Link to="/forgot-password" style={{ color: '#000080', fontSize: '0.95rem', textDecoration: 'none', fontWeight: 700, transition: 'all 0.35s ease', borderBottom: '2px solid transparent', padding: '0.25rem 0', display: 'inline-block' }} onMouseEnter={(e) => { e.target.style.borderBottomColor = '#138808'; e.target.style.color = '#138808'; }} onMouseLeave={(e) => { e.target.style.borderBottomColor = 'transparent'; e.target.style.color = '#000080'; }}>Forgot Password?</Link>
                    </div>

                    <p style={{ marginTop: '2rem', textAlign: 'center', color: '#333', fontSize: '0.95rem', lineHeight: '1.6' }}>
                        Don't have an account? <Link to="/register" style={{ color: '#000080', fontWeight: 700, textDecoration: 'none', transition: 'all 0.35s ease', borderBottom: '2px solid transparent', padding: '0.25rem 0', display: 'inline-block' }} onMouseEnter={(e) => { e.target.style.borderBottomColor = '#F47920'; e.target.style.color = '#F47920'; }} onMouseLeave={(e) => { e.target.style.borderBottomColor = 'transparent'; e.target.style.color = '#000080'; }}>Create Account</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
