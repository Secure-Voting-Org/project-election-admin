import React, { useState, useEffect } from 'react';
import { Play, Pause, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';

const LifecycleController = () => {
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchStatus();
    }, []);

    const fetchStatus = async () => {
        try {
            const res = await fetch(`http://${window.location.hostname}:8081/api/election/status`);
            const data = await res.json();
            setStatus(data);
        } catch (err) {
            console.error('Failed to fetch election status', err);
        }
    };

    const updatePhase = async (newPhase) => {
        if (!window.confirm(`Are you sure you want to switch to ${newPhase} phase?`)) return;
        setLoading(true);
        try {
            await fetch(`http://${window.location.hostname}:8081/api/election/update`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phase: newPhase })
            });
            fetchStatus();
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    const toggleKillSwitch = async () => {
        const action = status.is_kill_switch_active ? 'DEACTIVATE' : 'ACTIVATE';
        const confirmMsg = status.is_kill_switch_active
            ? "Are you sure you want to RESUME voting?"
            : "EMERGENCY: Are you sure you want to STOP ALL VOTING immediately?";

        if (!window.confirm(confirmMsg)) return;

        setLoading(true);
        try {
            await fetch(`http://${window.location.hostname}:8081/api/election/update`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isKillSwitch: !status.is_kill_switch_active })
            });
            fetchStatus();
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    if (!status) return <div>Loading Status...</div>;

    return (
        <div>
            {/* Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.5rem',
                background: '#000080',
                padding: '1.5rem',
                borderRadius: '12px',
                color: 'white',
                boxShadow: '0 4px 12px rgba(0,0,128,0.3)',
                borderTop: '4px solid #F47920'
            }}>
                <h3 style={{ margin: 0, color: 'white' }}>Election Lifecycle Control</h3>
                <span className="phase-badge" style={{ background: '#138808', color: 'white', border: 'none' }}>Live Control</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>

                {/* Visual Status Monitor */}
                <div className="card" style={{ textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', border: 'none' }}>
                    <h4 style={{ marginTop: 0, color: '#000080', fontWeight: 700 }}>Current System Status</h4>
                    <div style={{
                        margin: '2rem auto',
                        width: '140px', height: '140px',
                        borderRadius: '50%',
                        background: status.is_kill_switch_active ? '#FFF3E0' : '#E8F5E9',
                        color: status.is_kill_switch_active ? '#F47920' : '#138808',
                        display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                        border: `6px solid ${status.is_kill_switch_active ? '#F47920' : '#138808'}`,
                        boxShadow: `0 0 20px ${status.is_kill_switch_active ? 'rgba(244,121,32,0.2)' : 'rgba(19,136,8,0.2)'}`
                    }}>
                        {status.is_kill_switch_active ? <AlertTriangle size={48} /> : <CheckCircle size={48} />}
                        <div style={{ fontSize: '1rem', fontWeight: 800, marginTop: '0.5rem' }}>
                            {status.is_kill_switch_active ? 'SUSPENDED' : 'ACTIVE'}
                        </div>
                    </div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 700 }}>
                        Current Phase: <span style={{ color: '#000080', textTransform: 'uppercase' }}>{status.phase.replace('_', ' ')}</span>
                    </div>
                    <button onClick={fetchStatus} style={{ marginTop: '1.5rem', background: '#f5f5f5', border: '1px solid #ddd', borderRadius: '8px', cursor: 'pointer', color: '#666', padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', fontWeight: 600 }}>
                        <RefreshCw size={16} /> Refresh Dashboard
                    </button>
                </div>

                {/* Kill Switch Area */}
                <div className="card" style={{ border: '2px solid #F47920', background: '#FFF3E0', boxShadow: '0 4px 15px rgba(244,121,32,0.1)' }}>
                    <h4 style={{ marginTop: 0, color: '#F47920', display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 800, fontSize: '1.2rem' }}>
                        <AlertTriangle size={24} /> Emergency Zone
                    </h4>
                    <p style={{ color: '#665c52', lineHeight: '1.6', fontWeight: 500 }}>
                        The Global Kill Switch immediately disables the "Cast Vote" functionality on all voter terminals connected to the network. Use only in case of security breach or technical failure.
                    </p>

                    <button
                        onClick={toggleKillSwitch}
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '1.5rem',
                            fontSize: '1.3rem',
                            fontWeight: 900,
                            borderRadius: '12px',
                            border: 'none',
                            cursor: 'pointer',
                            marginTop: '1.5rem',
                            background: status.is_kill_switch_active ? '#138808' : '#dc3545',
                            color: 'white',
                            boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                        }}
                    >
                        {status.is_kill_switch_active ? 'RESUME ELECTION' : 'STOP ELECTION (KILL SWITCH)'}
                    </button>
                </div>

                {/* Phase Movement Controls */}
                <div className="card" style={{ gridColumn: '1 / -1', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', padding: '2rem' }}>
                    <h4 style={{ marginTop: 0, textAlign: 'center', color: '#000080', fontWeight: 800, fontSize: '1.3rem', marginBottom: '2rem' }}>ELECTION LIFECYCLE MANAGEMENT</h4>
                    <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', alignItems: 'center' }}>

                        <button
                            className="btn"
                            disabled={status.phase === 'PRE_POLL' || loading}
                            onClick={() => updatePhase('PRE_POLL')}
                            style={{
                                opacity: status.phase === 'PRE_POLL' ? 1 : 0.6,
                                background: '#E3F2FD',
                                color: '#1565C0',
                                border: '2px solid #1565C0',
                                padding: '1rem 2rem',
                                fontWeight: 700,
                                flex: 1,
                                height: '60px'
                            }}
                        >
                            ⏮ Reset to Pre-Poll
                        </button>

                        <button
                            className="btn"
                            disabled={status.phase === 'LIVE' || loading}
                            onClick={() => updatePhase('LIVE')}
                            style={{
                                background: '#138808',
                                color: 'white',
                                padding: '1.5rem 3rem',
                                fontWeight: 900,
                                fontSize: '1.2rem',
                                flex: 1.5,
                                height: '80px',
                                boxShadow: '0 8px 20px rgba(19, 136, 8, 0.3)',
                                opacity: status.phase === 'LIVE' ? 1 : 0.6,
                                border: 'none'
                            }}
                        >
                            <Play size={24} style={{ marginBottom: '-4px', marginRight: '8px' }} />
                            GO LIVE
                        </button>

                        <button
                            className="btn"
                            disabled={status.phase === 'POST_POLL' || loading}
                            onClick={() => updatePhase('POST_POLL')}
                            style={{
                                opacity: status.phase === 'POST_POLL' ? 1 : 0.6,
                                background: '#FFF3E0',
                                color: '#F47920',
                                border: '2px solid #F47920',
                                padding: '1rem 2rem',
                                fontWeight: 700,
                                flex: 1,
                                height: '60px'
                            }}
                        >
                            End Election (Post-Poll) ⏭
                        </button>

                    </div>
                    <p style={{ textAlign: 'center', marginTop: '1.5rem', color: '#666', fontSize: '1rem', fontWeight: 500 }}>
                        <AlertTriangle size={16} style={{ marginBottom: '-3px', marginRight: '5px' }} />
                        Moving to "Post-Poll" will permanently close voting lines and enable result generation.
                    </p>
                </div>

            </div>
        </div>
    );
};

export default LifecycleController;
