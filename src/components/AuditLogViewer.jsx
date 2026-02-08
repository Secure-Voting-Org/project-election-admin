import React, { useState, useEffect } from 'react';
import { Shield, Lock, Search, RefreshCw, AlertCircle, CheckCircle, XCircle, Clock } from 'lucide-react';

export default function AuditLogViewer() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const res = await fetch(`http://${window.location.hostname}:5000/api/audit/logs`);
            const data = await res.json();
            if (Array.isArray(data)) {
                setLogs(data);
            }
        } catch (err) {
            console.error("Failed to fetch logs");
        } finally {
            setLoading(false);
        }
    };

    const filteredLogs = logs.filter(log =>
        log.event.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.user_id && log.user_id.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const getEventStyle = (event) => {
        if (event.includes('FAILED') || event.includes('LOCKED')) {
            return { bg: '#fff5f5', color: '#c53030', border: '#fc8181', icon: XCircle };
        }
        if (event.includes('APPROVED') || event.includes('VERIFIED') || event.includes('VOTE_CAST')) {
            return { bg: '#f0fdf4', color: '#166534', border: '#86efac', icon: CheckCircle };
        }
        if (event.includes('INITIATED') || event.includes('PENDING')) {
            return { bg: '#fff7ed', color: '#c2410c', border: '#fdba74', icon: Clock };
        }
        return { bg: '#eff6ff', color: '#1e40af', border: '#93c5fd', icon: AlertCircle };
    };

    return (
        <div className="card" style={{ padding: '0', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', borderRadius: '16px' }}>
            {/* Header */}
            <div style={{
                padding: '2rem 2.5rem',
                background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
                color: 'white',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <div>
                    <h2 style={{ margin: 0, fontSize: '1.75rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        System Audit Logs
                        <Lock size={20} style={{ opacity: 0.8 }} />
                    </h2>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.95rem', opacity: 0.9 }}>
                        Immutable Record of All System Events
                    </p>
                </div>
                <div style={{ background: 'rgba(255, 255, 255, 0.15)', padding: '12px 24px', borderRadius: '8px', backdropFilter: 'blur(10px)' }}>
                    <div style={{ fontSize: '2rem', fontWeight: '700' }}>{filteredLogs.length}</div>
                    <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>Total Events</div>
                </div>
            </div>

            {/* Controls */}
            <div style={{ padding: '1.5rem 2.5rem', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', gap: '12px', alignItems: 'center' }}>
                <button
                    onClick={fetchLogs}
                    disabled={loading}
                    style={{
                        padding: '0.75rem 1.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        background: loading ? '#cbd5e1' : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        fontSize: '0.95rem',
                        fontWeight: '600',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => !loading && (e.target.style.transform = 'translateY(-2px)')}
                    onMouseOut={(e) => (e.target.style.transform = 'translateY(0)')}
                >
                    <RefreshCw size={16} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
                    {loading ? 'Refreshing...' : 'Refresh'}
                </button>
                <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
                    <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                    <input
                        type="text"
                        placeholder="Search by event type or user ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '0.75rem 1rem 0.75rem 3rem',
                            borderRadius: '8px',
                            border: '2px solid #e2e8f0',
                            fontSize: '0.95rem',
                            transition: 'border-color 0.2s',
                            outline: 'none'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                        onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                    />
                </div>
            </div>

            {/* Table */}
            <div style={{ overflowX: 'auto', maxHeight: '600px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                        <tr style={{ background: 'linear-gradient(to right, #f1f5f9, #e2e8f0)' }}>
                            <th style={{ padding: '1.25rem', fontSize: '0.8rem', fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'left' }}>Timestamp</th>
                            <th style={{ padding: '1.25rem', fontSize: '0.8rem', fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'left' }}>Event Type</th>
                            <th style={{ padding: '1.25rem', fontSize: '0.8rem', fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'left' }}>User Identity</th>
                            <th style={{ padding: '1.25rem', fontSize: '0.8rem', fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'left' }}>IP Address</th>
                            <th style={{ padding: '1.25rem', fontSize: '0.8rem', fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'left' }}>Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="5" style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                                <RefreshCw size={32} style={{ animation: 'spin 1s linear infinite', marginBottom: '1rem' }} />
                                <div>Loading Secure Logs...</div>
                            </td></tr>
                        ) : filteredLogs.length === 0 ? (
                            <tr><td colSpan="5" style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                                <AlertCircle size={32} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                                <div>No logs found matching criteria.</div>
                            </td></tr>
                        ) : (
                            filteredLogs.map((log, idx) => {
                                const style = getEventStyle(log.event);
                                const Icon = style.icon;
                                return (
                                    <tr key={log.id} style={{
                                        borderBottom: '1px solid #f1f5f9',
                                        transition: 'background 0.2s',
                                        background: idx % 2 === 0 ? 'white' : '#fafafa'
                                    }}
                                        onMouseOver={(e) => e.currentTarget.style.background = '#f8fafc'}
                                        onMouseOut={(e) => e.currentTarget.style.background = idx % 2 === 0 ? 'white' : '#fafafa'}
                                    >
                                        <td style={{ padding: '1.25rem', color: '#1e293b', whiteSpace: 'nowrap' }}>
                                            <div style={{ fontWeight: '600', fontSize: '0.95rem' }}>{new Date(log.created_at).toLocaleTimeString()}</div>
                                            <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>{new Date(log.created_at).toLocaleDateString()}</div>
                                        </td>
                                        <td style={{ padding: '1.25rem' }}>
                                            <div style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                background: style.bg,
                                                color: style.color,
                                                padding: '6px 14px',
                                                borderRadius: '8px',
                                                fontSize: '0.85rem',
                                                fontWeight: '700',
                                                border: `2px solid ${style.border}`,
                                                boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                                            }}>
                                                <Icon size={14} />
                                                {log.event.replace(/_/g, ' ')}
                                            </div>
                                        </td>
                                        <td style={{ padding: '1.25rem', fontFamily: 'monospace', color: '#475569', fontWeight: '500', fontSize: '0.9rem' }}>
                                            {log.user_id || <span style={{ color: '#94a3b8' }}>—</span>}
                                        </td>
                                        <td style={{ padding: '1.25rem', color: '#64748b', fontSize: '0.9rem' }}>
                                            {log.ip_address || <span style={{ color: '#cbd5e1' }}>—</span>}
                                        </td>
                                        <td style={{ padding: '1.25rem', color: '#475569', maxWidth: '300px', fontSize: '0.85rem' }}>
                                            <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', background: '#f8fafc', padding: '4px 8px', borderRadius: '4px', fontFamily: 'monospace' }}>
                                                {JSON.stringify(log.details)}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Footer */}
            <div style={{
                padding: '1.25rem',
                background: 'linear-gradient(to right, #f8fafc, #f1f5f9)',
                borderTop: '2px solid #e2e8f0',
                textAlign: 'center',
                fontSize: '0.85rem',
                color: '#64748b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
            }}>
                <Lock size={14} />
                <span style={{ fontWeight: '600' }}>End of Read-Only Record</span>
                <span>•</span>
                <span>Immutable Audit Trail</span>
            </div>
            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
