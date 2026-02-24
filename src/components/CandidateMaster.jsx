import React, { useState, useEffect } from 'react';
import { UserPlus } from 'lucide-react';

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

    useEffect(() => {
        fetchConstituencies();
        fetchCandidates();
    }, []);

    const fetchConstituencies = async () => {
        try {
            const res = await fetch('http://localhost:5001/api/constituencies');
            const data = await res.json();
            setConstituencies(data);
        } catch (err) {
            console.error('Failed to fetch constituencies', err);
        }
    };

    const fetchCandidates = async () => {
        try {
            const res = await fetch('http://localhost:5001/api/candidates');
            const data = await res.json();
            setCandidates(data);
        } catch (err) {
            console.error('Failed to fetch candidates', err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('http://localhost:5001/api/candidate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                alert('Candidate Added Successfully!');
                setFormData({ name: '', party: '', symbol: '', constituency: '', color: '#000000' });
                fetchCandidates(); // Refresh list
            } else {
                alert('Failed to add candidate. Check backend.');
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
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
                <h3 style={{ margin: 0, color: 'white' }}>Candidate Master</h3>
                <span className="phase-badge" style={{ background: '#F47920', color: 'white', border: 'none' }}>Pre-Poll Setup</span>
            </div>

            <div className="card" style={{ borderTop: '4px solid #000080', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginBottom: '2rem' }}>
                <h4 style={{ color: '#000080', fontWeight: 800 }}>Onboard New Candidate</h4>
                <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>

                    {/* Left Column */}
                    <div>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Candidate Name</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                                className="input-field"
                                style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #ddd' }}
                            />
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Party Affiliation</label>
                            <input
                                type="text"
                                value={formData.party}
                                onChange={(e) => setFormData({ ...formData, party: e.target.value })}
                                required
                                placeholder="e.g. Independent, Party A"
                                style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #ddd' }}
                            />
                        </div>
                    </div>

                    {/* Right Column */}
                    <div>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Constructuency</label>
                            <select
                                value={formData.constituency}
                                onChange={(e) => setFormData({ ...formData, constituency: e.target.value })}
                                required
                                style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #ddd' }}
                            >
                                <option value="">Select Constituency</option>
                                {constituencies.map(c => (
                                    <option key={c.id} value={c.name}>{c.name} ({c.district})</option>
                                ))}
                            </select>
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Election Symbol (Emoji/Char)</label>
                            <input
                                type="text"
                                value={formData.symbol}
                                onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                                required
                                placeholder="e.g. 🚲, 🛡️, 🦁"
                                style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #ddd', fontSize: '1.5rem' }}
                            />
                            <small style={{ color: '#888' }}>Use emojis for demo (Win+. to open emoji picker)</small>
                        </div>

                    </div>

                    <div style={{ gridColumn: '1 / -1', marginTop: '1.5rem' }}>
                        <button type="submit" className="btn" disabled={loading} style={{
                            width: '100%',
                            background: '#138808',
                            color: 'white',
                            fontWeight: 800,
                            boxShadow: '0 4px 12px rgba(19,136,8,0.2)',
                            padding: '1rem',
                            fontSize: '1.1rem'
                        }}>
                            {loading ? 'Registering...' : <><UserPlus size={20} style={{ marginBottom: '-3px', marginRight: '8px' }} /> Register Candidate</>}
                        </button>
                    </div>
                </form>
            </div>

            {/* Candidate List Dashboard */}
            <div className="card" style={{ borderTop: '4px solid #F47920' }}>
                <h4 style={{ color: '#000080', fontWeight: 800, marginBottom: '1.5rem' }}>Registered Candidates Overview</h4>

                {Object.keys(groupedCandidates).length === 0 ? (
                    <p style={{ color: '#666', fontStyle: 'italic' }}>No candidates registered yet.</p>
                ) : (
                    Object.entries(groupedCandidates).map(([district, districtConstituencies]) => (
                        <div key={district} style={{ marginBottom: '2rem' }}>
                            <h5 style={{
                                background: '#eee',
                                padding: '0.5rem 1rem',
                                borderRadius: '4px',
                                borderLeft: '4px solid #000080',
                                margin: '0 0 1rem 0'
                            }}>
                                {district} District
                            </h5>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem', paddingLeft: '1rem' }}>
                                {Object.entries(districtConstituencies).map(([constituency, cands]) => (
                                    <div key={constituency} style={{
                                        border: '1px solid #ddd',
                                        borderRadius: '8px',
                                        padding: '1rem',
                                        background: '#fff'
                                    }}>
                                        <h6 style={{ margin: '0 0 0.5rem 0', color: '#F47920', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>
                                            {constituency}
                                        </h6>
                                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                            {cands.map((cand, idx) => (
                                                <li key={idx} style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    padding: '0.5rem 0',
                                                    borderBottom: idx < cands.length - 1 ? '1px dashed #eee' : 'none'
                                                }}>
                                                    <div>
                                                        <span style={{ fontWeight: 600 }}>{cand.name}</span>
                                                        <div style={{ fontSize: '0.8rem', color: '#666' }}>{cand.party}</div>
                                                    </div>
                                                    <div style={{ fontSize: '1.5rem' }}>{cand.symbol}</div>
                                                </li>
                                            ))}
                                        </ul>
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
