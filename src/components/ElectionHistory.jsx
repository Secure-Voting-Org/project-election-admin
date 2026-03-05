import React, { useState, useEffect } from 'react';
import { History, Trophy, Users, Calendar } from 'lucide-react';
import API_BASE from '../config/api';

const ElectionHistory = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await fetch(`${API_BASE}/api/election/history`);
                if (!res.ok) throw new Error('Failed to fetch election history');
                const data = await res.json();
                setHistory(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, []);

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading historical election data...</div>;
    if (error) return <div style={{ padding: '2rem', color: '#c62828', background: '#ffebee', borderRadius: '8px' }}>Error: {error}</div>;

    if (history.length === 0) {
        return (
            <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                <History size={64} color="#ccc" style={{ marginBottom: '1rem' }} />
                <h3>No Archived Elections</h3>
                <p style={{ color: '#666' }}>Once an election has concluded and the results are archived, they will appear here.</p>
            </div>
        );
    }

    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem', color: '#000080' }}>
                <History size={28} />
                <h2 style={{ margin: 0 }}>Election Archives</h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {history.map((record) => {
                    const results = record.results_json || {};
                    const totalVotes = record.total_votes || 0;
                    const dateStr = new Date(record.election_date).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                    });

                    return (
                        <div key={record.id} style={{
                            background: 'white',
                            borderRadius: '12px',
                            overflow: 'hidden',
                            boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
                            border: '1px solid #eee'
                        }}>
                            {/* Header */}
                            <div style={{
                                background: 'linear-gradient(135deg, #000080 0%, #00004d 100%)',
                                color: 'white',
                                padding: '1.5rem',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1.4rem' }}>Election #{record.id}</h3>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem', opacity: 0.9 }}>
                                        <Calendar size={16} /> {dateStr}
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Total Turnout</div>
                                    <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>{totalVotes.toLocaleString()}</div>
                                </div>
                            </div>

                            {/* Body: Tally per constituency */}
                            <div style={{ padding: '1.5rem' }}>
                                {Object.keys(results).length === 0 ? (
                                    <p style={{ color: '#666', fontStyle: 'italic' }}>No votes recorded in this election.</p>
                                ) : (
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                                        {Object.entries(results).map(([constituency, candidates]) => {

                                            // Find winner
                                            let winnerId = null;
                                            let maxVotes = -1;
                                            Object.entries(candidates).forEach(([cid, count]) => {
                                                if (count > maxVotes) { maxVotes = count; winnerId = cid; }
                                            });

                                            return (
                                                <div key={constituency} style={{ background: '#f8f9fa', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
                                                    <h4 style={{ marginTop: 0, borderBottom: '2px solid #ddd', paddingBottom: '0.5rem', color: '#333' }}>
                                                        {constituency}
                                                    </h4>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                        {Object.entries(candidates)
                                                            .sort((a, b) => b[1] - a[1]) // Sort descending
                                                            .map(([cid, count]) => (
                                                                <div key={cid} style={{
                                                                    display: 'flex', justifyContent: 'space-between',
                                                                    padding: '0.5rem',
                                                                    background: cid === winnerId ? '#e8f5e9' : 'transparent',
                                                                    borderRadius: '4px',
                                                                    fontWeight: cid === winnerId ? 700 : 400,
                                                                    color: cid === winnerId ? '#2e7d32' : 'inherit'
                                                                }}>
                                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                                        {cid === winnerId && <Trophy size={16} color="#F47920" />}
                                                                        Candidate ID: {cid}
                                                                    </span>
                                                                    <span>{count} votes</span>
                                                                </div>
                                                            ))}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ElectionHistory;
