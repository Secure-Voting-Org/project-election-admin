import React, { useState, useEffect } from 'react';
import { UserPlus, Edit2, Trash2, Lock, X, Users, Award, MapPin } from 'lucide-react';

const CandidateMaster = () => {
    const [constituencies, setConstituencies] = useState([]);
    const [candidates, setCandidates] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        party: '',
        symbol: '',
        constituency: '',
        color: '#000000'
    });
    const [loading, setLoading] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [electionPhase, setElectionPhase] = useState('PRE_POLL');
    const [message, setMessage] = useState(null);

    const isBallotLocked = electionPhase !== 'PRE_POLL';

    useEffect(() => {
        fetchConstituencies();
        fetchCandidates();
        fetchElectionPhase();
    }, []);

    const fetchElectionPhase = async () => {
        try {
            const res = await fetch('/api/election/status');
            if (res.ok) {
                const data = await res.json();
                setElectionPhase(data.phase || 'PRE_POLL');
            }
        } catch { /* fail silently */ }
    };

    const fetchConstituencies = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/constituencies');
            const data = await res.json();
            setConstituencies(data);
        } catch (err) {
            console.error('Failed to fetch constituencies', err);
        }
    };

    const fetchCandidates = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/candidates');
            const data = await res.json();
            setCandidates(data);
        } catch (err) {
            console.error('Failed to fetch candidates', err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);
        try {
            let res;
            if (editingId) {
                res = await fetch(`http://localhost:5000/api/candidate/${editingId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
            } else {
                res = await fetch('http://localhost:5000/api/candidate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
            }

            if (res.ok) {
                setMessage({ type: 'success', text: editingId ? '✅ Candidate updated successfully!' : '✅ Candidate added to ballot!' });
                setFormData({ name: '', party: '', symbol: '', constituency: '', color: '#000000' });
                setEditingId(null);
                fetchCandidates();
            } else {
                const err = await res.json();
                setMessage({ type: 'error', text: err.error || 'Operation failed.' });
            }
        } catch (err) {
            console.error(err);
            setMessage({ type: 'error', text: 'Network error. Check backend.' });
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (candidate) => {
        setEditingId(candidate.id);
        setFormData({
            name: candidate.name,
            party: candidate.party || '',
            symbol: candidate.symbol || '',
            constituency: candidate.constituency || '',
            color: '#000000'
        });
        setMessage(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (candidate) => {
        if (!window.confirm(`Remove "${candidate.name}" from the ballot in ${candidate.constituency}?`)) return;
        try {
            const res = await fetch(`http://localhost:5000/api/candidate/${candidate.id}`, { method: 'DELETE' });
            if (res.ok) {
                setMessage({ type: 'success', text: `🗑️ "${candidate.name}" removed from ballot.` });
                fetchCandidates();
            } else {
                const err = await res.json();
                setMessage({ type: 'error', text: err.error || 'Delete failed.' });
            }
        } catch {
            setMessage({ type: 'error', text: 'Network error.' });
        }
    };

    const cancelEdit = () => {
        setEditingId(null);
        setFormData({ name: '', party: '', symbol: '', constituency: '', color: '#000000' });
        setMessage(null);
    };

    // Group candidates by District -> Constituency
    const groupedCandidates = candidates.reduce((acc, candidate) => {
        const district = candidate.district || 'Unknown District';
        const constituency = candidate.constituency || 'Unknown Constituency';
        if (!acc[district]) acc[district] = {};
        if (!acc[district][constituency]) acc[district][constituency] = [];
        acc[district][constituency].push(candidate);
        return acc;
    }, {});

    const totalConstituencies = new Set(candidates.map(c => c.constituency)).size;

    return (
        <div>
            {/* Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.5rem',
                background: 'linear-gradient(135deg, #000080 0%, #1a237e 100%)',
                padding: '1.5rem 2rem',
                borderRadius: '12px',
                color: 'white',
                boxShadow: '0 4px 20px rgba(0,0,128,0.3)',
                borderTop: '4px solid #F47920'
            }}>
                <div>
                    <h3 style={{ margin: 0, color: 'white', fontSize: '1.3rem' }}>🗳️ Candidate Master</h3>
                    <p style={{ margin: '0.25rem 0 0 0', opacity: 0.8, fontSize: '0.85rem' }}>Manage candidates on the election ballot</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{
                        background: 'rgba(255,255,255,0.15)',
                        padding: '0.5rem 1rem',
                        borderRadius: '8px',
                        textAlign: 'center',
                        backdropFilter: 'blur(10px)'
                    }}>
                        <div style={{ fontSize: '1.3rem', fontWeight: 800 }}>{candidates.length}</div>
                        <div style={{ fontSize: '0.7rem', opacity: 0.8 }}>Candidates</div>
                    </div>
                    <div style={{
                        background: 'rgba(255,255,255,0.15)',
                        padding: '0.5rem 1rem',
                        borderRadius: '8px',
                        textAlign: 'center',
                        backdropFilter: 'blur(10px)'
                    }}>
                        <div style={{ fontSize: '1.3rem', fontWeight: 800 }}>{totalConstituencies}</div>
                        <div style={{ fontSize: '0.7rem', opacity: 0.8 }}>Constituencies</div>
                    </div>
                </div>
            </div>

            {/* Ballot Lock Banner */}
            {isBallotLocked && (
                <div style={{
                    background: 'linear-gradient(135deg, #FFF8E1 0%, #FFF3CD 100%)',
                    border: '2px solid #FFB300',
                    borderRadius: '12px',
                    padding: '1.25rem 1.5rem',
                    marginBottom: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    boxShadow: '0 2px 12px rgba(255,179,0,0.15)'
                }}>
                    <div style={{
                        background: '#FFB300',
                        borderRadius: '50%',
                        width: '40px',
                        height: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                    }}>
                        <Lock size={20} color="white" />
                    </div>
                    <div>
                        <div style={{ fontWeight: 700, color: '#E65100', fontSize: '1rem' }}>Ballot is Locked — Read Only</div>
                        <div style={{ fontSize: '0.85rem', color: '#795548' }}>
                            The election is <strong>{electionPhase === 'LIVE' ? 'LIVE' : 'in POST POLL'}</strong>. Candidate additions, edits, and deletions are disabled until the next election cycle.
                        </div>
                    </div>
                </div>
            )}

            {/* Notification Banner */}
            {message && (
                <div style={{
                    background: message.type === 'success' ? 'linear-gradient(135deg, #E8F5E9, #C8E6C9)' : 'linear-gradient(135deg, #FFEBEE, #FFCDD2)',
                    border: `1px solid ${message.type === 'success' ? '#43A047' : '#EF5350'}`,
                    color: message.type === 'success' ? '#1B5E20' : '#B71C1C',
                    borderRadius: '10px',
                    padding: '0.85rem 1.25rem',
                    marginBottom: '1.5rem',
                    fontWeight: 600,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    boxShadow: `0 2px 8px ${message.type === 'success' ? 'rgba(76,175,80,0.15)' : 'rgba(244,67,54,0.15)'}`
                }}>
                    <span>{message.text}</span>
                    <button onClick={() => setMessage(null)} style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        fontSize: '1.2rem', color: 'inherit', opacity: 0.7
                    }}>×</button>
                </div>
            )}

            {/* Onboard / Edit Form */}
            <div style={{
                background: 'white',
                borderRadius: '12px',
                border: '1px solid #E0E0E0',
                borderTop: editingId ? '4px solid #F47920' : '4px solid #000080',
                boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                padding: '2rem',
                marginBottom: '2rem',
                opacity: isBallotLocked ? 0.5 : 1,
                pointerEvents: isBallotLocked ? 'none' : 'auto',
                transition: 'opacity 0.3s ease'
            }}>
                <h4 style={{ color: editingId ? '#F47920' : '#000080', fontWeight: 800, margin: '0 0 1.5rem 0', fontSize: '1.1rem' }}>
                    {editingId ? '✏️ Edit Candidate Details' : '➕ Onboard New Candidate'}
                </h4>
                <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div>
                        <div style={{ marginBottom: '1.25rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: '#555' }}>
                                <Users size={14} style={{ marginBottom: '-2px', marginRight: '4px' }} /> Candidate Name
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                                placeholder="Full name of the candidate"
                                style={{
                                    width: '100%', padding: '0.7rem 1rem', borderRadius: '8px',
                                    border: '1.5px solid #ddd', fontSize: '0.95rem',
                                    transition: 'border-color 0.2s',
                                    outline: 'none'
                                }}
                                onFocus={e => e.target.style.borderColor = '#000080'}
                                onBlur={e => e.target.style.borderColor = '#ddd'}
                            />
                        </div>
                        <div style={{ marginBottom: '1.25rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: '#555' }}>
                                <Award size={14} style={{ marginBottom: '-2px', marginRight: '4px' }} /> Party Affiliation
                            </label>
                            <input
                                type="text"
                                value={formData.party}
                                onChange={(e) => setFormData({ ...formData, party: e.target.value })}
                                required
                                placeholder="e.g. Independent, TDP, YSRCP"
                                style={{
                                    width: '100%', padding: '0.7rem 1rem', borderRadius: '8px',
                                    border: '1.5px solid #ddd', fontSize: '0.95rem',
                                    transition: 'border-color 0.2s',
                                    outline: 'none'
                                }}
                                onFocus={e => e.target.style.borderColor = '#000080'}
                                onBlur={e => e.target.style.borderColor = '#ddd'}
                            />
                        </div>
                    </div>
                    <div>
                        <div style={{ marginBottom: '1.25rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: '#555' }}>
                                <MapPin size={14} style={{ marginBottom: '-2px', marginRight: '4px' }} /> Constituency
                            </label>
                            <select
                                value={formData.constituency}
                                onChange={(e) => setFormData({ ...formData, constituency: e.target.value })}
                                required
                                disabled={!!editingId}
                                style={{
                                    width: '100%', padding: '0.7rem 1rem', borderRadius: '8px',
                                    border: '1.5px solid #ddd', fontSize: '0.95rem',
                                    background: editingId ? '#f5f5f5' : 'white',
                                    cursor: editingId ? 'not-allowed' : 'pointer',
                                    outline: 'none'
                                }}
                            >
                                <option value="">Select Constituency</option>
                                {constituencies.map(c => (
                                    <option key={c.id} value={c.name}>{c.name} ({c.district})</option>
                                ))}
                            </select>
                            {editingId && <small style={{ color: '#999', fontSize: '0.75rem' }}>Constituency is locked during edit</small>}
                        </div>
                        <div style={{ marginBottom: '1.25rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: '#555' }}>
                                Election Symbol
                            </label>
                            <input
                                type="text"
                                value={formData.symbol}
                                onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                                required
                                placeholder="e.g. 🚲, 🛡️, 🦁"
                                style={{
                                    width: '100%', padding: '0.7rem 1rem', borderRadius: '8px',
                                    border: '1.5px solid #ddd', fontSize: '1.5rem',
                                    outline: 'none'
                                }}
                            />
                            <small style={{ color: '#999', fontSize: '0.75rem' }}>Tip: Press Ctrl+Cmd+Space to open emoji picker</small>
                        </div>
                    </div>

                    <div style={{ gridColumn: '1 / -1', marginTop: '0.5rem', display: 'flex', gap: '1rem' }}>
                        <button type="submit" disabled={loading} style={{
                            flex: 1,
                            background: editingId
                                ? 'linear-gradient(135deg, #F47920, #FF9800)'
                                : 'linear-gradient(135deg, #138808, #1B9C13)',
                            color: 'white',
                            fontWeight: 800,
                            padding: '1rem',
                            fontSize: '1.05rem',
                            border: 'none',
                            borderRadius: '10px',
                            cursor: loading ? 'wait' : 'pointer',
                            boxShadow: editingId
                                ? '0 4px 15px rgba(244,121,32,0.25)'
                                : '0 4px 15px rgba(19,136,8,0.25)',
                            transition: 'transform 0.15s, box-shadow 0.15s',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem'
                        }}
                            onMouseEnter={e => { e.target.style.transform = 'translateY(-1px)'; }}
                            onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; }}
                        >
                            {loading ? 'Processing...' : editingId
                                ? <><Edit2 size={20} /> Update Candidate</>
                                : <><UserPlus size={20} /> Register Candidate</>}
                        </button>
                        {editingId && (
                            <button type="button" onClick={cancelEdit} style={{
                                background: '#6C757D',
                                color: 'white',
                                fontWeight: 700,
                                padding: '1rem 2rem',
                                fontSize: '1rem',
                                border: 'none',
                                borderRadius: '10px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem'
                            }}>
                                <X size={18} /> Cancel
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {/* Candidate List */}
            <div style={{
                background: 'white',
                borderRadius: '12px',
                border: '1px solid #E0E0E0',
                borderTop: '4px solid #F47920',
                boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                padding: '2rem'
            }}>
                <h4 style={{ color: '#000080', fontWeight: 800, marginBottom: '1.5rem', fontSize: '1.1rem' }}>
                    📋 Registered Candidates Overview
                </h4>

                {Object.keys(groupedCandidates).length === 0 ? (
                    <div style={{
                        textAlign: 'center', padding: '3rem',
                        background: '#FAFAFA', borderRadius: '10px',
                        border: '2px dashed #ddd'
                    }}>
                        <Users size={40} color="#ccc" />
                        <p style={{ color: '#999', marginTop: '0.75rem', fontWeight: 500 }}>No candidates registered yet.</p>
                    </div>
                ) : (
                    Object.entries(groupedCandidates).map(([district, districtConstituencies]) => (
                        <div key={district} style={{ marginBottom: '2rem' }}>
                            <div style={{
                                background: 'linear-gradient(135deg, #E8EAF6, #C5CAE9)',
                                padding: '0.65rem 1.25rem',
                                borderRadius: '8px',
                                borderLeft: '5px solid #000080',
                                marginBottom: '1rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}>
                                <MapPin size={16} color="#000080" />
                                <span style={{ fontWeight: 700, color: '#1a237e', fontSize: '0.95rem' }}>{district} District</span>
                                <span style={{
                                    marginLeft: 'auto',
                                    background: '#000080',
                                    color: 'white',
                                    padding: '0.15rem 0.6rem',
                                    borderRadius: '12px',
                                    fontSize: '0.75rem',
                                    fontWeight: 600
                                }}>
                                    {Object.values(districtConstituencies).flat().length} candidates
                                </span>
                            </div>

                            <div style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                justifyContent: 'center',
                                gap: '1.25rem',
                                padding: '0 0.5rem'
                            }}>
                                {Object.entries(districtConstituencies).map(([constituency, cands]) => (
                                    <div key={constituency} style={{
                                        border: '1px solid #E0E0E0',
                                        borderRadius: '10px',
                                        overflow: 'hidden',
                                        background: '#fff',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                                        transition: 'box-shadow 0.2s',
                                        width: '100%',
                                        maxWidth: '100%'
                                    }}
                                        onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)'}
                                        onMouseLeave={e => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'}
                                    >
                                        {/* Constituency Header */}
                                        <div style={{
                                            background: 'linear-gradient(135deg, #FFF3E0, #FFE0B2)',
                                            padding: '0.6rem 1rem',
                                            borderBottom: '1px solid #FFE0B2',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}>
                                            <span style={{ fontWeight: 700, color: '#E65100', fontSize: '0.9rem' }}>{constituency}</span>
                                            <span style={{
                                                background: '#F47920',
                                                color: 'white',
                                                padding: '0.1rem 0.5rem',
                                                borderRadius: '10px',
                                                fontSize: '0.7rem',
                                                fontWeight: 600
                                            }}>
                                                {cands.length} candidates
                                            </span>
                                        </div>

                                        {/* Candidate Rows */}
                                        <div style={{ padding: '0.5rem' }}>
                                            {cands.map((cand, idx) => (
                                                <div key={idx} style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.75rem',
                                                    padding: '0.6rem 0.5rem',
                                                    borderRadius: '8px',
                                                    borderBottom: idx < cands.length - 1 ? '1px solid #F5F5F5' : 'none',
                                                    transition: 'background 0.15s',
                                                    cursor: 'default'
                                                }}
                                                    onMouseEnter={e => e.currentTarget.style.background = '#FAFAFA'}
                                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                                >
                                                    {/* Symbol Circle */}
                                                    <div style={{
                                                        width: '40px',
                                                        height: '40px',
                                                        borderRadius: '50%',
                                                        background: '#F5F5F5',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontSize: '1.3rem',
                                                        flexShrink: 0,
                                                        border: '2px solid #E0E0E0'
                                                    }}>
                                                        {cand.symbol}
                                                    </div>

                                                    {/* Name & Party */}
                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                        <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#1a237e' }}>{cand.name}</div>
                                                        <div style={{ fontSize: '0.75rem', color: '#888' }}>{cand.party}</div>
                                                    </div>

                                                    {/* Actions */}
                                                    {!isBallotLocked && (
                                                        <div style={{ display: 'flex', gap: '0.35rem', flexShrink: 0 }}>
                                                            <button
                                                                onClick={() => handleEdit(cand)}
                                                                title="Edit Candidate"
                                                                style={{
                                                                    background: '#E3F2FD',
                                                                    border: '1px solid #64B5F6',
                                                                    borderRadius: '6px',
                                                                    cursor: 'pointer',
                                                                    padding: '0.3rem 0.5rem',
                                                                    color: '#1565C0',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    transition: 'all 0.15s'
                                                                }}
                                                                onMouseEnter={e => { e.currentTarget.style.background = '#1565C0'; e.currentTarget.style.color = 'white'; }}
                                                                onMouseLeave={e => { e.currentTarget.style.background = '#E3F2FD'; e.currentTarget.style.color = '#1565C0'; }}
                                                            >
                                                                <Edit2 size={13} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(cand)}
                                                                title="Remove from Ballot"
                                                                style={{
                                                                    background: '#FFEBEE',
                                                                    border: '1px solid #EF9A9A',
                                                                    borderRadius: '6px',
                                                                    cursor: 'pointer',
                                                                    padding: '0.3rem 0.5rem',
                                                                    color: '#C62828',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    transition: 'all 0.15s'
                                                                }}
                                                                onMouseEnter={e => { e.currentTarget.style.background = '#C62828'; e.currentTarget.style.color = 'white'; }}
                                                                onMouseLeave={e => { e.currentTarget.style.background = '#FFEBEE'; e.currentTarget.style.color = '#C62828'; }}
                                                            >
                                                                <Trash2 size={13} />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default CandidateMaster;
