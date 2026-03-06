import React, { useState, useEffect } from 'react';
import { RefreshCw, CheckCircle, Clock, Hash, User, Shield, Calendar, XCircle, AlertCircle, Loader2, ChevronDown, ChevronUp, History } from 'lucide-react';
import API_BASE from '../config/api';

export default function RecoveryManager({ admin }) {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [showApproved, setShowApproved] = useState(false); // Toggle for History

    // Fetch Requests Function
    const fetchRequests = async (showSpinner = true) => {
        if (showSpinner) setRefreshing(true);
        try {
            const token = localStorage.getItem('admin_token');
            const res = await fetch(`${API_BASE}/api/admin/recovery/pending`, {
                headers: {
                    'Authorization': token ? `Bearer ${token}` : ''
                }
            });
            const data = await res.json();
            if (Array.isArray(data)) {
                // Sort by ID descending (newest first)
                setRequests(data.sort((a, b) => b.id - a.id));
            }
        } catch (err) {
            console.error("Failed to fetch requests");
        } finally {
            // Min delay to show spinner
            if (showSpinner) setTimeout(() => setRefreshing(false), 500);
        }
    };

    // Filter Lists
    const activeRequests = requests.filter(r => r.status !== 'APPROVED');
    const approvedRequests = requests.filter(r => r.status === 'APPROVED');
    const pendingCount = requests.filter(r => r.status === 'PENDING_ADMIN').length;

    // Initial Load
    useEffect(() => {
        fetchRequests(true);
        const interval = setInterval(() => fetchRequests(false), 10000); // Auto-refresh silently
        return () => clearInterval(interval);
    }, []);

    const handleApprove = async (requestId) => {
        if (!window.confirm(`Approve Recovery Request #${requestId}?`)) return;
        setLoading(true);
        try {
            const token = localStorage.getItem('admin_token');
            const res = await fetch(`${API_BASE}/api/admin/recovery/approve`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? `Bearer ${token}` : ''
                },
                body: JSON.stringify({ requestId, adminId: admin?.id || admin?.username || 'ADMIN' })
            });
            const data = await res.json();
            if (res.ok) {
                // Optimistic Update or Refresh
                fetchRequests();
            } else {
                alert(`Error: ${data.error}`);
            }
        } catch (err) {
            alert('Connection failed');
        } finally {
            setLoading(false);
        }
    };

    // Helper for Status Badge
    const getStatusBadge = (status) => {
        switch (status) {
            case 'APPROVED':
                return (
                    <span style={{
                        background: '#d1fae5', color: '#065f46',
                        padding: '4px 12px', borderRadius: '9999px',
                        fontSize: '0.75rem', fontWeight: '700',
                        border: '1px solid #a7f3d0',
                        display: 'inline-flex', alignItems: 'center', gap: '4px'
                    }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#059669' }}></span>
                        APPROVED
                    </span>
                );
            case 'PENDING_ADMIN':
                return (
                    <span style={{
                        background: '#ffedd5', color: '#c2410c', // Orange
                        padding: '4px 12px', borderRadius: '9999px',
                        fontSize: '0.75rem', fontWeight: '700',
                        border: '1px solid #fdba74',
                        display: 'inline-flex', alignItems: 'center', gap: '4px'
                    }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ea580c' }}></span>
                        PENDING APPROVAL
                    </span>
                );
            case 'FAILED':
                return (
                    <span style={{
                        background: '#fee2e2', color: '#991b1b',
                        padding: '4px 12px', borderRadius: '9999px',
                        fontSize: '0.75rem', fontWeight: '700',
                        border: '1px solid #fecaca',
                        display: 'inline-flex', alignItems: 'center', gap: '4px'
                    }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#dc2626' }}></span>
                        FAILED
                    </span>
                );
            default: // INITIATED, NFC_VERIFIED
                return (
                    <span style={{
                        background: '#ffedd5', color: '#c2410c', // Orange (Same as Pending)
                        padding: '4px 12px', borderRadius: '9999px',
                        fontSize: '0.75rem', fontWeight: '700',
                        border: '1px solid #fdba74',
                        display: 'inline-flex', alignItems: 'center', gap: '4px'
                    }}>
                        <Loader2 size={10} className="spin" style={{ animation: 'spin 2s linear infinite' }} />
                        IN PROGRESS
                    </span>
                );
        }
    };

    const renderTable = (list, isHistory = false) => (
        <div style={{ width: '100%', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                    <tr style={{ background: isHistory ? '#f8fafc' : '#f3f4f6', borderBottom: '2px solid #e5e7eb' }}>
                        <th style={{ padding: '1rem 1.5rem', fontWeight: '600', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#4b5563', borderRight: '1px solid #e5e7eb' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Hash size={14} /> Request ID</div>
                        </th>
                        <th style={{ padding: '1rem 1.5rem', fontWeight: '600', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#4b5563', borderRight: '1px solid #e5e7eb' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><User size={14} /> Voter Identity</div>
                        </th>
                        <th style={{ padding: '1rem 1.5rem', fontWeight: '600', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#4b5563', borderRight: '1px solid #e5e7eb' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Clock size={14} /> Status</div>
                        </th>
                        <th style={{ padding: '1rem 1.5rem', fontWeight: '600', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#4b5563', borderRight: '1px solid #e5e7eb' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={14} /> Requested At</div>
                        </th>
                        {isHistory && (
                            <th style={{ padding: '1rem 1.5rem', fontWeight: '600', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#4b5563', borderRight: '1px solid #e5e7eb' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Shield size={14} /> Approved By</div>
                            </th>
                        )}
                        <th style={{ padding: '1rem 1.5rem', textAlign: 'right', fontWeight: '600', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#4b5563' }}>
                            Action
                        </th>
                    </tr>
                </thead>
                <tbody style={{ background: 'white' }}>
                    {list.map((req, index) => (
                        <tr key={req.id} style={{
                            borderBottom: '1px solid #e5e7eb',
                            background: index % 2 === 0 ? 'white' : (isHistory ? '#f8fafc' : '#f9fafb')
                        }}>
                            <td style={{ padding: '1rem 1.5rem', borderRight: '1px solid #f3f4f6', fontWeight: 'bold', color: '#111827', fontFamily: 'monospace' }}>
                                #{req.id}
                            </td>
                            <td style={{ padding: '1rem 1.5rem', borderRight: '1px solid #f3f4f6' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div style={{
                                        width: '36px', height: '36px', background: isHistory ? '#94a3b8' : 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                                        borderRadius: '50%', display: 'flex', alignItems: 'center',
                                        justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '0.9rem',
                                        boxShadow: isHistory ? 'none' : '0 2px 4px rgba(59, 130, 246, 0.3)'
                                    }}>
                                        {req.voter_id.substring(0, 1)}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: '600', color: isHistory ? '#64748b' : '#1f2937' }}>{req.voter_id}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Verified Biometrics</div>
                                    </div>
                                </div>
                            </td>
                            <td style={{ padding: '1rem 1.5rem', borderRight: '1px solid #f3f4f6' }}>
                                {getStatusBadge(req.status)}
                            </td>
                            <td style={{ padding: '1rem 1.5rem', borderRight: '1px solid #f3f4f6', color: '#4b5563', fontSize: '0.9rem' }}>
                                {new Date(req.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                                    {new Date(req.created_at).toLocaleDateString()}
                                </div>
                            </td>
                            {isHistory && (
                                <td style={{ padding: '1rem 1.5rem', borderRight: '1px solid #f3f4f6', color: '#4b5563', fontSize: '0.9rem' }}>
                                    {req.approved_by || '-'}
                                </td>
                            )}
                            <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                                {req.status === 'PENDING_ADMIN' ? (
                                    <button
                                        onClick={() => handleApprove(req.id)}
                                        disabled={loading}
                                        className="btn"
                                        style={{
                                            background: '#10b981', color: 'white',
                                            padding: '0.5rem 1.25rem',
                                            fontSize: '0.85rem',
                                            boxShadow: '0 2px 4px rgba(16, 185, 129, 0.2)',
                                            fontWeight: '600', opacity: loading ? 0.7 : 1,
                                            display: 'inline-flex', alignItems: 'center', gap: '6px'
                                        }}
                                    >
                                        <CheckCircle size={16} /> Approve
                                    </button>
                                ) : req.status === 'APPROVED' ? (
                                    <span style={{
                                        color: '#059669', fontSize: '0.85rem', fontWeight: '600',
                                        display: 'inline-flex', alignItems: 'center', gap: '6px'
                                    }}>
                                        <CheckCircle size={16} /> Completed
                                    </span>
                                ) : req.status === 'FAILED' ? (
                                    <span style={{
                                        color: '#dc2626', fontSize: '0.85rem', fontWeight: '600',
                                        display: 'inline-flex', alignItems: 'center', gap: '6px'
                                    }}>
                                        <XCircle size={16} /> Failed
                                    </span>
                                ) : (
                                    <span style={{
                                        color: '#c2410c', fontSize: '0.85rem', fontWeight: '600',
                                        display: 'inline-flex', alignItems: 'center', gap: '6px'
                                    }}>
                                        <Loader2 size={16} className="spin" style={{ animation: 'spin 2s linear infinite' }} /> In Progress
                                    </span>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    return (
        <div className="card" style={{ padding: '0', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}>
            <div style={{
                padding: '1.5rem 2rem',
                borderBottom: '1px solid #e5e7eb',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'linear-gradient(to right, #ffffff, #f9fafb)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ padding: '8px', background: '#e0e7ff', borderRadius: '8px', color: '#1a237e' }}>
                        <Shield size={24} />
                    </div>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#111827', fontWeight: '700' }}>
                            Account Recovery
                        </h2>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#6b7280' }}>
                            Manage and approve pending voter access requests
                        </p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    {pendingCount > 0 && (
                        <div style={{
                            padding: '0.5rem 1rem', background: '#fff7ed', border: '1px solid #ffedd5',
                            borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '6px',
                            color: '#c2410c', fontSize: '0.9rem', fontWeight: 'bold'
                        }}>
                            <AlertCircle size={16} /> {pendingCount} Pending
                        </div>
                    )}
                    <button
                        onClick={() => fetchRequests(true)}
                        className="btn btn-primary"
                        disabled={refreshing}
                        style={{
                            padding: '0.6rem 1.2rem',
                            fontSize: '0.9rem',
                            display: 'flex', alignItems: 'center', gap: '8px',
                            background: '#1a237e',
                            transition: 'all 0.2s'
                        }}
                    >
                        <RefreshCw size={16} className={refreshing ? 'spin' : ''} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
                        {refreshing ? 'Refreshing...' : 'Refresh'}
                    </button>
                </div>
                <style>{`
                    @keyframes spin { 100% { transform: rotate(360deg); } }
                `}</style>
            </div>

            {/* ACTIVE REQUESTS */}
            {activeRequests.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem 2rem', background: '#f9fafb' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.1, filter: 'grayscale(100%)' }}>📭</div>
                    <h3 style={{ color: '#374151', marginBottom: '0.5rem', fontWeight: '600' }}>No Active Requests</h3>
                    <p style={{ color: '#9ca3af', fontSize: '0.9rem' }}>No pending actions required.</p>
                </div>
            ) : (
                renderTable(activeRequests)
            )}

            {/* HISTORY TOGGLE */}
            {approvedRequests.length > 0 && (
                <div style={{ padding: '1.5rem', background: '#f9fafb', borderTop: '1px solid #e5e7eb', textAlign: 'center' }}>
                    <button
                        onClick={() => setShowApproved(!showApproved)}
                        className="btn"
                        style={{
                            background: '#f0fdf4', color: '#166534',
                            padding: '0.75rem 1.5rem', borderRadius: '8px',
                            border: '1px solid #bbf7d0', cursor: 'pointer',
                            display: 'inline-flex', alignItems: 'center', gap: '8px',
                            fontWeight: '600', fontSize: '0.9rem',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                            transition: 'all 0.2s'
                        }}
                    >
                        <History size={16} />
                        {showApproved ? 'Hide Approved History' : `Show Approved History (${approvedRequests.length})`}
                        {showApproved ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>

                    {showApproved && (
                        <div style={{ marginTop: '1.5rem', border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                            {renderTable(approvedRequests, true)}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
