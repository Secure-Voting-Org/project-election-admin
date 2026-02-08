import React, { useState, useEffect } from 'react';
import { UserPlus } from 'lucide-react';

const CandidateMaster = () => {
    const [constituencies, setConstituencies] = useState([]);
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
    }, []);

    const fetchConstituencies = async () => {
        try {
            const res = await fetch(`http://${window.location.hostname}:8081/api/constituencies`);
            const data = await res.json();
            setConstituencies(data);
        } catch (err) {
            console.error('Failed to fetch constituencies', err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        // Note: We need to implement the backend route for this properly. 
        // Currently pointing to a route we need to verify exists or create.
        try {
            const res = await fetch(`http://${window.location.hostname}:8081/api/candidate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                alert('Candidate Added Successfully!');
                setFormData({ name: '', party: '', symbol: '', constituency: '', color: '#000000' });
            } else {
                alert('Failed to add candidate. Check backend.');
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

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

            <div className="card" style={{ borderTop: '4px solid #000080', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
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

                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Party/Symbol Color</label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <input
                                    type="color"
                                    value={formData.color}
                                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                    style={{ height: '40px', width: '60px', border: 'none', cursor: 'pointer' }}
                                />
                                <span style={{ fontSize: '0.9rem', color: '#666' }}>{formData.color}</span>
                            </div>
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
        </div>
    );
};

export default CandidateMaster;
