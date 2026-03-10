import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Map, UserPlus, PlayCircle, StopCircle, UserCheck, Shield, History } from 'lucide-react';
import API_BASE from '../config/api';

import ConstituencyManager from '../components/ConstituencyManager';
import CandidateMaster from '../components/CandidateMaster';
import VoterRegistration from '../components/VoterRegistration';
import LifecycleController from '../components/LifecycleController';
import VoterVerification from '../components/VoterVerification';
import PendingVerifications from '../components/PendingVerifications';
import RecoveryManager from '../components/RecoveryManager';
import FinalReports from '../components/FinalReports';
import ElectionHistory from '../components/ElectionHistory';



import Tally from './Tally'; // Reusing page as component

const Dashboard = () => {
    const navigate = useNavigate();
    const [admin, setAdmin] = useState(null);
    const [activeTab, setActiveTab] = useState('');

    useEffect(() => {
        const storedAdmin = localStorage.getItem('admin_user');
        if (storedAdmin) {
            const parsed = JSON.parse(storedAdmin);
            setAdmin(parsed);

            // Set Default Active Tab based on Role
            if (parsed.role === 'PRE_POLL') setActiveTab('constituencies');
            else if (parsed.role === 'LIVE') setActiveTab('verification');
            else if (parsed.role === 'POST_POLL') setActiveTab('reports');
        } else {
            navigate('/');
        }
    }, [navigate]);

    const handleLogout = async () => {
        try {
            // Log logout event before clearing session
            if (admin) {
                const token = localStorage.getItem('admin_token');
                await fetch(`${API_BASE}/api/admin/logout`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': token ? `Bearer ${token}` : ''
                    },
                    body: JSON.stringify({
                        username: admin.username,
                        role: admin.role
                    })
                });
            }
        } catch (err) {
            console.error('Logout logging failed:', err);
        }
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
        navigate('/');
    };

    if (!admin) return null;

    return (
        <div className="admin-layout">
            <aside className="sidebar">
                {/* Thin tricolor stripe at very top of sidebar */}
                <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, height: '4px',
                    background: 'linear-gradient(90deg, #FF8C00 0% 33.33%, #ffffff 33.33% 66.66%, #138808 66.66% 100%)',
                    zIndex: 10
                }} />

                <div className="sidebar-header" style={{ paddingTop: '2rem', flexDirection: 'column', alignItems: 'flex-start', gap: '0.85rem' }}>
                    {/* Avatar Box */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                        <div style={{
                            width: '46px', height: '46px', borderRadius: '12px',
                            background: 'linear-gradient(135deg, #FF8C00 0%, #e06500 50%, #138808 100%)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0, boxShadow: '0 4px 14px rgba(0,0,0,0.3)'
                        }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V7L12 2z" fill="white" fillOpacity="0.9"/>
                                <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </div>
                        <div>
                            <div style={{ fontWeight: 900, fontSize: '1rem', letterSpacing: '0.2px', lineHeight: 1.2 }}>Admin Console</div>
                            <div style={{
                                fontSize: '0.72rem',
                                background: 'linear-gradient(90deg, #FF8C00, #138808)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                                fontWeight: 800, letterSpacing: '0.8px', textTransform: 'uppercase'
                            }}>{admin.role.replace('_', ' ')}</div>
                        </div>
                    </div>
                    {/* Thin tricolor stripe under header */}
                    <div style={{
                        width: '100%', height: '3px', borderRadius: '2px',
                        background: 'linear-gradient(90deg, #FF8C00 0% 33.33%, rgba(255,255,255,0.5) 33.33% 66.66%, #138808 66.66% 100%)'
                    }} />
                </div>

                <nav>
                    {/* Pre-Poll Options */}
                    {admin.role === 'PRE_POLL' && (
                        <>
                            <div className={`nav-item ${activeTab === 'constituencies' ? 'active' : ''}`} onClick={() => setActiveTab('constituencies')}>
                                <Map size={20} /> Constituencies
                            </div>
                            <div className={`nav-item ${activeTab === 'candidates' ? 'active' : ''}`} onClick={() => setActiveTab('candidates')}>
                                <UserPlus size={20} /> Candidates
                            </div>
                            <div className={`nav-item ${activeTab === 'voters' ? 'active' : ''}`} onClick={() => setActiveTab('voters')}>
                                <UserPlus size={20} /> New Voter Registration
                            </div>
                            <div className={`nav-item ${activeTab === 'pending' ? 'active' : ''}`} onClick={() => setActiveTab('pending')}>
                                <UserCheck size={20} /> Pending Approvals
                            </div>
                        </>
                    )}

                    {/* Live Options */}
                    {admin.role === 'LIVE' && (
                        <>
                            <div className={`nav-item ${activeTab === 'verification' ? 'active' : ''}`} onClick={() => setActiveTab('verification')}>
                                <UserCheck size={20} /> Voter Verification
                            </div>

                            <div className={`nav-item ${activeTab === 'recovery' ? 'active' : ''}`} onClick={() => setActiveTab('recovery')}>
                                <Shield size={20} /> Account Recovery
                            </div>

                        </>
                    )}

                    {/* Post-Poll Options */}
                    {admin.role === 'POST_POLL' && (
                        <>
                            <div className={`nav-item ${activeTab === 'reports' ? 'active' : ''}`} onClick={() => setActiveTab('reports')}>
                                <StopCircle size={20} /> Final Reports
                            </div>
                            <div className={`nav-item ${activeTab === 'tally' ? 'active' : ''}`} onClick={() => setActiveTab('tally')}>
                                <Shield size={20} /> Tally Votes
                            </div>
                            <div className={`nav-item ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>
                                <History size={20} /> Election Archives
                            </div>
                        </>
                    )}


                </nav>

                <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    <div className="nav-item" onClick={handleLogout} style={{
                        color: 'rgba(255, 138, 128, 0.9)',
                        border: '1px solid rgba(255, 138, 128, 0.2)',
                        borderRadius: '10px',
                        transition: 'all 0.25s ease'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255,138,128,0.12)';
                        e.currentTarget.style.color = '#ff8a80';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = 'rgba(255,138,128,0.9)';
                    }}>
                        <LogOut size={18} /> Logout
                    </div>
                </div>
            </aside>

            <main className="dashboard-main">
                <div className="top-bar">
                    <h2 style={{ margin: 0, fontWeight: 900, letterSpacing: '-0.03em', fontSize: '1.5rem' }}>
                        <span style={{
                            background: 'linear-gradient(135deg, #000080 0%, #1565C0 50%, #138808 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text'
                        }}>
                            {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Manager
                        </span>
                    </h2>

                    <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'center' }}>
                        {/* Status Indicator */}
                        <ElectionStatusBadge />

                        <div className="user-profile" style={{
                            background: 'linear-gradient(135deg, #f4f7ff 0%, #eef2ff 100%)',
                            padding: '0.55rem 1.1rem',
                            borderRadius: '12px',
                            boxShadow: '0 2px 10px rgba(0,0,128,0.10)',
                            display: 'flex', alignItems: 'center', gap: '0.6rem',
                            border: '1px solid rgba(0,0,128,0.10)',
                            borderLeft: '3px solid #000080'
                        }}>
                            <Shield size={16} color="#000080" />
                            <span style={{ fontSize: '0.92rem', color: '#444' }}>Officer: <strong style={{ color: '#000080', fontWeight: 800 }}>{admin.name}</strong></span>
                        </div>
                    </div>
                </div>

                <div className="content-area">
                    {/* Render Components based on Tab */}
                    {activeTab === 'constituencies' && <ConstituencyManager />}
                    {activeTab === 'candidates' && <CandidateMaster />}
                    {activeTab === 'voters' && <VoterRegistration />}
                    {activeTab === 'pending' && <PendingVerifications />}

                    {activeTab === 'lifecycle' && <LifecycleController />}
                    {activeTab === 'verification' && <VoterVerification />}
                    {activeTab === 'registration' && <VoterRegistration />}
                    {activeTab === 'recovery' && <RecoveryManager admin={admin} />}


                    {activeTab === 'reports' && <FinalReports />}
                    {activeTab === 'tally' && <Tally />}
                    {activeTab === 'history' && <ElectionHistory />}

                </div>
            </main>
        </div>
    );
};

// Internal Component for Status Badge
const ElectionStatusBadge = () => {
    const [status, setStatus] = useState(null);

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const res = await fetch(`${API_BASE}/api/election/status`);
                const data = await res.json();
                setStatus(data);
            } catch (err) {
                console.error('Failed to status', err);
            }
        };
        fetchStatus();
        const interval = setInterval(fetchStatus, 10000); // Poll every 10s
        return () => clearInterval(interval);
    }, []);

    if (!status) return null;

    const isLive = status.phase === 'LIVE' && !status.is_kill_switch_active;
    const isSuspended = status.is_kill_switch_active;

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '0.5rem 1rem',
            borderRadius: '20px',
            background: isSuspended ? '#FFF3E0' : (isLive ? '#E8F5E9' : '#E3F2FD'),
            color: isSuspended ? '#F47920' : (isLive ? '#138808' : '#1565C0'),
            border: `1px solid ${isSuspended ? '#FFE0B2' : (isLive ? '#C8E6C9' : '#BBDEFB')}`,
            fontSize: '0.85rem',
            fontWeight: 700
        }}>
            <div style={{
                width: '8px', height: '8px',
                borderRadius: '50%',
                background: isSuspended ? '#F47920' : (isLive ? '#138808' : '#1565C0'),
                boxShadow: isLive ? '0 0 8px #138808' : 'none',
                animation: isLive ? 'pulse 2s infinite' : 'none'
            }}></div>
            {status.phase.replace('_', ' ')}
            {isSuspended && <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>(SUSPENDED)</span>}
        </div>
    );
};

export default Dashboard;
