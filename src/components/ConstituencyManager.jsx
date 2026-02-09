import React, { useState, useEffect } from 'react';
import { Plus, MapPin, Trash2, Search } from 'lucide-react';

const ConstituencyManager = () => {
    const [constituencies, setConstituencies] = useState([]);
    const [formData, setFormData] = useState({ name: '', district: '', state: '' });
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchConstituencies();
    }, []);

    const fetchConstituencies = async () => {
        try {
            const res = await fetch(`http://${window.location.hostname}:5001/api/constituencies`);
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
            const res = await fetch(`http://${window.location.hostname}:5001/api/constituency`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                setFormData({ name: '', district: '', state: '' });
                fetchConstituencies();
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this constituency?")) return;
        try {
            const res = await fetch(`http://${window.location.hostname}:5001/api/constituency/${id}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                fetchConstituencies();
            }
        } catch (err) {
            console.error('Failed to delete constituency', err);
        }
    };

    const filteredConstituencies = constituencies.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.state.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                <h3 style={{ margin: 0, color: 'white' }}>Constituency Master</h3>
                <span className="phase-badge" style={{ background: '#F47920', color: 'white', border: 'none' }}>Pre-Poll Setup</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
                {/* Form */}
                <div className="card" style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: 'none' }}>
                    <h4 style={{ marginTop: 0, color: '#000080', fontWeight: 800 }}>Add New Constituency</h4>
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
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>State</label>
                            <input
                                type="text"
                                value={formData.state}
                                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                placeholder="e.g. Andhra Pradesh"
                                required
                                style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #ddd' }}
                            />
                        </div>
                        <button type="submit" className="btn" disabled={loading} style={{
                            width: '100%',
                            background: '#138808',
                            color: 'white',
                            fontWeight: 700,
                            boxShadow: '0 4px 12px rgba(19,136,8,0.2)',
                            padding: '1rem'
                        }}>
                            {loading ? 'Adding...' : <><Plus size={18} style={{ marginBottom: '-3px', marginRight: '5px' }} /> Add Constituency</>}
                        </button>
                    </form>
                </div>

                {/* List */}
                <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', borderTop: '4px solid #000080' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 style={{ margin: 0, color: '#000080', fontWeight: 800 }}>Existing Constituencies ({filteredConstituencies.length})</h3>
                        <div style={{ position: 'relative', width: '300px' }}>
                            <Search size={18} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#888' }} />
                            <input
                                type="text"
                                placeholder="Search by Name, District, or State..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '0.6rem 0.6rem 0.6rem 2.4rem',
                                    borderRadius: '6px',
                                    border: '1px solid #ddd',
                                    fontSize: '0.9rem'
                                }}
                            />
                        </div>
                    </div>

                    {filteredConstituencies.length === 0 ? (
                        <p style={{ color: '#888', fontStyle: 'italic' }}>No constituencies found matching "{searchTerm}".</p>
                    ) : (
                        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem' }}>
                                <thead>
                                    <tr style={{ textAlign: 'left', borderBottom: '2px solid #000080', background: '#f9f9f9' }}>
                                        <th style={{ padding: '1rem', color: '#000080', fontWeight: 800 }}>ID</th>
                                        <th style={{ padding: '1rem', color: '#000080', fontWeight: 800 }}>Name</th>
                                        <th style={{ padding: '1rem', color: '#000080', fontWeight: 800 }}>District</th>
                                        <th style={{ padding: '1rem', color: '#000080', fontWeight: 800 }}>State</th>
                                        <th style={{ padding: '1rem', color: '#000080', fontWeight: 800 }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredConstituencies.map((c, index) => (
                                        <tr key={index} style={{ borderBottom: '1px solid #f0f0f0' }}>
                                            <td style={{ padding: '0.75rem', color: '#888', fontSize: '0.85rem' }}>#{c.id}</td>
                                            <td style={{ padding: '0.75rem', fontWeight: 600 }}>{c.name}</td>
                                            <td style={{ padding: '0.75rem' }}>{c.district}</td>
                                            <td style={{ padding: '0.75rem' }}>{c.state}</td>
                                            <td style={{ padding: '0.75rem' }}>
                                                <button onClick={() => handleDelete(c.id)} style={{ border: 'none', background: 'none', color: '#ff4d4f', cursor: 'pointer' }}>
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ConstituencyManager;
