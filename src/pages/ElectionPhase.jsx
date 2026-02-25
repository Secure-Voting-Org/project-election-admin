/**
 * Module 5.1 — Election Phase State Machine (ElectionPhase.jsx)
 * 5.1.1.1: Displays the global state machine for election status
 * 5.1.2.1: Admin toggle switches to transition between phases + kill switch
 * ADDITIVE: New page only, does not modify any existing code
 */
import React, { useState, useEffect, useCallback } from 'react';

const API_URL = '/api';

const PHASES = ['PRE_POLL', 'LIVE', 'POST_POLL'];

const PHASE_META = {
    PRE_POLL: {
        label: 'Pre-Poll',
        subtitle: 'Election Not Started',
        color: '#6C757D',
        bg: '#F8F9FA',
        border: '#DEE2E6',
        icon: '🕐',
        desc: 'The election has not yet begun. Voting is blocked. Voters cannot submit ballots.'
    },
    LIVE: {
        label: 'Voting Open',
        subtitle: 'Live Election',
        color: '#1A6B3A',
        bg: '#D4EDDA',
        border: '#28A745',
        icon: '✅',
        desc: 'The election is live. Voters can submit encrypted ballots. All routes are open.'
    },
    POST_POLL: {
        label: 'Post-Poll',
        subtitle: 'Election Ended',
        color: '#856404',
        bg: '#FFF3CD',
        border: '#FFC107',
        icon: '🔒',
        desc: 'Voting has closed. No more ballots accepted. Results can now be tallied.'
    }
};

const TRANSITIONS = {
    PRE_POLL: 'LIVE',
    LIVE: 'POST_POLL',
    POST_POLL: null  // Terminal state — cannot advance further
};

