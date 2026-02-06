import React, { useState, useEffect } from 'react';
import { Plus, MapPin } from 'lucide-react';

const ConstituencyManager = () => {
    const [constituencies, setConstituencies] = useState([]);
    const [formData, setFormData] = useState({ name: '', district: '' });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchConstituencies();
    }, []);

    const fetchConstituencies = async () => {
        try {
            const res = await fetch(`http://${window.location.hostname}:5000/api/constituencies`);
            const data = await res.json();
            setConstituencies(data);
        } catch (err) {
            console.error('Failed to fetch constituencies', err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch(`http://${window.location.hostname}:5000/api/constituency`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                setFormData({ name: '', district: '' });
                fetchConstituencies();
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3>Constituency Master</h3>
                <span className="phase-badge phase-pre">Pre-Poll Setup</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
                {/* Form */}
                <div className="card">
                    <h4 style={{ marginTop: 0 }}>Add New Constituency</h4>
                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Constituency Name</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g. Kuppam"
                                required
                                style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #ddd' }}
                            />
                        </div>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>District</label>
                            <input
                                type="text"
                                value={formData.district}
                                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                                placeholder="e.g. Chittoor"
                                required
                                style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #ddd' }}
                            />
                        </div>
                        <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
                            {loading ? 'Adding...' : <><Plus size={16} style={{ marginBottom: '-2px' }} /> Add Constituency</>}
                        </button>
                    </form>
                </div>

                {/* List */}
                <div className="card">
                    <h4 style={{ marginTop: 0 }}>Existing Constituencies ({constituencies.length})</h4>
                    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        {constituencies.length === 0 ? (
                            <p style={{ color: '#888', fontStyle: 'italic' }}>No constituencies added yet.</p>
                        ) : (
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ textAlign: 'left', borderBottom: '2px solid #eee' }}>
                                        <th style={{ padding: '0.75rem' }}>ID</th>
                                        <th style={{ padding: '0.75rem' }}>Name</th>
                                        <th style={{ padding: '0.75rem' }}>District</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {constituencies.map((c) => (
                                        <tr key={c.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                                            <td style={{ padding: '0.75rem', color: '#888' }}>#{c.id}</td>
                                            <td style={{ padding: '0.75rem', fontWeight: 600 }}>{c.name}</td>
                                            <td style={{ padding: '0.75rem' }}>{c.district}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConstituencyManager;
