import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Map, UserPlus, PlayCircle, StopCircle, UserCheck, Shield } from 'lucide-react';

import ConstituencyManager from '../components/ConstituencyManager';
import CandidateMaster from '../components/CandidateMaster';
import VoterRegistration from '../components/VoterRegistration';
import LifecycleController from '../components/LifecycleController';
import VoterVerification from '../components/VoterVerification';
import PendingVerifications from '../components/PendingVerifications';
import RecoveryManager from '../components/RecoveryManager';
import FinalReports from '../components/FinalReports';
import AuditLogViewer from '../components/AuditLogViewer';

import Tally from './Tally'; // Reusing page as component

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

    const handleLogout = async () => {
        try {
            // Log logout event before clearing session
            if (admin) {
                await fetch(`http://${window.location.hostname}:8081/api/admin/logout`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
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
                            <div className={`nav-item ${activeTab === 'registration' ? 'active' : ''}`} onClick={() => setActiveTab('registration')}>
                                <UserPlus size={20} /> New Voter Registration
                            </div>
                            <div className={`nav-item ${activeTab === 'pending' ? 'active' : ''}`} onClick={() => setActiveTab('pending')}>
                                <UserCheck size={20} /> Pending Approvals
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
                            <div className={`nav-item ${activeTab === 'tally' ? 'active' : ''}`} onClick={() => setActiveTab('tally')}>
                                <Shield size={20} /> Tally Votes
                            </div>
                        </>
                    )}

                    {/* Common Options */}
                    <div className={`nav-item ${activeTab === 'audit' ? 'active' : ''}`} onClick={() => setActiveTab('audit')}>
                        <Shield size={20} /> Audit Logs
                    </div>
                </nav>

                <div style={{ marginTop: 'auto' }}>
                    <div className="nav-item" onClick={handleLogout} style={{ color: '#ff8a80' }}>
                        <LogOut size={20} /> Logout
                    </div>
                </div>
            </aside>

            <main className="dashboard-main">
                <div className="top-bar" style={{ borderBottom: '2px solid #ddd', paddingBottom: '1rem', marginBottom: '2rem' }}>
                    <h2 style={{ margin: 0, color: '#000080', fontWeight: 800, letterSpacing: '-0.02em' }}>
                        {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Manager
                    </h2>
                    <div className="user-profile" style={{ background: 'white', padding: '0.5rem 1rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Shield size={16} color="#000080" />
                        <span>Officer: <strong style={{ color: '#000080' }}>{admin.name}</strong></span>
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
                    {activeTab === 'audit' && <AuditLogViewer />}
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