const ElectionPhase = () => {
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [message, setMessage] = useState(null);

    const fetchStatus = useCallback(async () => {
        try {
            const res = await fetch(`${API_URL}/election/status`);
            if (!res.ok) throw new Error('Failed');
            const data = await res.json();
            setStatus(data);
        } catch {
            setMessage({ type: 'error', text: 'Could not load election status from server.' });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStatus();
        const interval = setInterval(fetchStatus, 10000); // Poll every 10s
        return () => clearInterval(interval);
    }, [fetchStatus]);

    const transitionPhase = async (newPhase) => {
        setUpdating(true);
        setMessage(null);
        try {
            const res = await fetch(`${API_URL}/election/update`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phase: newPhase })
            });
            if (!res.ok) throw new Error('Update failed');
            await fetchStatus();
            setMessage({ type: 'success', text: `Election phase updated to ${PHASE_META[newPhase].label}.` });
        } catch {
            setMessage({ type: 'error', text: 'Failed to update election phase. Try again.' });
        } finally {
            setUpdating(false);
        }
    };

    const toggleKillSwitch = async () => {
        if (!status) return;
        setUpdating(true);
        setMessage(null);
        try {
            const res = await fetch(`${API_URL}/election/update`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isKillSwitch: !status.is_kill_switch_active })
            });
            if (!res.ok) throw new Error('Failed');
            await fetchStatus();
            setMessage({
                type: status.is_kill_switch_active ? 'success' : 'error',
                text: status.is_kill_switch_active
                    ? 'Kill switch deactivated. Election is live again.'
                    : '🚨 Emergency Kill Switch ACTIVATED. Voting is now suspended.'
            });
        } catch {
            setMessage({ type: 'error', text: 'Failed to toggle kill switch.' });
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <div style={{ padding: '2rem', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
                <div style={{ fontSize: '1rem', color: '#6C757D' }}>Loading election state...</div>
            </div>
        );
    }

    const currentPhase = status?.phase || 'PRE_POLL';
    const nextPhase = TRANSITIONS[currentPhase];
    const currentMeta = PHASE_META[currentPhase];
    const isKillActive = status?.is_kill_switch_active;

    return (
        <div style={{ padding: '0 1.5rem 2rem' }}>
            {/* Header */}
            <div style={{
                background: 'linear-gradient(135deg, #1A237E 0%, #283593 100%)',
                borderRadius: '12px',
                padding: '1.5rem 2rem',
                marginBottom: '1.5rem',
                color: 'white'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '1.5rem' }}>🗓️</span>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700 }}>Election Phase Controller</h2>
                        <p style={{ margin: 0, opacity: 0.8, fontSize: '0.9rem' }}>Global State Machine for Election Lifecycle</p>
                    </div>
                </div>
            </div>

            {/* Notification Banner */}
            {message && (
                <div style={{
                    background: message.type === 'success' ? '#D4EDDA' : '#F8D7DA',
                    border: `1px solid ${message.type === 'success' ? '#28A745' : '#DC3545'}`,
                    color: message.type === 'success' ? '#1A6B3A' : '#721C24',
                    borderRadius: '8px',
                    padding: '0.75rem 1.25rem',
                    marginBottom: '1.5rem',
                    fontWeight: 600,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <span>{message.text}</span>
                    <button onClick={() => setMessage(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', paddingLeft: '1rem' }}>×</button>
                </div>
            )}

            {/* State Machine Visual — 5.1.1.1 */}
            <div style={{
                background: 'white',
                borderRadius: '12px',
                padding: '2rem',
                marginBottom: '1.5rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }}>
                <h3 style={{ margin: '0 0 1.5rem', color: '#1A237E', borderBottom: '2px solid #E8EAF6', paddingBottom: '0.75rem' }}>
                    Global Election State Machine
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0', flexWrap: 'wrap' }}>
                    {PHASES.map((phase, idx) => {
                        const meta = PHASE_META[phase];
                        const isActive = phase === currentPhase;
                        const isPast = PHASES.indexOf(phase) < PHASES.indexOf(currentPhase);
                        return (
                            <React.Fragment key={phase}>
                                {/* Phase Node */}
                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}>
                                    <div style={{
                                        width: '80px',
                                        height: '80px',
                                        borderRadius: '50%',
                                        background: isActive ? meta.bg : isPast ? '#E8F5E9' : '#F8F9FA',
                                        border: `3px solid ${isActive ? meta.border : isPast ? '#28A745' : '#DEE2E6'}`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '2rem',
                                        boxShadow: isActive ? `0 0 0 4px ${meta.border}40` : 'none',
                                        transition: 'all 0.3s ease'
                                    }}>
                                        {isPast ? '✅' : meta.icon}
                                    </div>
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{
                                            fontWeight: 700,
                                            color: isActive ? meta.color : isPast ? '#1A6B3A' : '#6C757D',
                                            fontSize: '0.85rem'
                                        }}>{meta.label}</div>
                                        {isActive && (
                                            <div style={{
                                                fontSize: '0.7rem',
                                                background: meta.border,
                                                color: 'white',
                                                padding: '0.1rem 0.5rem',
                                                borderRadius: '10px',
                                                fontWeight: 700,
                                                marginTop: '0.2rem'
                                            }}>CURRENT</div>
                                        )}
                                    </div>
                                </div>
                                {/* Arrow */}
                                {idx < PHASES.length - 1 && (
                                    <div style={{
                                        flex: 1,
                                        height: '3px',
                                        background: isPast ? '#28A745' : '#DEE2E6',
                                        minWidth: '60px',
                                        maxWidth: '120px',
                                        position: 'relative',
                                        margin: '-1.5rem 0.5rem 0'
                                    }}>
                                        <div style={{
                                            position: 'absolute',
                                            right: '-8px',
                                            top: '-6px',
                                            borderLeft: `12px solid ${isPast ? '#28A745' : '#DEE2E6'}`,
                                            borderTop: '7px solid transparent',
                                            borderBottom: '7px solid transparent'
                                        }} />
                                    </div>
                                )}
                            </React.Fragment>
                        );
                    })}
                </div>

                {/* Current Phase Description */}
                <div style={{
                    marginTop: '2rem',
                    padding: '1rem 1.5rem',
                    background: currentMeta.bg,
                    border: `1px solid ${currentMeta.border}`,
                    borderRadius: '8px',
                    color: currentMeta.color
                }}>
                    <strong>Current Status: {currentMeta.label}</strong>
                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.9rem' }}>{currentMeta.desc}</p>
                    {isKillActive && (
                        <p style={{ margin: '0.5rem 0 0', fontWeight: 700, color: '#DC3545' }}>
                            🚨 EMERGENCY KILL SWITCH IS ACTIVE — All voting is suspended!
                        </p>
                    )}
                </div>
            </div>

            {/* Phase Transition Controls — 5.1.2.1 */}
            <div style={{
                background: 'white',
                borderRadius: '12px',
                padding: '2rem',
                marginBottom: '1.5rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }}>
                <h3 style={{ margin: '0 0 1.5rem', color: '#1A237E', borderBottom: '2px solid #E8EAF6', paddingBottom: '0.75rem' }}>
                    Phase Transition Controls
                </h3>
                <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                    {PHASES.map(phase => {
                        const meta = PHASE_META[phase];
                        const isActive = phase === currentPhase;
                        const isNext = phase === nextPhase;
                        const isPast = PHASES.indexOf(phase) < PHASES.indexOf(currentPhase);
                        return (
                            <div key={phase} style={{
                                flex: '1',
                                minWidth: '180px',
                                border: `2px solid ${isActive ? meta.border : '#E0E0E0'}`,
                                borderRadius: '10px',
                                padding: '1.25rem',
                                background: isActive ? meta.bg : '#FAFAFA',
                                transition: 'all 0.2s'
                            }}>
                                <div style={{ fontWeight: 700, color: isActive ? meta.color : '#555' }}>{meta.icon} {meta.label}</div>
                                <div style={{ fontSize: '0.8rem', color: '#888', marginBottom: '1rem' }}>{meta.subtitle}</div>
                                {isActive && (
                                    <span style={{
                                        fontSize: '0.75rem',
                                        fontWeight: 700,
                                        background: meta.border,
                                        color: 'white',
                                        padding: '0.2rem 0.75rem',
                                        borderRadius: '12px'
                                    }}>ACTIVE</span>
                                )}
                                {isNext && (
                                    <button
                                        onClick={() => transitionPhase(phase)}
                                        disabled={updating}
                                        style={{
                                            background: meta.border,
                                            color: 'white',
                                            border: 'none',
                                            padding: '0.5rem 1rem',
                                            borderRadius: '6px',
                                            cursor: updating ? 'not-allowed' : 'pointer',
                                            fontWeight: 600,
                                            fontSize: '0.85rem',
                                            width: '100%'
                                        }}
                                    >
                                        {updating ? 'Updating...' : `Activate →`}
                                    </button>
                                )}
                                {isPast && (
                                    <span style={{ fontSize: '0.75rem', color: '#28A745', fontWeight: 600 }}>✓ Completed</span>
                                )}
                                {!isActive && !isNext && !isPast && (
                                    <span style={{ fontSize: '0.75rem', color: '#AAA' }}>Locked (sequential)</span>
                                )}
                            </div>
                        );
                    })}
                </div>
                {!nextPhase && currentPhase === 'POST_POLL' && (
                    <p style={{ marginTop: '1rem', color: '#856404', fontWeight: 600, fontSize: '0.9rem' }}>
                        ℹ️ POST POLL is a terminal state. The election lifecycle is complete. Proceed to the Tally page to decrypt results.
                    </p>
                )}
            </div>

            {/* Emergency Kill Switch */}
            <div style={{
                background: 'white',
                borderRadius: '12px',
                padding: '2rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                border: isKillActive ? '2px solid #DC3545' : '1px solid #E0E0E0'
            }}>
                <h3 style={{ margin: '0 0 1rem', color: '#1A237E', borderBottom: '2px solid #E8EAF6', paddingBottom: '0.75rem' }}>
                    Emergency Kill Switch
                </h3>
                <p style={{ color: '#555', fontSize: '0.9rem', marginTop: 0 }}>
                    Instantly suspends all vote submissions without changing the election phase. Use for emergency situations only.
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                    <div style={{
                        fontSize: '1rem',
                        fontWeight: 700,
                        color: isKillActive ? '#DC3545' : '#28A745'
                    }}>
                        Status: {isKillActive ? '🚨 SUSPENDED' : '✅ OPERATIONAL'}
                    </div>
                    <button
                        onClick={toggleKillSwitch}
                        disabled={updating}
                        style={{
                            background: isKillActive ? '#28A745' : '#DC3545',
                            color: 'white',
                            border: 'none',
                            padding: '0.75rem 1.75rem',
                            borderRadius: '8px',
                            fontWeight: 700,
                            fontSize: '0.95rem',
                            cursor: updating ? 'not-allowed' : 'pointer',
                        }}
                    >
                        {updating ? 'Processing...' : isKillActive ? 'Deactivate Kill Switch' : '🚨 Activate Kill Switch'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ElectionPhase;
