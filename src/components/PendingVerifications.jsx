import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Eye, Loader } from 'lucide-react';

const PendingVerifications = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedApp, setSelectedApp] = useState(null);

    useEffect(() => {
        fetchPending();
    }, []);

    const fetchPending = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/admin/pending-voters');
            const data = await res.json();
            setApplications(data);
        } catch (err) {
            console.error("Failed to fetch pending applications", err);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (appId) => {
        if (!window.confirm("Approve this voter application?")) return;
        try {
            const res = await fetch('http://localhost:5000/api/admin/approve-voter', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ applicationId: appId })
            });
            if (res.ok) {
                alert("Voter Approved Successfully!");
                fetchPending();
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
            const res = await fetch('http://localhost:5000/api/admin/reject-voter', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ applicationId: appId, reason })
            });
            if (res.ok) {
                alert("Application Rejected");
                fetchPending();
                setSelectedApp(null);
            } else {
                alert("Rejection Failed");
            }
        } catch (err) {
            console.error(err);
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
            const res = await fetch(`http://localhost:5000/api/admin/pending-voter/${appId}`);
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
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
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
            )}

            {/* Application Detail Modal */}
            {selectedApp && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', maxWidth: '800px', width: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
                        <h4>Application Details: {selectedApp.full_name}</h4>
                        <hr style={{ margin: '1rem 0', opacity: 0.2 }} />

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                            <div>
                                <p><strong>Reference ID:</strong> {selectedApp.reference_id}</p>
                                <p><strong>Gender:</strong> {selectedApp.gender}</p>
                                <p><strong>DOB:</strong> {selectedApp.dob}</p>
                                <p><strong>Address:</strong> {selectedApp.address}</p>
                                <p><strong>District:</strong> {selectedApp.district}, {selectedApp.state}</p>
                                <p><strong>Mobile:</strong> {selectedApp.mobile}</p>
                                <p><strong>Email:</strong> {selectedApp.email}</p>
                                {selectedApp.disability_details !== 'None' && (
                                    <p style={{ color: 'red' }}><strong>Disability:</strong> {selectedApp.disability_details}</p>
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
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PendingVerifications;
