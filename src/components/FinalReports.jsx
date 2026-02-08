import React, { useState, useEffect } from 'react';
import { FileText, TrendingUp, Award, Download, CheckCircle, BarChart3, Trophy, Users, PieChart, Star, Sparkles, Medal } from 'lucide-react';

const FinalReports = () => {
    const [constituencies, setConstituencies] = useState([]);
    const [selectedConstituency, setSelectedConstituency] = useState(null);
    const [constituencyResults, setConstituencyResults] = useState(null);
    const [summary, setSummary] = useState(null);
    const [turnout, setTurnout] = useState(null);
    const [form20, setForm20] = useState(null);
    const [loading, setLoading] = useState(false);
    const [activeView, setActiveView] = useState('summary');

    useEffect(() => {
        fetchConstituencies();
        fetchSummary();
        fetchTurnout();
    }, []);

    const fetchConstituencies = async () => {
        try {
            const res = await fetch(`http://${window.location.hostname}:8081/api/constituencies`);
            const data = await res.json();
            setConstituencies(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Failed to fetch constituencies', err);
            setConstituencies([]);
        }
    };

    const fetchSummary = async () => {
        try {
            const res = await fetch(`http://${window.location.hostname}:8081/api/results/summary`);
            const data = await res.json();
            if (!data.error) {
                setSummary(data);
            }
        } catch (err) {
            console.error('Failed to fetch summary', err);
        }
    };

    const fetchTurnout = async () => {
        try {
            const res = await fetch(`http://${window.location.hostname}:8081/api/results/turnout`);
            const data = await res.json();
            if (!data.error) {
                setTurnout(data);
            }
        } catch (err) {
            console.error('Failed to fetch turnout', err);
        }
    };

    const fetchConstituencyResults = async (id) => {
        setLoading(true);
        try {
            const res = await fetch(`http://${window.location.hostname}:8081/api/results/constituency/${id}`);
            const data = await res.json();
            setConstituencyResults(data);
            setSelectedConstituency(id);
        } catch (err) {
            console.error('Failed to fetch constituency results', err);
        } finally {
            setLoading(false);
        }
    };

    const generateForm20 = async (id) => {
        setLoading(true);
        try {
            const res = await fetch(`http://${window.location.hostname}:8081/api/results/form20/${id}`);
            const data = await res.json();
            setForm20(data);
            setActiveView('form20');
        } catch (err) {
            console.error('Failed to generate Form 20', err);
        } finally {
            setLoading(false);
        }
    };

    const declareResults = async (constituencyId) => {
        if (!window.confirm('Are you sure you want to declare results for this constituency?')) return;

        setLoading(true);
        try {
            const admin = JSON.parse(localStorage.getItem('admin_token'));
            const res = await fetch(`http://${window.location.hostname}:8081/api/results/declare/${constituencyId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    adminUsername: admin.username,
                    adminRole: admin.role
                })
            });
            const data = await res.json();
            if (data.success) {
                alert(`Results declared successfully for ${data.constituency}!\nWinner: ${data.winner.name} (${data.winner.party})`);
            } else {
                alert('Failed to declare results: ' + data.error);
            }
        } catch (err) {
            console.error('Failed to declare results', err);
            alert('Failed to declare results');
        } finally {
            setLoading(false);
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
            boxShadow: '0 4px 20px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.5)',
            display: 'flex',
            gap: '0.75rem',
            border: '1px solid rgba(0,0,128,0.1)'
        },
        tab: (isActive) => ({
            flex: 1,
            padding: '1rem 1.5rem',
            border: 'none',
            background: isActive
                ? 'linear-gradient(135deg, #000080 0%, #1a237e 100%)'
                : 'transparent',
            color: isActive ? 'white' : '#6C757D',
            fontWeight: 700,
            borderRadius: '12px',
            cursor: 'pointer',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
            boxShadow: isActive ? '0 4px 16px rgba(0,0,128,0.4), 0 0 20px rgba(0,0,128,0.2)' : 'none',
            transform: isActive ? 'translateY(-2px)' : 'none'
        }),
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
        winnerCard: {
            background: 'linear-gradient(135deg, #138808 0%, #0d5c05 50%, #138808 100%)',
            color: 'white',
            borderRadius: '16px',
            padding: '2.5rem',
            marginBottom: '1.5rem',
            boxShadow: '0 8px 32px rgba(19,136,8,0.4), 0 0 60px rgba(19,136,8,0.3)',
            position: 'relative',
            overflow: 'hidden',
            border: '2px solid rgba(255,255,255,0.2)'
        },
        card: {
            background: 'white',
            borderRadius: '16px',
            padding: '2rem',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            border: '1px solid rgba(0,0,0,0.05)',
            transition: 'all 0.3s ease'
        }
    };

    return (
        <div>
            {/* Animated Header */}
            <div style={styles.header}>
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'radial-gradient(circle at 20% 50%, rgba(244,121,32,0.2) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(19,136,8,0.2) 0%, transparent 50%)',
                    animation: 'pulse 4s ease-in-out infinite'
                }} />
                <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h2 style={{ margin: 0, color: 'white', fontSize: '2.25rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            Final Reports & Results
                        </h2>
                        <p style={{ margin: '0.75rem 0 0', color: 'rgba(255,255,255,0.95)', fontSize: '1.1rem', fontWeight: 500 }}>
                            Official Election Results Dashboard - Powered by Secure Voting System
                        </p>
                    </div>
                    <span className="phase-badge phase-post" style={{
                        boxShadow: '0 4px 16px rgba(244,121,32,0.5)',
                        fontSize: '1.1rem',
                        padding: '0.75rem 1.5rem'
                    }}>POST-POLL</span>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div style={styles.tabContainer}>
                <button onClick={() => setActiveView('summary')} style={{
                    flex: 1,
                    padding: '1rem 1.5rem',
                    border: 'none',
                    background: activeView === 'summary' ? '#000080' : 'transparent',
                    color: activeView === 'summary' ? 'white' : '#6C757D',
                    fontWeight: 700,
                    borderRadius: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.75rem',
                    boxShadow: activeView === 'summary' ? '0 4px 16px rgba(0,0,128,0.4)' : 'none',
                    transform: activeView === 'summary' ? 'translateY(-2px)' : 'none'
                }}>
                    Election Summary
                </button>
                <button onClick={() => setActiveView('constituencies')} style={{
                    flex: 1,
                    padding: '1rem 1.5rem',
                    border: 'none',
                    background: activeView === 'constituencies' ? '#000080' : 'transparent',
                    color: activeView === 'constituencies' ? 'white' : '#6C757D',
                    fontWeight: 700,
                    borderRadius: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.75rem',
                    boxShadow: activeView === 'constituencies' ? '0 4px 16px rgba(0,0,128,0.4)' : 'none',
                    transform: activeView === 'constituencies' ? 'translateY(-2px)' : 'none'
                }}>
                    Constituency Results
                </button>
                <button onClick={() => setActiveView('turnout')} style={{
                    flex: 1,
                    padding: '1rem 1.5rem',
                    border: 'none',
                    background: activeView === 'turnout' ? '#000080' : 'transparent',
                    color: activeView === 'turnout' ? 'white' : '#6C757D',
                    fontWeight: 700,
                    borderRadius: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.75rem',
                    boxShadow: activeView === 'turnout' ? '0 4px 16px rgba(0,0,128,0.4)' : 'none',
                    transform: activeView === 'turnout' ? 'translateY(-2px)' : 'none'
                }}>
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
                            {/* Stats Cards */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
                                <div
                                    style={styles.statCard(
                                        'linear-gradient(135deg, #000080 0%, #0d47a1 50%, #000080 100%)',
                                        'rgba(0,0,128,0.3)'
                                    )}
                                    className="stat-card-hover"
                                >
                                    <div style={{ position: 'absolute', top: '1rem', right: '1rem', opacity: 0.2 }}>
                                        <Medal size={64} />
                                    </div>
                                    <div style={{ position: 'relative', zIndex: 1 }}>
                                        <div style={{ fontSize: '0.9rem', opacity: 0.95, marginBottom: '0.75rem', fontWeight: 600 }}>Total Constituencies</div>
                                        <div style={{ fontSize: '3.5rem', fontWeight: 800, lineHeight: 1 }}>{summary.totalConstituencies || 0}</div>
                                        <div style={{ fontSize: '0.85rem', opacity: 0.9, marginTop: '0.5rem' }}>Across all regions</div>
                                    </div>
                                </div>

                                <div
                                    style={styles.statCard(
                                        'linear-gradient(135deg, #138808 0%, #0a5a04 50%, #138808 100%)',
                                        'rgba(19,136,8,0.3)'
                                    )}
                                    className="stat-card-hover"
                                >
                                    <div style={{ position: 'absolute', top: '1rem', right: '1rem', opacity: 0.2 }}>
                                        <CheckCircle size={64} />
                                    </div>
                                    <div style={{ position: 'relative', zIndex: 1 }}>
                                        <div style={{ fontSize: '0.9rem', opacity: 0.95, marginBottom: '0.75rem', fontWeight: 600 }}>Total Votes Cast</div>
                                        <div style={{ fontSize: '3.5rem', fontWeight: 800, lineHeight: 1 }}>{(summary.totalVotes || 0).toLocaleString()}</div>
                                        <div style={{ fontSize: '0.85rem', opacity: 0.9, marginTop: '0.5rem' }}>Verified votes</div>
                                    </div>
                                </div>

                                <div
                                    style={styles.statCard(
                                        'linear-gradient(135deg, #F47920 0%, #d65a0a 50%, #F47920 100%)',
                                        'rgba(244,121,32,0.3)'
                                    )}
                                    className="stat-card-hover"
                                >
                                    <div style={{ position: 'absolute', top: '1rem', right: '1rem', opacity: 0.2 }}>
                                        <Users size={64} />
                                    </div>
                                    <div style={{ position: 'relative', zIndex: 1 }}>
                                        <div style={{ fontSize: '0.9rem', opacity: 0.95, marginBottom: '0.75rem', fontWeight: 600 }}>Registered Voters</div>
                                        <div style={{ fontSize: '3.5rem', fontWeight: 800, lineHeight: 1 }}>{(summary.totalVoters || 0).toLocaleString()}</div>
                                        <div style={{ fontSize: '0.85rem', opacity: 0.9, marginTop: '0.5rem' }}>Eligible voters</div>
                                    </div>
                                </div>

                                <div
                                    style={styles.statCard(
                                        'linear-gradient(135deg, #000080 0%, #0d47a1 50%, #000080 100%)',
                                        'rgba(0,0,128,0.3)'
                                    )}
                                    className="stat-card-hover"
                                >
                                    <div style={{ position: 'absolute', top: '1rem', right: '1rem', opacity: 0.2 }}>
                                        <TrendingUp size={64} />
                                    </div>
                                    <div style={{ position: 'relative', zIndex: 1 }}>
                                        <div style={{ fontSize: '0.9rem', opacity: 0.95, marginBottom: '0.75rem', fontWeight: 600 }}>Voter Turnout</div>
                                        <div style={{ fontSize: '3.5rem', fontWeight: 800, lineHeight: 1 }}>{summary.turnoutPercentage || 0}%</div>
                                        <div style={{ fontSize: '0.85rem', opacity: 0.9, marginTop: '0.5rem' }}>Participation rate</div>
                                    </div>
                                </div>
                            </div>

                            {/* Party Results */}
                            <div style={styles.card}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1rem',
                                    marginBottom: '2rem',
                                    paddingBottom: '1rem',
                                    borderBottom: '3px solid transparent',
                                    borderImage: 'linear-gradient(90deg, #000080, #F47920, #138808) 1'
                                }}>
                                    <div style={{
                                        background: 'linear-gradient(135deg, #000080, #1a237e)',
                                        padding: '0.75rem',
                                        borderRadius: '12px',
                                        boxShadow: '0 4px 12px rgba(0,0,128,0.3)'
                                    }}>
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
                                                    background: idx === 0
                                                        ? 'linear-gradient(90deg, rgba(19,136,8,0.1) 0%, rgba(19,136,8,0.05) 100%)'
                                                        : 'white',
                                                    transition: 'all 0.3s ease',
                                                    borderLeft: idx === 0 ? '5px solid #138808' : '5px solid transparent'
                                                }}>
                                                    <td style={{ padding: '1.25rem', fontWeight: 700, color: '#212529', fontSize: '1.05rem' }}>
                                                        {idx === 0 && <Star size={18} style={{ marginBottom: '-3px', marginRight: '0.5rem', color: '#F47920', fill: '#F47920' }} />}
                                                        {party.party}
                                                        {idx === 0 && <span style={{
                                                            marginLeft: '0.75rem',
                                                            background: 'linear-gradient(135deg, #138808, #0d5c05)',
                                                            color: 'white',
                                                            padding: '0.25rem 0.75rem',
                                                            borderRadius: '6px',
                                                            fontSize: '0.75rem',
                                                            fontWeight: 700,
                                                            boxShadow: '0 2px 8px rgba(19,136,8,0.3)'
                                                        }}>LEADING</span>}
                                                    </td>
                                                    <td style={{ padding: '1.25rem', color: '#212529', fontSize: '1.05rem', fontWeight: 600 }}>{(party.vote_count || 0).toLocaleString()}</td>
                                                    <td style={{ padding: '1.25rem', fontWeight: 800, color: '#138808', fontSize: '1.25rem' }}>{party.vote_share || 0}%</td>
                                                    <td style={{ padding: '1.25rem' }}>
                                                        <div style={{ width: '100%', background: 'linear-gradient(90deg, #e5e7eb, #f3f4f6)', borderRadius: '12px', height: '32px', overflow: 'hidden', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)' }}>
                                                            <div style={{
                                                                width: `${party.vote_share || 0}%`,
                                                                background: idx === 0
                                                                    ? 'linear-gradient(90deg, #138808, #0d5c05, #138808)'
                                                                    : idx === 1
                                                                        ? 'linear-gradient(90deg, #000080, #1a237e, #000080)'
                                                                        : 'linear-gradient(90deg, #F47920, #d65a0a, #F47920)',
                                                                height: '100%',
                                                                borderRadius: '12px',
                                                                transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)',
                                                                boxShadow: idx === 0 ? '0 0 20px rgba(19,136,8,0.5)' : '0 0 15px rgba(0,0,128,0.3)',
                                                                position: 'relative',
                                                                overflow: 'hidden'
                                                            }}>
                                                                <div style={{
                                                                    position: 'absolute',
                                                                    top: 0,
                                                                    left: 0,
                                                                    right: 0,
                                                                    bottom: 0,
                                                                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                                                                    animation: 'shimmer 2s infinite'
                                                                }} />
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <p style={{ color: '#6C757D', textAlign: 'center', padding: '3rem', fontSize: '1.1rem' }}>No party results available yet</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Constituency Results View */}
            {activeView === 'constituencies' && (
                <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '2rem' }}>
                    <div style={{ ...styles.card, maxHeight: '700px', overflow: 'hidden', display: 'flex', flexDirection: 'column', padding: '1.5rem' }}>
                        <h4 style={{
                            margin: '0 0 1.5rem 0',
                            background: '#138808',
                            color: 'white',
                            padding: '1rem 1.25rem',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            fontSize: '1.25rem',
                            fontWeight: 800,
                            boxShadow: '0 4px 12px rgba(19,136,8,0.3)'
                        }}>
                            Select Constituency
                        </h4>
                        <div style={{ flex: 1, overflowY: 'auto', marginRight: '-0.5rem', paddingRight: '0.5rem' }}>
                            {constituencies.map((c) => (
                                <div
                                    key={c.id}
                                    onClick={() => fetchConstituencyResults(c.id)}
                                    style={{
                                        padding: '1.25rem',
                                        cursor: 'pointer',
                                        background: selectedConstituency === c.id
                                            ? '#138808'
                                            : 'white',
                                        color: selectedConstituency === c.id ? 'white' : '#212529',
                                        borderRadius: '12px',
                                        marginBottom: '0.75rem',
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        borderLeft: selectedConstituency === c.id ? '5px solid #F47920' : '5px solid transparent',
                                        boxShadow: selectedConstituency === c.id
                                            ? '0 6px 20px rgba(19,136,8,0.4)'
                                            : '0 2px 8px rgba(0,0,0,0.05)',
                                        transform: selectedConstituency === c.id ? 'translateX(4px)' : 'none'
                                    }}
                                    className="constituency-item"
                                >
                                    <div style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: '0.25rem' }}>{c.name}</div>
                                    <div style={{ fontSize: '0.9rem', opacity: 0.85 }}>{c.district}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        {loading && (
                            <div style={styles.card}>
                                <div style={{ textAlign: 'center', padding: '4rem' }}>
                                    <div className="spinner" style={{ margin: '0 auto 1rem' }}></div>
                                    <div style={{ fontSize: '1.1rem', color: '#6C757D' }}>Loading results...</div>
                                </div>
                            </div>
                        )}
                        {!loading && !constituencyResults && (
                            <div style={styles.card}>
                                <div style={{ textAlign: 'center', padding: '5rem', color: '#6C757D' }}>
                                    <FileText size={80} style={{ margin: '0 auto 1.5rem', opacity: 0.2 }} />
                                    <h3 style={{ color: '#6C757D', fontWeight: 600, fontSize: '1.5rem' }}>Select a constituency to view results</h3>
                                    <p style={{ marginTop: '0.5rem', opacity: 0.8 }}>Choose from the list on the left</p>
                                </div>
                            </div>
                        )}
                        {!loading && constituencyResults && constituencyResults.winner && (
                            <div>
                                <div style={{ ...styles.card, marginBottom: '1.5rem', background: 'linear-gradient(135deg, #000080 0%, #1a237e 100%)', color: 'white', boxShadow: '0 8px 32px rgba(0,0,128,0.4)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <h2 style={{ margin: 0, fontSize: '2rem', fontWeight: 800 }}>{constituencyResults.constituency.name}</h2>
                                            <p style={{ margin: '0.75rem 0 0', opacity: 0.95, fontSize: '1.1rem' }}>
                                                {constituencyResults.constituency.district}
                                            </p>
                                        </div>
                                        <div style={{ display: 'flex', gap: '1rem' }}>
                                            <button onClick={() => generateForm20(selectedConstituency)} className="btn" style={{
                                                background: 'linear-gradient(135deg, #F47920, #d65a0a)',
                                                color: 'white',
                                                boxShadow: '0 4px 16px rgba(244,121,32,0.4)',
                                                fontWeight: 700,
                                                padding: '0.875rem 1.5rem'
                                            }}>
                                                <FileText size={18} /> Form 20
                                            </button>
                                            <button onClick={() => declareResults(selectedConstituency)} className="btn" style={{
                                                background: 'linear-gradient(135deg, #138808, #0d5c05)',
                                                color: 'white',
                                                boxShadow: '0 4px 16px rgba(19,136,8,0.4)',
                                                fontWeight: 700,
                                                padding: '0.875rem 1.5rem'
                                            }}>
                                                <CheckCircle size={18} /> Declare
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div style={styles.winnerCard}>
                                    <div style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        bottom: 0,
                                        background: 'radial-gradient(circle at 30% 50%, rgba(255,255,255,0.2) 0%, transparent 50%)',
                                        animation: 'pulse 3s ease-in-out infinite'
                                    }} />
                                    <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: '2rem' }}>
                                        <Trophy size={72} style={{ filter: 'drop-shadow(0 0 20px rgba(255,255,255,0.5))' }} />
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: '1rem', opacity: 0.95, fontWeight: 700, letterSpacing: '2px' }}>🏆 WINNER DECLARED</div>
                                            <div style={{ fontSize: '2.5rem', fontWeight: 900, margin: '0.5rem 0', textShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>{constituencyResults.winner.name}</div>
                                            <div style={{ fontSize: '1.25rem', opacity: 0.95, fontWeight: 600 }}>
                                                {constituencyResults.winner.party} • {constituencyResults.winner.vote_count.toLocaleString()} votes ({constituencyResults.winner.vote_share}%)
                                            </div>
                                        </div>
                                        <Sparkles size={48} style={{ color: '#F47920', filter: 'drop-shadow(0 0 15px rgba(244,121,32,0.8))' }} />
                                    </div>
                                </div>

                                <div style={styles.card}>
                                    <h4 style={{ margin: '0 0 1.5rem 0', color: '#000080', fontSize: '1.5rem', fontWeight: 800 }}>Candidate Results</h4>
                                    <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 0.5rem' }}>
                                        <thead>
                                            <tr style={{ background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)' }}>
                                                <th style={{ padding: '1.25rem', color: '#000080', textAlign: 'left', fontWeight: 800, borderRadius: '8px 0 0 8px' }}>Rank</th>
                                                <th style={{ padding: '1.25rem', color: '#000080', textAlign: 'left', fontWeight: 800 }}>Candidate</th>
                                                <th style={{ padding: '1.25rem', color: '#000080', textAlign: 'left', fontWeight: 800 }}>Party</th>
                                                <th style={{ padding: '1.25rem', color: '#000080', textAlign: 'left', fontWeight: 800 }}>Votes</th>
                                                <th style={{ padding: '1.25rem', color: '#000080', textAlign: 'left', fontWeight: 800, borderRadius: '0 8px 8px 0' }}>Share</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {constituencyResults.results.map((candidate, idx) => (
                                                <tr key={idx} style={{
                                                    background: idx === 0
                                                        ? 'linear-gradient(90deg, rgba(19,136,8,0.15) 0%, rgba(19,136,8,0.05) 100%)'
                                                        : 'white',
                                                    borderLeft: idx === 0 ? '5px solid #138808' : '5px solid transparent',
                                                    transition: 'all 0.3s ease'
                                                }}>
                                                    <td style={{ padding: '1.25rem', fontWeight: 800, color: idx === 0 ? '#138808' : '#6C757D', fontSize: '1.25rem' }}>
                                                        {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                                                    </td>
                                                    <td style={{ padding: '1.25rem', fontWeight: idx === 0 ? 800 : 600, fontSize: '1.05rem' }}>{candidate.name}</td>
                                                    <td style={{ padding: '1.25rem', color: '#6C757D', fontWeight: 500 }}>{candidate.party}</td>
                                                    <td style={{ padding: '1.25rem', fontWeight: 700, fontSize: '1.1rem' }}>{candidate.vote_count}</td>
                                                    <td style={{ padding: '1.25rem', fontWeight: 800, color: '#138808', fontSize: '1.25rem' }}>{candidate.vote_share}%</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Turnout View */}
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
                                marginBottom: '2rem',
                                background: 'linear-gradient(135deg, #000080 0%, #1a237e 100%)',
                                color: 'white',
                                boxShadow: '0 8px 32px rgba(0,0,128,0.4), 0 0 60px rgba(0,0,128,0.2)',
                                position: 'relative',
                                overflow: 'hidden'
                            }}>
                                <div style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    background: 'radial-gradient(circle at 70% 50%, rgba(244,121,32,0.2) 0%, transparent 50%)',
                                    animation: 'pulse 4s ease-in-out infinite'
                                }} />
                                <div style={{ position: 'relative', zIndex: 1 }}>
                                    <h3 style={{ margin: '0 0 2rem 0', fontSize: '2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <TrendingUp size={32} />
                                        Overall Voter Turnout
                                    </h3>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '3rem' }}>
                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{ fontSize: '4rem', fontWeight: 900, textShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>{(turnout.overall.total || 0).toLocaleString()}</div>
                                            <div style={{ fontSize: '1.1rem', opacity: 0.95, fontWeight: 600, marginTop: '0.5rem' }}>Total Voters</div>
                                        </div>
                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{ fontSize: '4rem', fontWeight: 900, textShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>{(turnout.overall.voted || 0).toLocaleString()}</div>
                                            <div style={{ fontSize: '1.1rem', opacity: 0.95, fontWeight: 600, marginTop: '0.5rem' }}>Votes Cast</div>
                                        </div>
                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{ fontSize: '4rem', fontWeight: 900, color: '#F47920', textShadow: '0 4px 20px rgba(244,121,32,0.5)' }}>{turnout.overall.percentage || 0}%</div>
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
                                                const percentage = parseFloat(c.percentage);
                                                const color = percentage > 70 ? '#138808' : percentage > 50 ? '#F47920' : '#dc3545';
                                                const bgGradient = percentage > 70
                                                    ? 'linear-gradient(90deg, #138808, #0d5c05, #138808)'
                                                    : percentage > 50
                                                        ? 'linear-gradient(90deg, #F47920, #d65a0a, #F47920)'
                                                        : 'linear-gradient(90deg, #dc3545, #b02a37, #dc3545)';

                                                return (
                                                    <tr key={idx} style={{ background: 'white', transition: 'all 0.3s ease' }}>
                                                        <td style={{ padding: '1.25rem', fontWeight: 700, fontSize: '1.05rem' }}>{c.constituency}</td>
                                                        <td style={{ padding: '1.25rem', color: '#6C757D', fontWeight: 600 }}>{(c.total_voters || 0).toLocaleString()}</td>
                                                        <td style={{ padding: '1.25rem', color: '#6C757D', fontWeight: 600 }}>{(c.voted_count || 0).toLocaleString()}</td>
                                                        <td style={{ padding: '1.25rem', fontWeight: 800, color, fontSize: '1.25rem' }}>{c.percentage || 0}%</td>
                                                        <td style={{ padding: '1.25rem' }}>
                                                            <div style={{ width: '100%', background: 'linear-gradient(90deg, #e5e7eb, #f3f4f6)', borderRadius: '12px', height: '32px', overflow: 'hidden', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)' }}>
                                                                <div style={{
                                                                    width: `${c.percentage || 0}%`,
                                                                    background: bgGradient,
                                                                    height: '100%',
                                                                    borderRadius: '12px',
                                                                    transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)',
                                                                    boxShadow: `0 0 20px ${color}40`,
                                                                    position: 'relative',
                                                                    overflow: 'hidden'
                                                                }}>
                                                                    <div style={{
                                                                        position: 'absolute',
                                                                        top: 0,
                                                                        left: 0,
                                                                        right: 0,
                                                                        bottom: 0,
                                                                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                                                                        animation: 'shimmer 2s infinite'
                                                                    }} />
                                                                </div>
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
                
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                
                .spinner {
                    width: 48px;
                    height: 48px;
                    border: 4px solid #e5e7eb;
                    border-top: 4px solid #000080;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }
                
                .stat-card-hover:hover {
                    transform: translateY(-4px) scale(1.02);
                    box-shadow: 0 12px 32px rgba(0,0,0,0.2), 0 0 60px rgba(0,0,128,0.3) !important;
                }
                
                .constituency-item:hover {
                    transform: translateX(6px) !important;
                    box-shadow: 0 8px 24px rgba(0,0,0,0.15) !important;
                }
                
                tbody tr:hover {
                    transform: translateX(4px);
                    box-shadow: 0 4px 16px rgba(0,0,0,0.1);
                }
                
                .btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(0,0,0,0.3) !important;
                }
            `}</style>
        </div>
    );
};

export default FinalReports;
