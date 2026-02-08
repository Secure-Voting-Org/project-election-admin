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
            const res = await fetch(`http://${window.location.hostname}:5000/api/election/status`);
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
            await fetch(`http://${window.location.hostname}:5000/api/election/update`, {
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
            await fetch(`http://${window.location.hostname}:5000/api/election/update`, {
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3>Election Lifecycle Control</h3>
                <span className="phase-badge phase-live">Live Control</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>

                {/* Visual Status Monitor */}
                <div className="card" style={{ textAlign: 'center' }}>
                    <h4 style={{ marginTop: 0, color: '#666' }}>Current System Status</h4>
                    <div style={{
                        margin: '2rem auto',
                        width: '120px', height: '120px',
                        borderRadius: '50%',
                        background: status.is_kill_switch_active ? '#ffebee' : '#e8f5e9',
                        color: status.is_kill_switch_active ? '#c62828' : '#2e7d32',
                        display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                        border: `4px solid ${status.is_kill_switch_active ? '#c62828' : '#2e7d32'}`
                    }}>
                        {status.is_kill_switch_active ? <AlertTriangle size={40} /> : <CheckCircle size={40} />}
                        <div style={{ fontSize: '0.9rem', fontWeight: 700, marginTop: '0.5rem' }}>
                            {status.is_kill_switch_active ? 'SUSPENDED' : 'ACTIVE'}
                        </div>
                    </div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 600 }}>
                        Phase: <span style={{ color: '#1565C0' }}>{status.phase.replace('_', ' ')}</span>
                    </div>
                    <button onClick={fetchStatus} style={{ marginTop: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: '#666', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', width: '100%' }}>
                        <RefreshCw size={14} /> Refresh Status
                    </button>
                </div>

                {/* Kill Switch Area */}
                {status.phase === 'LIVE' && (
                    <div className="card" style={{ border: '2px solid #ffcdd2', background: '#fffbee' }}>
                        <h4 style={{ marginTop: 0, color: '#c62828', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <AlertTriangle size={20} /> Emergency Zone
                        </h4>
                        <p>
                            The Global Kill Switch immediately disables the "Cast Vote" functionality on all voter terminals connected to the network. Use only in case of security breach or technical failure.
                        </p>

                        <button
                            onClick={toggleKillSwitch}
                            disabled={loading}
                            style={{
                                width: '100%',
                                padding: '1.5rem',
                                fontSize: '1.2rem',
                                fontWeight: 800,
                                borderRadius: '12px',
                                border: 'none',
                                cursor: 'pointer',
                                marginTop: '1rem',
                                background: status.is_kill_switch_active ? '#2e7d32' : '#c62828',
                                color: 'white',
                                boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
                            }}
                        >
                            {status.is_kill_switch_active ? 'RESUME ELECTION' : 'STOP ELECTION (KILL SWITCH)'}
                        </button>
                    </div>
                )}



            </div>
        </div>
    );
};

export default LifecycleController;
