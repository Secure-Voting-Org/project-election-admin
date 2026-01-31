import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, MapPin, Activity, FileText } from 'lucide-react';

const Login = () => {
    const navigate = useNavigate();
    const [role, setRole] = useState('PRE_POLL');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const roles = [
        { id: 'PRE_POLL', label: 'Pre-Poll (Setup)', icon: <MapPin size={18} />, color: '#1565C0', bg: '#E3F2FD' },
        { id: 'LIVE', label: 'Live Control', icon: <Activity size={18} />, color: '#2E7D32', bg: '#E8F5E9' },
        { id: 'POST_POLL', label: 'Post-Poll (Reports)', icon: <FileText size={18} />, color: '#EF6C00', bg: '#FFF3E0' }
    ];

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch(`http://${window.location.hostname}:5000/api/admin/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password, role })
            });

            const data = await response.json();

            if (data.success) {
                // Store session
                localStorage.setItem('admin_token', JSON.stringify(data.admin));
                navigate('/dashboard');
            } else {
                setError(data.error || 'Login Failed');
            }
        } catch (err) {
            setError('Server connection failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-wrapper">
            <div className="auth-card">
                {/* Visual Side */}
                <div className="auth-visual">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                        <Shield size={48} color="white" />
                        <div>
                            <h2 style={{ margin: 0, fontSize: '1.5rem' }}>TrustBallot</h2>
                            <p style={{ margin: 0, opacity: 0.8, fontSize: '0.9rem' }}>Admin Console</p>
                        </div>
                    </div>

                    <h1 style={{ fontSize: '2.5rem', lineHeight: 1.2, marginBottom: '1.5rem' }}>
                        Election Lifecycle Management
                    </h1>
                    <p style={{ opacity: 0.9, lineHeight: 1.6 }}>
                        Secure access for authorized Election Commission officers only.
                        Manage constituencies, control election phases, and generate statutory reports.
                    </p>

                    <div style={{ marginTop: 'auto', display: 'flex', gap: '1rem' }}>
                        <div style={{ padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.2)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Lock size={16} /> Restricted Access
                        </div>
                    </div>
                </div>

                {/* Login Form Side */}
                <div className="auth-form">
                    <h2 style={{ marginBottom: '0.5rem', color: '#1a237e' }}>Officer Login</h2>
                    <p style={{ color: '#666', marginBottom: '2rem' }}>Select your role and identify yourself.</p>

                    {/* Role Selector */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', marginBottom: '1.5rem' }}>
                        {roles.map((r) => (
                            <div
                                key={r.id}
                                onClick={() => setRole(r.id)}
                                style={{
                                    padding: '0.75rem 0.5rem',
                                    borderRadius: '8px',
                                    border: role === r.id ? `2px solid ${r.color}` : '1px solid #ddd',
                                    background: role === r.id ? r.bg : 'white',
                                    cursor: 'pointer',
                                    textAlign: 'center',
                                    fontSize: '0.8rem',
                                    fontWeight: role === r.id ? 700 : 400,
                                    color: role === r.id ? r.color : '#666',
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

                    <form onSubmit={handleLogin}>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>Username</label>
                            <input
                                type="text"
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                style={{
                                    width: '100%', padding: '0.75rem', borderRadius: '8px',
                                    border: '1px solid #ddd', fontSize: '1rem'
                                }}
                                required
                            />
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                style={{
                                    width: '100%', padding: '0.75rem', borderRadius: '8px',
                                    border: '1px solid #ddd', fontSize: '1rem'
                                }}
                                required
                            />
                        </div>

                        {error && <div style={{ marginBottom: '1rem', color: '#dc3545', fontSize: '0.9rem', textAlign: 'center', background: '#ffebee', padding: '0.5rem', borderRadius: '4px' }}>{error}</div>}

                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: '100%', padding: '1rem',
                                background: role === 'PRE_POLL' ? '#1565C0' : (role === 'LIVE' ? '#2E7D32' : '#EF6C00'),
                                color: 'white', border: 'none', borderRadius: '8px',
                                fontSize: '1rem', fontWeight: 700, cursor: 'pointer',
                                opacity: loading ? 0.7 : 1
                            }}
                        >
                            {loading ? 'Verifying...' : 'Access Dashboard'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
