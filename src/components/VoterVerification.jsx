import React, { useState, useEffect, useRef } from 'react';
import * as faceapi from 'face-api.js';
import { Camera, Search, UserCheck, AlertTriangle } from 'lucide-react';
import API_BASE from '../config/api';

const VoterVerification = () => {
    const [voterId, setVoterId] = useState('');
    const [voterData, setVoterData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [modelsLoaded, setModelsLoaded] = useState(false);
    const [verificationStatus, setVerificationStatus] = useState(null); // 'matched', 'mismatch', 'pending'
    const [cameraActive, setCameraActive] = useState(false);

    const videoRef = useRef();

    useEffect(() => {
        loadModels();
    }, []);

    const loadModels = async () => {
        try {
            const MODEL_URL = '/models';
            await Promise.all([
                faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
                faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
                faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
            ]);
            setModelsLoaded(true);
        } catch (err) {
            console.error("Failed to load FaceAPI models", err);
        }
    };

    const fetchVoter = async (e) => {
        e.preventDefault();
        setLoading(true);
        setVoterData(null);
        setVerificationStatus(null);
        setCameraActive(false);

        try {
            // Re-using existing voter fetch logic logic (we need an endpoint or just fetch from DB)
            // Ideally we need GET /api/voter/:id. Does it exist? 
            // The Voter model has findVoterById, need to expose it or reuse an endpoint.
            // Let's assume we'll add GET /api/voter/:id or use a generic search

            // Temporary: Use a direct DB call via a new route we need to create
            const token = localStorage.getItem('admin_token');
            const res = await fetch(`${API_BASE}/api/voter/${voterId}`, {
                headers: {
                    'Authorization': token ? `Bearer ${token}` : ''
                }
            });
            const data = await res.json();

            if (res.ok) {
                setVoterData(data);
            } else {
                alert(data.error || 'Voter not found');
            }
        } catch (err) {
            console.error(err);
            alert('Error fetching voter');
        } finally {
            setLoading(false);
        }
    };

    const startVideo = () => {
        navigator.mediaDevices.getUserMedia({ video: {} })
            .then(stream => {
                videoRef.current.srcObject = stream;
                setCameraActive(true);
            })
            .catch(err => console.error("Camera Error:", err));
    };

    const verifyFace = async () => {
        if (!videoRef.current || !modelsLoaded || !voterData || !voterData.face_descriptor) return;

        const detections = await faceapi.detectSingleFace(videoRef.current)
            .withFaceLandmarks()
            .withFaceDescriptor();

        if (detections) {
            const currentDescriptor = detections.descriptor;
            const storedDescriptor = new Float32Array(JSON.parse(voterData.face_descriptor));

            const distance = faceapi.euclideanDistance(currentDescriptor, storedDescriptor);

            // Threshold usually 0.6. Lower is stricter.
            if (distance < 0.5) {
                setVerificationStatus('matched');
            } else {
                setVerificationStatus('mismatch');
            }
            // Stop camera after check
            // stopVideo(); 
        } else {
            alert("No face detected! Look at camera.");
        }
    };

    return (
        <div>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3>Live Voter Verification</h3>
                <span className="phase-badge phase-live">Polling Station Officer</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>

                {/* Search Column */}
                <div className="card">
                    <h4>Step 1: Identify Voter</h4>
                    <form onSubmit={fetchVoter} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                        <input
                            type="text"
                            value={voterId}
                            onChange={(e) => setVoterId(e.target.value)}
                            placeholder="Scan/Enter Voter ID"
                            required
                            style={{ flex: 1, padding: '0.8rem', borderRadius: '6px', border: '1px solid #ddd' }}
                        />
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Searching...' : <Search size={20} />}
                        </button>
                    </form>

                    {voterData && (
                        <div style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '8px', border: '1px solid #eee' }}>
                            <div style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>{voterData.name}</div>
                            <div style={{ color: '#555', marginBottom: '0.5rem' }}>ID: <strong>{voterData.id}</strong></div>
                            <div style={{ color: '#555' }}>Constituency: <strong>{voterData.constituency}</strong></div>
                        </div>
                    )}
                </div>

                {/* Verification Column */}
                <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <h4>Step 2: Biometric Check</h4>

                    {voterData ? (
                        <>
                            <div style={{
                                width: '300px', height: '225px',
                                background: '#000', borderRadius: '12px', overflow: 'hidden',
                                position: 'relative', marginBottom: '1rem'
                            }}>
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    muted
                                    width="300"
                                    height="225"
                                    style={{ display: cameraActive ? 'block' : 'none' }}
                                />
                                {!cameraActive && (
                                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                                        Ready to Verify
                                    </div>
                                )}

                                {verificationStatus === 'matched' && (
                                    <div style={{
                                        position: 'absolute', inset: 0, background: 'rgba(46, 125, 50, 0.8)',
                                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white'
                                    }}>
                                        <UserCheck size={64} />
                                        <h2 style={{ margin: '0.5rem 0' }}>VERIFIED</h2>
                                        <p>Identity Confirmed</p>
                                    </div>
                                )}

                                {verificationStatus === 'mismatch' && (
                                    <div style={{
                                        position: 'absolute', inset: 0, background: 'rgba(198, 40, 40, 0.8)',
                                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white'
                                    }}>
                                        <AlertTriangle size={64} />
                                        <h2 style={{ margin: '0.5rem 0' }}>MISMATCH</h2>
                                        <p>Identity Rejected</p>
                                    </div>
                                )}
                            </div>

                            <div style={{ display: 'flex', gap: '1rem' }}>
                                {!cameraActive ? (
                                    <button onClick={startVideo} className="btn btn-primary" disabled={!modelsLoaded}>
                                        <Camera size={16} style={{ marginRight: '5px', marginBottom: '-2px' }} /> Start Verification
                                    </button>
                                ) : (
                                    <button onClick={verifyFace} className="btn" style={{ background: '#FF9800', color: 'white' }}>
                                        Inspect & Verify
                                    </button>
                                )}
                            </div>
                        </>
                    ) : (
                        <p style={{ color: '#888', fontStyle: 'italic' }}>Identify a voter to begin verification.</p>
                    )}
                </div>

            </div>
        </div>
    );
};

export default VoterVerification;
