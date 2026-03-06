import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Eye, Loader, CreditCard } from 'lucide-react';
import API_BASE from '../config/api';

const PendingVerifications = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedApp, setSelectedApp] = useState(null);

    const [acceptedApps, setAcceptedApps] = useState([]);
    const [rejectedApps, setRejectedApps] = useState([]);

    // NFC Assignment State
    const [nfcModalOpen, setNfcModalOpen] = useState(false);
    const [currentVoterForNfc, setCurrentVoterForNfc] = useState(null);
    const [nfcTagId, setNfcTagId] = useState('');

    useEffect(() => {
        fetchAll();
    }, []);

    const fetchAll = () => {
        fetchPending();
        fetchAccepted();
        fetchRejected();
    };

    const fetchPending = async () => {
        try {
            const token = localStorage.getItem('admin_token');
            const res = await fetch(`${API_BASE}/api/admin/pending-voters`, {
                headers: {
                    'Authorization': token ? `Bearer ${token}` : ''
                }
            });
            const data = await res.json();
            setApplications(data);
        } catch (err) {
            console.error("Failed to fetch pending applications", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchAccepted = async () => {
        try {
            const token = localStorage.getItem('admin_token');
            const res = await fetch(`${API_BASE}/api/admin/approved-voters`, {
                headers: {
                    'Authorization': token ? `Bearer ${token}` : ''
                }
            });
            const data = await res.json();
            setAcceptedApps(data);
        } catch (err) {
            console.error("Failed to fetch accepted applications", err);
        }
    };

    const fetchRejected = async () => {
        try {
            const token = localStorage.getItem('admin_token');
            const res = await fetch(`${API_BASE}/api/admin/rejected-voters`, {
                headers: {
                    'Authorization': token ? `Bearer ${token}` : ''
                }
            });
            const data = await res.json();
            setRejectedApps(data);
        } catch (err) {
            console.error("Failed to fetch rejected applications", err);
        }
    };

    const handleApprove = async (appId) => {
        if (!window.confirm("Approve this voter application?")) return;
        try {
            const token = localStorage.getItem('admin_token');
            const res = await fetch(`${API_BASE}/api/admin/approve-voter`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? `Bearer ${token}` : ''
                },
                body: JSON.stringify({ applicationId: appId })
            });
            if (res.ok) {
                alert("Voter Approved Successfully!");
                fetchAll();
                setSelectedApp(null);
            } else {
                alert("Approval Failed");
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleReject = async (appId) => {
        const reason = window.prompt("Please enter the reason for rejection:");
        if (!reason) return; // Cancel if no reason provided

        if (!window.confirm("Are you sure you want to reject this application?")) return;

        try {
            const token = localStorage.getItem('admin_token');
            const res = await fetch(`${API_BASE}/api/admin/reject-voter`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? `Bearer ${token}` : ''
                },
                body: JSON.stringify({ applicationId: appId, reason })
            });
            if (res.ok) {
                alert("Application Rejected");
                fetchAll();
                setSelectedApp(null);
            } else {
                alert("Rejection Failed");
            }
        } catch (err) {
            console.error(err);
        }
    };

    // NFC Handlers
    const openNfcModal = (voter) => {
        setCurrentVoterForNfc(voter);
        setNfcTagId(''); // Reset input
        setNfcModalOpen(true);
    };

    useEffect(() => {
        let abortController = new AbortController();
        if (nfcModalOpen) {
            startNfcScan(abortController);
        }
        return () => abortController.abort();
    }, [nfcModalOpen]);

    const startNfcScan = async (controller) => {
        if (!('NDEFReader' in window)) return;
        try {
            const ndef = new NDEFReader();
            await ndef.scan({ signal: controller.signal });
            ndef.onreading = (event) => {
                const serialNumber = event.serialNumber;
                console.log("NFC Tag read:", serialNumber);
                if (serialNumber) setNfcTagId(serialNumber);
            };
            ndef.onreadingerror = () => console.error("NFC Read Error");
        } catch (error) {
            console.error("NFC Scan Error:", error);
        }
    };

    const submitNfcAssignment = async (e) => {
        e.preventDefault();
        if (!nfcTagId.trim()) return;

        try {
            const token = localStorage.getItem('admin_token');
            const res = await fetch(`${API_BASE}/api/admin/assign-nfc`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? `Bearer ${token}` : ''
                },
                body: JSON.stringify({
                    currentVoterId: currentVoterForNfc.voter_id || currentVoterForNfc.id, // Handle different field names if any
                    nfcTagId: nfcTagId.trim()
                })
            });

            const result = await res.json();

            if (res.ok) {
                alert(`Success! NFC Assigned.\nNew Voter ID: ${result.voter.id}`);
                setNfcModalOpen(false);
                fetchAll(); // Refresh lists
            } else {
                alert(`Error: ${result.error}`);
            }
        } catch (err) {
            console.error("NFC Assign Error:", err);
            alert("Failed to assign NFC tag.");
        }
    };


    const getSrc = (data) => {
        if (!data) return null;
        try {
            // Check if it looks like a JSON object
            if (typeof data === 'string' && data.trim().startsWith('{')) {
                const parsed = JSON.parse(data);
                return parsed.base64 || data;
            }
        } catch (e) {
            console.warn("Failed to parse image data", e);
        }
        return data;
    };

    const renderDocument = (data, label) => {
        const src = getSrc(data);
        if (!src) return null;

        // Check if PDF (Base64 signature for PDF is JVBERi...)
        // Or check data URI prefix data:application/pdf
        const isPdf = src.startsWith('data:application/pdf') || src.includes('JVBERi');

        if (isPdf) {
            return (
                <div
                    title={`${label} (PDF)`}
                    onClick={() => window.open(src)}
                    style={{
                        width: '60px', height: '60px',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer', background: '#f9f9f9',
                        fontSize: '0.7rem', color: '#d32f2f'
                    }}
                >
                    <span style={{ fontSize: '1.5rem' }}>📄</span>
                    PDF
                </div>
            );
        }

        return (
            <img
                src={src}
                alt={label}
                style={{ height: '60px', cursor: 'pointer', border: '1px solid #ddd', objectFit: 'cover' }}
                title={label}
                onClick={() => window.open(src)}
                onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/60?text=Err'; }}
            />
        );
    };

    const handleViewDetails = async (appId) => {
        try {
            // Fetch full details including images
            const token = localStorage.getItem('admin_token');
            const res = await fetch(`${API_BASE}/api/admin/pending-voter/${appId}`, {
                headers: {
                    'Authorization': token ? `Bearer ${token}` : ''
                }
            });
            if (!res.ok) throw new Error("Failed to fetch details");
            const data = await res.json();
            setSelectedApp(data);
        } catch (err) {
            console.error(err);
            alert("Failed to load application details");
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3>Pending Voter Verifications</h3>
                <span className="phase-badge phase-live">Admin Action Required</span>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '2rem' }}>Loading...</div>
            ) : (
                <>
                    {/* PENDING SECTION */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem', marginBottom: '3rem' }}>
                        {applications.length === 0 && <p>No pending applications.</p>}

                        {applications.map(app => (
                            <div key={app.application_id} className="card" style={{ position: 'relative' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <h5>{app.full_name}</h5>
                                    <span style={{ fontSize: '0.8rem', color: '#666' }}>{app.reference_id}</span>
                                </div>
                                <p style={{ margin: '0.5rem 0', fontSize: '0.9rem', color: '#555' }}>
                                    <strong>Constituency:</strong> {app.constituency}<br />
                                    <strong>Aadhaar:</strong> {app.aadhaar_number}
                                </p>

                                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                                    <button
                                        className="btn"
                                        style={{ flex: 1, background: '#e0e0e0', color: '#333' }}
                                        onClick={() => handleViewDetails(app.application_id)}
                                    >
                                        <Eye size={16} style={{ marginRight: '5px' }} /> View Details
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <hr />

                    {/* ACCEPTED SECTION */}
                    <div style={{ marginTop: '3rem' }}>
                        <h3 style={{ color: '#388e3c', marginBottom: '1rem' }}>Accepted Applications</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                            {acceptedApps.length === 0 && <p>No accepted applications yet.</p>}
                            {acceptedApps.map(app => (
                                <div key={app.application_id} className="card" style={{ borderLeft: '4px solid #388e3c' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <h5>{app.full_name}</h5>
                                        <span className="badge badge-success">APPROVED</span>
                                    </div>
                                    <p style={{ margin: '0.5rem 0', fontSize: '0.9rem', color: '#555' }}>
                                        Ref: {app.reference_id} <br />
                                        <span style={{ fontSize: '0.8em', color: '#888' }}>Voter ID: {app.voter_id}</span>
                                    </p>

                                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                                        <button
                                            className="btn"
                                            style={{ flex: 1, background: '#f1f8e9', color: '#33691e', border: '1px solid #c5e1a5', fontSize: '0.8rem' }}
                                            onClick={() => handleViewDetails(app.application_id)}
                                        >
                                            Details
                                        </button>
                                        <button
                                            className="btn"
                                            style={{ flex: 1, background: '#1976d2', color: 'white', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                            onClick={() => openNfcModal(app)}
                                            title="Assign NFC Tag"
                                        >
                                            <CreditCard size={14} style={{ marginRight: '4px' }} /> Assign NFC
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* REJECTED SECTION */}
                    <div style={{ marginTop: '3rem' }}>
                        <h3 style={{ color: '#d32f2f', marginBottom: '1rem' }}>Rejected Applications</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                            {rejectedApps.length === 0 && <p>No rejected applications yet.</p>}
                            {rejectedApps.map(app => (
                                <div key={app.application_id} className="card" style={{ borderLeft: '4px solid #d32f2f' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <h5>{app.full_name}</h5>
                                        <span className="badge badge-danger">REJECTED</span>
                                    </div>
                                    <p style={{ margin: '0.5rem 0', fontSize: '0.9rem', color: '#555' }}>
                                        Ref: {app.reference_id} | Reason: {app.rejection_reason}
                                    </p>
                                    <button
                                        className="btn"
                                        style={{ width: '100%', marginTop: '0.5rem', background: '#ffebee', color: '#b71c1c', border: '1px solid #ffcdd2' }}
                                        onClick={() => handleViewDetails(app.application_id)}
                                    >
                                        View Details
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}

            {/* Application Detail Modal */}
            {selectedApp && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', maxWidth: '800px', width: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h4>Application Details: {selectedApp.full_name}</h4>
                            <span className={`badge ${selectedApp.status === 'APPROVED' ? 'badge-success' : selectedApp.status === 'REJECTED' ? 'badge-danger' : 'badge-warning'}`}>
                                {selectedApp.status}
                            </span>
                        </div>
                        <hr style={{ margin: '1rem 0', opacity: 0.2 }} />

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                            <div>
                                <p><strong>Reference ID:</strong> {selectedApp.reference_id}</p>
                                <p><strong>Voter ID:</strong> {selectedApp.voter_id || 'N/A'}</p>
                                <p><strong>Gender:</strong> {selectedApp.gender}</p>
                                <p><strong>DOB:</strong> {selectedApp.dob}</p>
                                <p><strong>Address:</strong> {selectedApp.address}</p>
                                <p><strong>District:</strong> {selectedApp.district}, {selectedApp.state}</p>
                                <p><strong>Mobile:</strong> {selectedApp.mobile}</p>
                                <p><strong>Email:</strong> {selectedApp.email}</p>
                                {selectedApp.disability_details !== 'None' && (
                                    <p style={{ color: 'red' }}><strong>Disability:</strong> {selectedApp.disability_details}</p>
                                )}
                                {selectedApp.status === 'REJECTED' && (
                                    <p style={{ color: 'red', marginTop: '1rem', background: '#ffebee', padding: '0.5rem' }}>
                                        <strong>Rejection Reason:</strong> {selectedApp.rejection_reason}
                                    </p>
                                )}
                            </div>

                            <div>
                                <p><strong>Profile Photo:</strong></p>
                                {selectedApp.profile_image_data ? (
                                    renderDocument(selectedApp.profile_image_data, 'Profile Photo')
                                ) : <span style={{ color: '#999' }}>No Image</span>}

                                <p style={{ marginTop: '1rem' }}><strong>Proofs:</strong></p>
                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                    {selectedApp.dob_proof_data && renderDocument(selectedApp.dob_proof_data, 'DOB Proof')}
                                    {selectedApp.address_proof_data && renderDocument(selectedApp.address_proof_data, 'Address Proof')}
                                    {selectedApp.disability_proof_data && renderDocument(selectedApp.disability_proof_data, 'Disability Proof')}
                                </div>
                            </div>
                        </div>

                        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                            <button className="btn" onClick={() => setSelectedApp(null)}>Close</button>

                            {selectedApp.status === 'PENDING' && (
                                <>
                                    <button
                                        className="btn"
                                        style={{ background: '#d32f2f', color: 'white' }}
                                        onClick={() => handleReject(selectedApp.application_id)}
                                    >
                                        <XCircle size={18} style={{ marginRight: '5px' }} /> Reject
                                    </button>
                                    <button
                                        className="btn"
                                        style={{ background: '#388e3c', color: 'white' }}
                                        onClick={() => handleApprove(selectedApp.application_id)}
                                    >
                                        <CheckCircle size={18} style={{ marginRight: '5px' }} /> Approve
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* NFC Assignment Modal */}
            {nfcModalOpen && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100
                }}>
                    <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', maxWidth: '450px', width: '90%', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
                        <div style={{ marginBottom: '1rem', color: '#2196f3' }}>
                            <CreditCard size={48} />
                        </div>
                        <h3 style={{ marginBottom: '0.5rem' }}>Ready to Scan</h3>
                        <p style={{ marginBottom: '1.5rem', color: '#666' }}>
                            Place the NFC card on the reader.<br />The UID will be captured automatically.
                        </p>

                        <form onSubmit={submitNfcAssignment}>
                            <div style={{ marginBottom: '2rem', position: 'relative' }}>
                                <input
                                    type="text"
                                    value={nfcTagId}
                                    onChange={(e) => setNfcTagId(e.target.value)}
                                    placeholder="Listening for NFC..."
                                    autoFocus
                                    onBlur={(e) => {
                                        // Optional: keep focus if you want to force scanning
                                        // e.target.focus(); 
                                    }}
                                    style={{
                                        width: '100%', padding: '1rem', fontSize: '1.2rem',
                                        textAlign: 'center', letterSpacing: '2px',
                                        border: '2px dashed #2196f3', borderRadius: '8px',
                                        background: '#f0f9ff', color: '#0d47a1', fontWeight: 'bold'
                                    }}
                                />
                                {nfcTagId && (
                                    <span style={{ display: 'block', marginTop: '0.5rem', color: '#4caf50', fontSize: '0.9rem' }}>
                                        <CheckCircle size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} /> Card Detected
                                    </span>
                                )}
                            </div>

                            <div style={{ marginBottom: '1rem', textAlign: 'left', fontSize: '0.85rem', color: '#888', background: '#f5f5f5', padding: '0.5rem', borderRadius: '4px' }}>
                                <strong>Assigning to:</strong> {currentVoterForNfc?.full_name} <br />
                                <strong>Current ID:</strong> {currentVoterForNfc?.voter_id || currentVoterForNfc?.id}
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                                <button type="button" className="btn" onClick={() => setNfcModalOpen(false)} style={{ flex: 1, background: '#e0e0e0', color: '#333' }}>Cancel</button>
                                <button type="submit" className="btn" disabled={!nfcTagId} style={{ flex: 1, background: nfcTagId ? '#2196f3' : '#ccc', color: 'white' }}>
                                    Confirm Assignment
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PendingVerifications;
