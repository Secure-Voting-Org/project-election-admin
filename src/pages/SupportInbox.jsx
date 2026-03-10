import React, { useState, useEffect } from 'react';
import { Inbox, CheckCircle, Clock, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const STATUS_CONFIG = {
    OPEN: { label: 'Open', color: '#ef4444', bg: '#fef2f2', icon: AlertCircle },
    IN_PROGRESS: { label: 'In Progress', color: '#f59e0b', bg: '#fffbeb', icon: Clock },
    RESOLVED: { label: 'Resolved', color: '#22c55e', bg: '#f0fdf4', icon: CheckCircle },
};

const TicketRow = ({ ticket, onUpdate }) => {
    const [expanded, setExpanded] = useState(false);
    const [notes, setNotes] = useState(ticket.admin_notes || '');
    const [updating, setUpdating] = useState(false);
    const cfg = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.OPEN;
    const Icon = cfg.icon;

    const handleUpdate = async (newStatus) => {
        setUpdating(true);
        try {
            const token = localStorage.getItem('adminToken');
            const res = await fetch(`${API_BASE}/api/support/tickets/${ticket.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ status: newStatus, admin_notes: notes }),
            });
            if (!res.ok) throw new Error('Failed');
            onUpdate();
        } catch {} finally {
            setUpdating(false);
        }
    };

    return (
        <div style={{ border: '1px solid #e5e7eb', borderRadius: '10px', marginBottom: '0.75rem', overflow: 'hidden' }}>
            {/* Header */}
            <div
                onClick={() => setExpanded(e => !e)}
                style={{ padding: '1rem 1.25rem', background: 'white', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ background: cfg.bg, color: cfg.color, padding: '0.35rem', borderRadius: '6px' }}>
                        <Icon size={16} />
                    </div>
                    <div>
                        <p style={{ margin: 0, fontWeight: 600, color: '#1e293b' }}>#{ticket.id} — {ticket.subject}</p>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8' }}>
                            {ticket.voter_mobile ? `📱 ${ticket.voter_mobile}` : 'Anonymous'} · {new Date(ticket.created_at).toLocaleString()}
                        </p>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: cfg.color, background: cfg.bg, padding: '0.2rem 0.6rem', borderRadius: '999px' }}>{cfg.label}</span>
                    {expanded ? <ChevronUp size={16} color="#94a3b8" /> : <ChevronDown size={16} color="#94a3b8" />}
                </div>
            </div>

            {/* Expanded body */}
            {expanded && (
                <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid #f1f5f9', background: '#f8fafc' }}>
                    <p style={{ margin: '0 0 1rem', color: '#475569', whiteSpace: 'pre-wrap' }}>{ticket.message}</p>
                    <textarea
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                        placeholder="Add notes (optional)..."
                        rows={2}
                        style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.875rem', fontFamily: 'inherit', marginBottom: '0.75rem', resize: 'vertical' }}
                    />
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {ticket.status !== 'IN_PROGRESS' && (
                            <button onClick={() => handleUpdate('IN_PROGRESS')} disabled={updating}
                                style={{ padding: '0.45rem 1rem', background: '#f59e0b', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>
                                Move to In Progress
                            </button>
                        )}
                        {ticket.status !== 'RESOLVED' && (
                            <button onClick={() => handleUpdate('RESOLVED')} disabled={updating}
                                style={{ padding: '0.45rem 1rem', background: '#22c55e', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>
                                ✓ Mark Resolved
                            </button>
                        )}
                        {ticket.status !== 'OPEN' && (
                            <button onClick={() => handleUpdate('OPEN')} disabled={updating}
                                style={{ padding: '0.45rem 1rem', background: '#f1f5f9', color: '#475569', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>
                                Reopen
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

const SupportInbox = () => {
    const [tickets, setTickets] = useState([]);
    const [filter, setFilter] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchTickets = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('adminToken');
            const url = filter ? `${API_BASE}/api/support/tickets?status=${filter}` : `${API_BASE}/api/support/tickets`;
            const res = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
            const data = await res.json();
            setTickets(Array.isArray(data) ? data : []);
        } catch {} finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchTickets(); }, [filter]);

    const counts = tickets.reduce((acc, t) => { acc[t.status] = (acc[t.status] || 0) + 1; return acc; }, {});

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div>
                    <h2 style={{ margin: 0, fontWeight: 700, fontSize: '1.5rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Inbox size={22} /> Support Inbox
                    </h2>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '0.875rem', marginTop: '0.2rem' }}>Voter help requests</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {['', 'OPEN', 'IN_PROGRESS', 'RESOLVED'].map(s => (
                        <button key={s} onClick={() => setFilter(s)}
                            style={{ padding: '0.4rem 0.8rem', borderRadius: '6px', border: `1px solid ${filter === s ? '#3b82f6' : '#e5e7eb'}`, background: filter === s ? '#eff6ff' : 'white', color: filter === s ? '#3b82f6' : '#64748b', fontWeight: 600, cursor: 'pointer', fontSize: '0.8rem' }}>
                            {s || 'All'} {s && counts[s] ? `(${counts[s]})` : ''}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>Loading tickets...</div>
            ) : tickets.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                    <Inbox size={48} style={{ margin: '0 auto 0.75rem', opacity: 0.3 }} />
                    <p>No tickets found</p>
                </div>
            ) : (
                tickets.map(t => <TicketRow key={t.id} ticket={t} onUpdate={fetchTickets} />)
            )}
        </div>
    );
};

export default SupportInbox;
