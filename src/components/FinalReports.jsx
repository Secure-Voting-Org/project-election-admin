import React, { useState, useEffect } from 'react';
import API_BASE from '../config/api';
import { FileText, TrendingUp, CheckCircle, BarChart3, Trophy, Users, PieChart, Star, Medal, Lock } from 'lucide-react';

const FinalReports = () => {
    const [summary, setSummary] = useState(null);
    const [turnout, setTurnout] = useState(null);
    const [activeView, setActiveView] = useState('summary');
    const [electionPhase, setElectionPhase] = useState(null);

    useEffect(() => {
        fetchElectionPhase();
        fetchSummary();
        fetchTurnout();
    }, []);

    const fetchElectionPhase = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/election/status`);
            const data = await res.json();
            setElectionPhase(data.phase || 'PRE_POLL');
        } catch {
            setElectionPhase('POST_POLL');
        }
    };

    const fetchSummary = async () => {
        try {
            const token = localStorage.getItem('admin_token');
            const res = await fetch(`${API_BASE}/api/results/summary`, {
                headers: { 'Authorization': token ? `Bearer ${token}` : '' }
            });
            const data = await res.json();
            setSummary(data.error
                ? { totalConstituencies: 0, totalVotes: 0, totalVoters: 0, votedCount: 0, turnoutPercentage: '0.00', partyResults: [] }
                : data);
        } catch {
            setSummary({ totalConstituencies: 0, totalVotes: 0, totalVoters: 0, votedCount: 0, turnoutPercentage: '0.00', partyResults: [] });
        }
    };

    const fetchTurnout = async () => {
        try {
            const token = localStorage.getItem('admin_token');
            const res = await fetch(`${API_BASE}/api/results/turnout`, {
                headers: { 'Authorization': token ? `Bearer ${token}` : '' }
            });
            const data = await res.json();
            if (!data.error) setTurnout(data);
        } catch (err) {
            console.error('Failed to fetch turnout', err);
        }
    };

    const styles = {
        header: {
            background: '#000080',
            borderRadius: '16px',
            padding: '2rem',
            marginBottom: '2rem',
            boxShadow: '0 8px 32px rgba(0,0,128,0.3)',
            borderTop: '5px solid #F47920',
            position: 'relative',
            overflow: 'hidden'
        },
        tabContainer: {
            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
            borderRadius: '16px',
            padding: '0.75rem',
            marginBottom: '2rem',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            display: 'flex',
            gap: '0.75rem',
            border: '1px solid rgba(0,0,128,0.1)'
        },
        statCard: (gradient, glowColor) => ({
            background: gradient,
            borderRadius: '16px',
            padding: '2rem',
            color: 'white',
            boxShadow: `0 8px 24px ${glowColor}, 0 0 40px ${glowColor}`,
            position: 'relative',
            overflow: 'hidden',
            transition: 'all 0.3s ease',
            cursor: 'pointer'
        }),
        card: {
            background: 'white',
            borderRadius: '16px',
            padding: '2rem',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            border: '1px solid rgba(0,0,0,0.05)',
            marginBottom: '1.5rem'
        }
    };

    // Phase Gate
    if (electionPhase && electionPhase !== 'POST_POLL') {
        return (
            <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                padding: '5rem 2rem', textAlign: 'center',
                background: 'white', borderRadius: '16px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                border: '2px dashed #ddd'
            }}>
                <div style={{
                    width: '80px', height: '80px', borderRadius: '50%',
                    background: electionPhase === 'LIVE'
                        ? 'linear-gradient(135deg, #138808, #0d5c05)'
                        : 'linear-gradient(135deg, #000080, #1a237e)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: '2rem',
                    boxShadow: electionPhase === 'LIVE'
                        ? '0 8px 24px rgba(19,136,8,0.4)'
                        : '0 8px 24px rgba(0,0,128,0.4)'
                }}>
                    <Lock size={36} color="white" />
                </div>
                <h2 style={{ color: '#000080', margin: '0 0 1rem', fontSize: '2rem', fontWeight: 800 }}>
                    Results Not Available Yet
                </h2>
                <p style={{ color: '#6C757D', fontSize: '1.1rem', maxWidth: '480px', lineHeight: 1.6 }}>
                    {electionPhase === 'LIVE'
                        ? '🗳️ Voting is currently in progress. Final results will be available once the election ends (POST_POLL phase).'
                        : '📋 The election has not started yet. Results will be available after voting ends.'}
                </p>
                <div style={{
                    marginTop: '2rem', padding: '0.75rem 1.5rem', borderRadius: '8px',
                    background: electionPhase === 'LIVE' ? '#E8F5E9' : '#E3F2FD',
                    color: electionPhase === 'LIVE' ? '#138808' : '#1565C0',
                    fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.5rem'
                }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'currentColor', display: 'inline-block' }} />
                    Current Phase: {electionPhase && electionPhase.replace('_', ' ')}
                </div>
            </div>
        );
    }

    return (
        <div>
            {/* Animated Header */}
            <div style={styles.header}>
                <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'radial-gradient(circle at 20% 50%, rgba(244,121,32,0.2) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(19,136,8,0.2) 0%, transparent 50%)',
                    animation: 'pulse 4s ease-in-out infinite'
                }} />
                <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h2 style={{ margin: 0, color: 'white', fontSize: '2.25rem', fontWeight: 800 }}>
                            Final Reports &amp; Results
                        </h2>
                        <p style={{ margin: '0.75rem 0 0', color: 'rgba(255,255,255,0.95)', fontSize: '1.1rem', fontWeight: 500 }}>
                            Official Election Results Dashboard - Powered by Secure Voting System
                        </p>
                    </div>
                    <span style={{
                        background: 'white', color: '#F47920', fontWeight: 800,
                        padding: '0.75rem 1.5rem', borderRadius: '8px', fontSize: '1.1rem',
                        boxShadow: '0 4px 16px rgba(244,121,32,0.5)'
                    }}>POST-POLL</span>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div style={styles.tabContainer}>
                <button
                    onClick={() => setActiveView('summary')}
                    style={{
                        flex: 1, padding: '1rem 1.5rem', border: 'none', borderRadius: '12px',
                        cursor: 'pointer', fontWeight: 700, fontSize: '1rem',
                        transition: 'all 0.3s ease',
                        background: activeView === 'summary' ? '#000080' : 'transparent',
                        color: activeView === 'summary' ? 'white' : '#6C757D',
                        boxShadow: activeView === 'summary' ? '0 4px 16px rgba(0,0,128,0.4)' : 'none',
                        transform: activeView === 'summary' ? 'translateY(-2px)' : 'none'
                    }}
                >
                    Election Summary
                </button>
                <button
                    onClick={() => setActiveView('turnout')}
                    style={{
                        flex: 1, padding: '1rem 1.5rem', border: 'none', borderRadius: '12px',
                        cursor: 'pointer', fontWeight: 700, fontSize: '1rem',
                        transition: 'all 0.3s ease',
                        background: activeView === 'turnout' ? '#000080' : 'transparent',
                        color: activeView === 'turnout' ? 'white' : '#6C757D',
                        boxShadow: activeView === 'turnout' ? '0 4px 16px rgba(0,0,128,0.4)' : 'none',
                        transform: activeView === 'turnout' ? 'translateY(-2px)' : 'none'
                    }}
                >
                    Voter Turnout
                </button>
            </div>

            {/* Election Summary View */}
            {activeView === 'summary' && (
                <div>
                    {!summary ? (
                        <div style={styles.card}>
                            <div style={{ textAlign: 'center', padding: '3rem' }}>
                                <div className="spinner" style={{ margin: '0 auto 1rem' }}></div>
                                <div style={{ fontSize: '1.1rem', color: '#6C757D' }}>Loading election summary...</div>
                            </div>
                        </div>
                    ) : (
                        <div>
                            {/* Top 4 Stat Cards */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
                                <div style={styles.statCard('linear-gradient(135deg, #000080 0%, #0d47a1 100%)', 'rgba(0,0,128,0.3)')} className="stat-card-hover">
                                    <div style={{ position: 'absolute', top: '1rem', right: '1rem', opacity: 0.2 }}><Medal size={64} /></div>
                                    <div style={{ position: 'relative', zIndex: 1 }}>
                                        <div style={{ fontSize: '0.9rem', opacity: 0.95, marginBottom: '0.75rem', fontWeight: 600 }}>Total Constituencies</div>
                                        <div style={{ fontSize: '3.5rem', fontWeight: 800, lineHeight: 1 }}>{summary.totalConstituencies || 0}</div>
                                        <div style={{ fontSize: '0.85rem', opacity: 0.9, marginTop: '0.5rem' }}>Across all regions</div>
                                    </div>
                                </div>
                                <div style={styles.statCard('linear-gradient(135deg, #138808 0%, #0a5a04 100%)', 'rgba(19,136,8,0.3)')} className="stat-card-hover">
                                    <div style={{ position: 'absolute', top: '1rem', right: '1rem', opacity: 0.2 }}><CheckCircle size={64} /></div>
                                    <div style={{ position: 'relative', zIndex: 1 }}>
                                        <div style={{ fontSize: '0.9rem', opacity: 0.95, marginBottom: '0.75rem', fontWeight: 600 }}>Total Votes Cast</div>
                                        <div style={{ fontSize: '3.5rem', fontWeight: 800, lineHeight: 1 }}>{(summary.totalVotes || 0).toLocaleString()}</div>
                                        <div style={{ fontSize: '0.85rem', opacity: 0.9, marginTop: '0.5rem' }}>Verified votes</div>
                                    </div>
                                </div>
                                <div style={styles.statCard('linear-gradient(135deg, #F47920 0%, #d65a0a 100%)', 'rgba(244,121,32,0.3)')} className="stat-card-hover">
                                    <div style={{ position: 'absolute', top: '1rem', right: '1rem', opacity: 0.2 }}><Users size={64} /></div>
                                    <div style={{ position: 'relative', zIndex: 1 }}>
                                        <div style={{ fontSize: '0.9rem', opacity: 0.95, marginBottom: '0.75rem', fontWeight: 600 }}>Registered Voters</div>
                                        <div style={{ fontSize: '3.5rem', fontWeight: 800, lineHeight: 1 }}>{(summary.totalVoters || 0).toLocaleString()}</div>
                                        <div style={{ fontSize: '0.85rem', opacity: 0.9, marginTop: '0.5rem' }}>Eligible voters</div>
                                    </div>
                                </div>
                                <div style={styles.statCard('linear-gradient(135deg, #000080 0%, #0d47a1 100%)', 'rgba(0,0,128,0.3)')} className="stat-card-hover">
                                    <div style={{ position: 'absolute', top: '1rem', right: '1rem', opacity: 0.2 }}><TrendingUp size={64} /></div>
                                    <div style={{ position: 'relative', zIndex: 1 }}>
                                        <div style={{ fontSize: '0.9rem', opacity: 0.95, marginBottom: '0.75rem', fontWeight: 600 }}>Voter Turnout</div>
                                        <div style={{ fontSize: '3.5rem', fontWeight: 800, lineHeight: 1 }}>{summary.turnoutPercentage || 0}%</div>
                                        <div style={{ fontSize: '0.85rem', opacity: 0.9, marginTop: '0.5rem' }}>Participation rate</div>
                                    </div>
                                </div>
                            </div>

                            {/* Leading Party Highlight */}
                            {summary.partyResults && summary.partyResults.length > 0 && (
                                <div style={{
                                    background: 'linear-gradient(135deg, #138808 0%, #0d5c05 100%)',
                                    borderRadius: '16px', padding: '2rem', marginBottom: '2rem', color: 'white',
                                    display: 'flex', alignItems: 'center', gap: '2rem',
                                    boxShadow: '0 8px 32px rgba(19,136,8,0.4)'
                                }}>
                                    <Trophy size={56} style={{ flexShrink: 0, filter: 'drop-shadow(0 0 16px rgba(255,255,255,0.5))' }} />
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '0.9rem', opacity: 0.9, fontWeight: 600, letterSpacing: '2px', marginBottom: '0.5rem' }}>
                                            🥇 LEADING PARTY
                                        </div>
                                        <div style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '0.25rem' }}>
                                            {summary.partyResults[0].party}
                                        </div>
                                        <div style={{ fontSize: '1.1rem', opacity: 0.95 }}>
                                            {(summary.partyResults[0].vote_count || 0).toLocaleString()} votes &bull; {summary.partyResults[0].vote_share || 0}% share
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'center', padding: '1.5rem', background: 'rgba(255,255,255,0.15)', borderRadius: '12px' }}>
                                        <div style={{ fontSize: '0.85rem', opacity: 0.9, marginBottom: '0.5rem' }}>Margin of Lead</div>
                                        <div style={{ fontSize: '2rem', fontWeight: 900 }}>
                                            {summary.partyResults.length > 1
                                                ? ((parseFloat(summary.partyResults[0].vote_share) || 0) - (parseFloat(summary.partyResults[1].vote_share) || 0)).toFixed(2)
                                                : summary.partyResults[0].vote_share || 0}%
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Metadata Cards */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
                                <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.06)', borderTop: '4px solid #000080', textAlign: 'center' }}>
                                    <div style={{ fontSize: '0.85rem', color: '#6C757D', fontWeight: 600, marginBottom: '0.5rem' }}>TOTAL PARTIES CONTESTED</div>
                                    <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#000080' }}>{(summary.partyResults && summary.partyResults.length) || 0}</div>
                                </div>
                                <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.06)', borderTop: '4px solid #138808', textAlign: 'center' }}>
                                    <div style={{ fontSize: '0.85rem', color: '#6C757D', fontWeight: 600, marginBottom: '0.5rem' }}>VOTES NOT CAST</div>
                                    <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#138808' }}>
                                        {((summary.totalVoters || 0) - (summary.votedCount || 0)).toLocaleString()}
                                    </div>
                                </div>
                                <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.06)', borderTop: '4px solid #F47920', textAlign: 'center' }}>
                                    <div style={{ fontSize: '0.85rem', color: '#6C757D', fontWeight: 600, marginBottom: '0.5rem' }}>AVG VOTES PER CONSTITUENCY</div>
                                    <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#F47920' }}>
                                        {summary.totalConstituencies > 0
                                            ? Math.round((summary.totalVotes || 0) / summary.totalConstituencies).toLocaleString()
                                            : 0}
                                    </div>
                                </div>
                            </div>

                            {/* Party-wise Distribution */}
                            <div style={styles.card}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '2px solid #f0f0f0' }}>
                                    <div style={{ background: 'linear-gradient(135deg, #000080, #1a237e)', padding: '0.75rem', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,128,0.3)' }}>
                                        <PieChart size={28} style={{ color: 'white' }} />
                                    </div>
                                    <div>
                                        <h3 style={{ margin: 0, color: '#000080', fontSize: '1.75rem', fontWeight: 800 }}>Party-wise Vote Distribution</h3>
                                        <p style={{ margin: '0.25rem 0 0', color: '#6C757D' }}>Detailed breakdown of votes by political party</p>
                                    </div>
                                </div>
                                {summary.partyResults && summary.partyResults.length > 0 ? (
                                    <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 0.5rem' }}>
                                        <thead>
                                            <tr style={{ background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)' }}>
                                                <th style={{ padding: '1.25rem', color: '#000080', fontWeight: 800, textAlign: 'left', borderRadius: '8px 0 0 8px' }}>Party Name</th>
                                                <th style={{ padding: '1.25rem', color: '#000080', fontWeight: 800, textAlign: 'left' }}>Total Votes</th>
                                                <th style={{ padding: '1.25rem', color: '#000080', fontWeight: 800, textAlign: 'left' }}>Vote Share</th>
                                                <th style={{ padding: '1.25rem', color: '#000080', fontWeight: 800, textAlign: 'left', borderRadius: '0 8px 8px 0' }}>Visual Distribution</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {summary.partyResults.map((party, idx) => (
                                                <tr key={idx} style={{
                                                    background: idx === 0 ? 'linear-gradient(90deg, rgba(19,136,8,0.1) 0%, rgba(19,136,8,0.05) 100%)' : 'white',
                                                    transition: 'all 0.3s ease',
                                                    borderLeft: idx === 0 ? '5px solid #138808' : '5px solid transparent'
                                                }}>
                                                    <td style={{ padding: '1.25rem', fontWeight: 700, color: '#212529', fontSize: '1.05rem' }}>
                                                        {idx === 0 && <Star size={18} style={{ marginBottom: '-3px', marginRight: '0.5rem', color: '#F47920', fill: '#F47920' }} />}
                                                        {party.party}
                                                        {idx === 0 && (
                                                            <span style={{
                                                                marginLeft: '0.75rem', background: 'linear-gradient(135deg, #138808, #0d5c05)',
                                                                color: 'white', padding: '0.25rem 0.75rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700
                                                            }}>LEADING</span>
                                                        )}
                                                    </td>
                                                    <td style={{ padding: '1.25rem', color: '#212529', fontSize: '1.05rem', fontWeight: 600 }}>{(party.vote_count || 0).toLocaleString()}</td>
                                                    <td style={{ padding: '1.25rem', fontWeight: 800, color: '#138808', fontSize: '1.25rem' }}>{party.vote_share || 0}%</td>
                                                    <td style={{ padding: '1.25rem' }}>
                                                        <div style={{ width: '100%', background: '#e5e7eb', borderRadius: '12px', height: '28px', overflow: 'hidden' }}>
                                                            <div style={{
                                                                width: `${party.vote_share || 0}%`,
                                                                background: idx === 0 ? '#138808' : idx === 1 ? '#000080' : '#F47920',
                                                                height: '100%', borderRadius: '12px',
                                                                transition: 'width 1s ease'
                                                            }} />
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <p style={{ color: '#6C757D', textAlign: 'center', padding: '3rem', fontSize: '1.1rem' }}>
                                        No party results available yet. Run the Tally to see results.
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Voter Turnout View */}
            {activeView === 'turnout' && (
                <div>
                    {!turnout ? (
                        <div style={styles.card}>
                            <div style={{ textAlign: 'center', padding: '3rem' }}>
                                <div className="spinner" style={{ margin: '0 auto 1rem' }}></div>
                                <div style={{ fontSize: '1.1rem', color: '#6C757D' }}>Loading turnout data...</div>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <div style={{
                                ...styles.card,
                                background: 'linear-gradient(135deg, #000080 0%, #1a237e 100%)',
                                color: 'white', boxShadow: '0 8px 32px rgba(0,0,128,0.4)',
                                position: 'relative', overflow: 'hidden'
                            }}>
                                <div style={{ position: 'relative', zIndex: 1 }}>
                                    <h3 style={{ margin: '0 0 2rem 0', fontSize: '2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <TrendingUp size={32} />
                                        Overall Voter Turnout
                                    </h3>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '3rem' }}>
                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{ fontSize: '4rem', fontWeight: 900 }}>{(turnout.overall.total || 0).toLocaleString()}</div>
                                            <div style={{ fontSize: '1.1rem', opacity: 0.95, fontWeight: 600, marginTop: '0.5rem' }}>Total Voters</div>
                                        </div>
                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{ fontSize: '4rem', fontWeight: 900 }}>{(turnout.overall.voted || 0).toLocaleString()}</div>
                                            <div style={{ fontSize: '1.1rem', opacity: 0.95, fontWeight: 600, marginTop: '0.5rem' }}>Votes Cast</div>
                                        </div>
                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{ fontSize: '4rem', fontWeight: 900, color: '#F47920' }}>{turnout.overall.percentage || 0}%</div>
                                            <div style={{ fontSize: '1.1rem', opacity: 0.95, fontWeight: 600, marginTop: '0.5rem' }}>Turnout</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div style={styles.card}>
                                <h4 style={{ margin: '0 0 1.5rem 0', color: '#000080', fontSize: '1.5rem', fontWeight: 800 }}>Constituency-wise Turnout</h4>
                                {turnout.byConstituency && turnout.byConstituency.length > 0 ? (
                                    <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 0.5rem' }}>
                                        <thead>
                                            <tr style={{ background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)' }}>
                                                <th style={{ padding: '1.25rem', color: '#000080', textAlign: 'left', fontWeight: 800, borderRadius: '8px 0 0 8px' }}>Constituency</th>
                                                <th style={{ padding: '1.25rem', color: '#000080', textAlign: 'left', fontWeight: 800 }}>Total Voters</th>
                                                <th style={{ padding: '1.25rem', color: '#000080', textAlign: 'left', fontWeight: 800 }}>Votes Cast</th>
                                                <th style={{ padding: '1.25rem', color: '#000080', textAlign: 'left', fontWeight: 800 }}>Turnout %</th>
                                                <th style={{ padding: '1.25rem', color: '#000080', textAlign: 'left', fontWeight: 800, borderRadius: '0 8px 8px 0' }}>Visual</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {turnout.byConstituency.map((c, idx) => {
                                                const pct = parseFloat(c.percentage);
                                                const color = pct > 70 ? '#138808' : pct > 50 ? '#F47920' : '#dc3545';
                                                return (
                                                    <tr key={idx} style={{ background: 'white', transition: 'all 0.3s ease' }}>
                                                        <td style={{ padding: '1.25rem', fontWeight: 700, fontSize: '1.05rem' }}>{c.constituency}</td>
                                                        <td style={{ padding: '1.25rem', color: '#6C757D', fontWeight: 600 }}>{(c.total_voters || 0).toLocaleString()}</td>
                                                        <td style={{ padding: '1.25rem', color: '#6C757D', fontWeight: 600 }}>{(c.voted_count || 0).toLocaleString()}</td>
                                                        <td style={{ padding: '1.25rem', fontWeight: 800, color, fontSize: '1.25rem' }}>{c.percentage || 0}%</td>
                                                        <td style={{ padding: '1.25rem' }}>
                                                            <div style={{ width: '100%', background: '#e5e7eb', borderRadius: '12px', height: '28px', overflow: 'hidden' }}>
                                                                <div style={{ width: `${c.percentage || 0}%`, background: color, height: '100%', borderRadius: '12px', transition: 'width 1s ease' }} />
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                ) : (
                                    <p style={{ color: '#6C757D', textAlign: 'center', padding: '3rem', fontSize: '1.1rem' }}>No turnout data available yet</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}

            <style>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.7; }
                }
                .spinner {
                    width: 48px; height: 48px;
                    border: 4px solid #e5e7eb;
                    border-top: 4px solid #000080;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .stat-card-hover:hover {
                    transform: translateY(-4px) scale(1.02);
                }
            `}</style>
        </div>
    );
};

export default FinalReports;
