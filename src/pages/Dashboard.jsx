import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Map, UserPlus, PlayCircle, StopCircle, UserCheck, Shield } from 'lucide-react';

import ConstituencyManager from '../components/ConstituencyManager';
import CandidateMaster from '../components/CandidateMaster';
import VoterRegistration from '../components/VoterRegistration';
import LifecycleController from '../components/LifecycleController';
import VoterVerification from '../components/VoterVerification';
import RecoveryManager from '../components/RecoveryManager';

const Dashboard = () => {
    const navigate = useNavigate();
    const [admin, setAdmin] = useState(null);
    const [activeTab, setActiveTab] = useState('');

    useEffect(() => {
        const storedAdmin = localStorage.getItem('admin_token');
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

    const handleLogout = () => {
        localStorage.removeItem('admin_token');
        navigate('/');
    };

    if (!admin) return null;

    return (
        <div className="admin-layout">
            <aside className="sidebar">
                <div className="sidebar-header">
                    <img src="/assets/images/logo.png" style={{ height: '32px' }} alt="Logo" onError={(e) => e.target.style.display = 'none'} />
                    <div>
                        <div style={{ fontWeight: 700 }}>Admin Console</div>
                        <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>{admin.role.replace('_', ' ')}</div>
                    </div>
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
                                <UserPlus size={20} /> Voter Registration
                            </div>
                        </>
                    )}

                    {/* Live Options */}
                    {admin.role === 'LIVE' && (
                        <>
                            <div className={`nav-item ${activeTab === 'verification' ? 'active' : ''}`} onClick={() => setActiveTab('verification')}>
                                <UserCheck size={20} /> Voter Verification
                            </div>
                            <div className={`nav-item ${activeTab === 'registration' ? 'active' : ''}`} onClick={() => setActiveTab('registration')}>
                                <UserPlus size={20} /> Voter Registration
                            </div>
                            <div className={`nav-item ${activeTab === 'lifecycle' ? 'active' : ''}`} onClick={() => setActiveTab('lifecycle')}>
                                <PlayCircle size={20} /> Election Lifecycle
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
                        </>
                    )}
                </nav>

                <div style={{ marginTop: 'auto' }}>
                    <div className="nav-item" onClick={handleLogout} style={{ color: '#ff8a80' }}>
                        <LogOut size={20} /> Logout
                    </div>
                </div>
            </aside>

            <main className="dashboard-main">
                <div className="top-bar">
                    <h2 style={{ margin: 0 }}>
                        {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Manager
                    </h2>
                    <div className="user-profile">
                        Officer: <strong>{admin.name}</strong>
                    </div>
                </div>

                <div className="content-area">
                    {/* Render Components based on Tab */}
                    {activeTab === 'constituencies' && <ConstituencyManager />}
                    {activeTab === 'candidates' && <CandidateMaster />}
                    {activeTab === 'voters' && <VoterRegistration />}

                    {activeTab === 'lifecycle' && <LifecycleController />}
                    {activeTab === 'verification' && <VoterVerification />}
                    {activeTab === 'registration' && <VoterRegistration />}
                    {activeTab === 'recovery' && <RecoveryManager admin={admin} />}

                    {activeTab === 'reports' && <div className="card"> Report Generation Module Coming Soon </div>}
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
