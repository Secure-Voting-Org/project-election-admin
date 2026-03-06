import React, { useState, useEffect, useRef } from 'react';
import * as faceapi from 'face-api.js';
import { Camera, UserPlus, Save, RefreshCw, Wifi } from 'lucide-react';
import { useNFC } from '../hooks/useNFC';
import API_BASE from '../config/api';

const VoterRegistration = () => {
    const [constituencies, setConstituencies] = useState([]);
    const [formData, setFormData] = useState({ id: '', name: '', constituency: '' });
    const [loading, setLoading] = useState(false);
    const [modelsLoaded, setModelsLoaded] = useState(false);
    const [faceDescriptor, setFaceDescriptor] = useState(null);
    const [cameraActive, setCameraActive] = useState(false);

    // NFC State
    const [inputMode, setInputMode] = useState('MANUAL'); // 'MANUAL' | 'NFC'
    const { scan, stop: stopNFC, isReading, error: nfcError } = useNFC();

    const videoRef = useRef();
    const canvasRef = useRef();

    useEffect(() => {
        fetchConstituencies();
        loadModels();
        generateVoterId();
    }, []);

    const generateVoterId = () => {
        // Simulate NFC Card ID Generation (e.g., VID-8AJ2)
        const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
        const timestamp = Date.now().toString().slice(-4);
        setFormData(prev => ({ ...prev, id: `VID-${randomStr}${timestamp}` }));
    };

    const handleNFCScan = () => {
        scan((data) => {
            // Priority: ID from JSON record -> SerialNumber (UID) -> Error
            const scannedId = data.id || data.serialNumber;

            if (scannedId) {
                // Determine source for display naming
                const isUID = !data.id && data.serialNumber;

                setFormData({
                    id: scannedId,
                    name: data.name || (isUID ? 'Unregistered User' : ''),
                    constituency: data.constituency || ''
                });
                alert(isUID ? `Card UID Read: ${scannedId}` : "Card Data Read Successfully!");
                stopNFC();
            } else {
                alert("Invalid Card Data (No ID or Serial Number detected)");
            }
        });
    };

    const simulateNFCScan = () => {
        // Mock data for testing without hardware
        setFormData({
            id: 'VID-SIM-' + Math.floor(Math.random() * 10000),
            name: 'Simulated User',
            constituency: constituencies[0]?.name || '' // Default to first available
        });
        alert("Simulated Scan Complete!");
    };


    const fetchConstituencies = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/constituencies`);
            const data = await res.json();
            setConstituencies(data);
        } catch (err) {
            console.error('Failed to fetch constituencies', err);
        }
    };

    const loadModels = async () => {
        try {
            const MODEL_URL = '/models/weights';
            await Promise.all([
                faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
                faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
                faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
            ]);
            setModelsLoaded(true);
            console.log("FaceAPI Models Loaded");
        } catch (err) {
            console.error("Failed to load FaceAPI models", err);
            alert(`Failed to load Face AI Models: ${err.message}. Check console.`);
        }
    };

    const startVideo = () => {
        navigator.mediaDevices.getUserMedia({ video: {} })
            .then(stream => {
                videoRef.current.srcObject = stream;
                setCameraActive(true);
            })
            .catch(err => {
                console.error("Camera Error:", err);
                alert(`Camera Error: ${err.name} - ${err.message}`);
            });
    };

    const stopVideo = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            videoRef.current.srcObject.getTracks().forEach(track => track.stop());
            setCameraActive(false);
        }
    };

    const captureFace = async () => {
        if (!videoRef.current || !modelsLoaded) return;

        const detections = await faceapi.detectSingleFace(videoRef.current)
            .withFaceLandmarks()
            .withFaceDescriptor();

        if (detections) {
            setFaceDescriptor(Array.from(detections.descriptor)); // Convert Float32Array to Array

            // Draw detections (optional feedback)
            const displaySize = { width: videoRef.current.width, height: videoRef.current.height };
            // faceapi.matchDimensions(canvasRef.current, displaySize);
            // const resizedDetections = faceapi.resizeResults(detections, displaySize);
            // faceapi.draw.drawDetections(canvasRef.current, resizedDetections);

            alert("Face Captured Successfully!");
            stopVideo();
        } else {
            alert("No face detected. Please try again.");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!faceDescriptor) {
            alert("Please capture face data first!");
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('admin_token');
            const payload = { ...formData, faceDescriptor };
            const res = await fetch(`${API_BASE}/api/admin/voter/register-direct`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? `Bearer ${token}` : ''
                },
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            if (res.ok) {
                alert('Voter Registered Successfully!');
                setFormData({ id: '', name: '', constituency: '' });
                generateVoterId();
                setFaceDescriptor(null);
                setCameraActive(false);
            } else {
                alert(data.error || 'Registration Failed');
            }
        } catch (err) {
            console.error(err);
            alert('Server Error');
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
                <h3 style={{ margin: 0, color: 'white' }}>Voter Registration & Biometric Setup</h3>
                <span className="phase-badge" style={{ background: '#F47920', color: 'white', border: 'none' }}>PRE-POLL SETUP</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                {/* Form */}
                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h4 style={{ margin: 0 }}>Voter Details</h4>
                        {/* Input Mode Toggle */}
                        <div style={{ display: 'flex', background: '#f5f5f5', borderRadius: '20px', padding: '4px' }}>
                            <button
                                type="button"
                                onClick={() => setInputMode('MANUAL')}
                                style={{
                                    border: 'none', background: inputMode === 'MANUAL' ? 'white' : 'transparent',
                                    fontWeight: inputMode === 'MANUAL' ? 'bold' : 'normal',
                                    borderRadius: '16px', padding: '4px 12px', cursor: 'pointer', boxShadow: inputMode === 'MANUAL' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'
                                }}
                            >
                                Manual
                            </button>
                            <button
                                type="button"
                                onClick={() => setInputMode('NFC')}
                                style={{
                                    border: 'none', background: inputMode === 'NFC' ? 'white' : 'transparent',
                                    fontWeight: inputMode === 'NFC' ? 'bold' : 'normal',
                                    borderRadius: '16px', padding: '4px 12px', cursor: 'pointer', boxShadow: inputMode === 'NFC' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
                                    display: 'flex', alignItems: 'center', gap: '4px'
                                }}
                            >
                                <Wifi size={14} /> NFC
                            </button>
                        </div>
                    </div>

                    {inputMode === 'MANUAL' ? (
                        <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
                            <button type="button" onClick={generateVoterId} style={{ background: 'none', border: 'none', color: '#1565C0', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <RefreshCw size={14} /> New ID
                            </button>
                        </div>
                    ) : null}


                    <form onSubmit={handleSubmit}>
                        {inputMode === 'NFC' && (
                            <div style={{
                                padding: '2rem', border: '2px dashed #bbb', borderRadius: '12px',
                                textAlign: 'center', marginBottom: '1.5rem', background: isReading ? '#e8f5e9' : '#fafafa'
                            }}>
                                <Wifi size={48} color={isReading ? 'green' : '#ccc'} style={{ marginBottom: '1rem', animation: isReading ? 'pulse 1s infinite' : 'none' }} />
                                <h5 style={{ margin: '0 0 0.5rem 0' }}>{isReading ? 'Scanning...' : 'Ready to Scan'}</h5>
                                <p style={{ fontSize: '0.85rem', color: '#666', margin: 0 }}>
                                    {isReading ? 'Hold card near device' : 'Tap "Start Scan" to begin'}
                                </p>

                                <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                                    {!isReading ? (
                                        <button type="button" className="btn" onClick={handleNFCScan} style={{ background: '#212121', color: 'white' }}>
                                            Start Scan
                                        </button>
                                    ) : (
                                        <button type="button" className="btn btn-danger" onClick={stopNFC}>
                                            Stop
                                        </button>
                                    )}
                                    <button type="button" className="btn" onClick={simulateNFCScan} style={{ border: '1px solid #ccc', background: 'white' }}>
                                        Simulate
                                    </button>
                                </div>
                                {nfcError && <p style={{ color: 'red', fontSize: '0.8rem', marginTop: '1rem' }}>{nfcError}</p>}
                            </div>
                        )}

                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Voter ID {inputMode === 'MANUAL' ? '(Auto-Generated)' : '(Scanned)'}</label>
                            <input
                                type="text"
                                value={formData.id}
                                readOnly={inputMode === 'MANUAL'} // Allow simulate to fill it, but generally readonly logic stands
                                onChange={(e) => { if (inputMode === 'NFC') setFormData({ ...formData, id: e.target.value }) }}
                                style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #ddd', background: '#f5f5f5', fontWeight: 'bold', fontFamily: 'monospace', letterSpacing: '1px' }}
                            />
                        </div>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Full Name</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g. John Doe"
                                required
                                // Allow editing even if scanned (Officer may need to correct data)
                                // readOnly={inputMode === 'NFC' && formData.name !== ''} 
                                style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #ddd' }}
                            />
                        </div>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Constituency</label>
                            <select
                                value={formData.constituency}
                                onChange={(e) => setFormData({ ...formData, constituency: e.target.value })}
                                required
                                // disabled={inputMode === 'NFC' && formData.constituency !== ''}
                                style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #ddd' }}
                            >
                                <option value="">Select Constituency</option>
                                {constituencies.map(c => (
                                    <option key={c.id} value={c.name}>{c.name} ({c.district})</option>
                                ))}
                            </select>
                        </div>

                        <div style={{ marginTop: '2rem', padding: '1rem', background: '#f5f5f5', borderRadius: '8px', border: '1px solid #ddd', borderLeft: '4px solid #F47920' }}>
                            <strong>Face Data Status:</strong>
                            {faceDescriptor ?
                                <span style={{ color: 'green', fontWeight: 'bold', marginLeft: '0.5rem' }}>Captured <span style={{ fontSize: '1.2rem' }}>✅</span></span> :
                                <span style={{ color: 'red', fontWeight: 'bold', marginLeft: '0.5rem' }}>Pending ❌</span>
                            }
                        </div>

                        <button
                            type="submit"
                            className="btn btn-green"
                            disabled={loading || !faceDescriptor}
                            style={{ width: '100%', marginTop: '1rem', opacity: (!faceDescriptor || loading) ? 0.6 : 1 }}
                        >
                            {loading ? 'Registering...' : <><Save size={16} /> Register Voter</>}
                        </button>
                    </form>
                </div>

                {/* Camera / Face Capture */}
                <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <h4>Biometric Face Capture</h4>

                    <div style={{
                        width: '320px', height: '240px',
                        background: '#000', borderRadius: '12px', overflow: 'hidden',
                        position: 'relative', marginBottom: '1rem'
                    }}>
                        {!cameraActive && (
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                                Camera Off
                            </div>
                        )}
                        <video
                            ref={videoRef}
                            autoPlay
                            muted
                            width="320"
                            height="240"
                            style={{ display: cameraActive ? 'block' : 'none' }}
                        />
                    </div>

                    {!cameraActive ? (
                        <button
                            type="button"
                            className="btn"
                            onClick={startVideo}
                            disabled={!modelsLoaded}
                            style={{ background: '#212121', color: 'white' }}
                        >
                            {modelsLoaded ? <><Camera size={16} /> Start Camera</> : 'Loading AI Models...'}
                        </button>
                    ) : (
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button
                                type="button"
                                className="btn btn-green"
                                onClick={captureFace}
                            >
                                Capture Face
                            </button>
                            <button
                                type="button"
                                className="btn btn-danger"
                                onClick={stopVideo}
                            >
                                Stop Camera
                            </button>
                        </div>
                    )}

                    <p style={{ marginTop: '1rem', color: '#666', fontSize: '0.85rem', textAlign: 'center' }}>
                        Ensure the voter is facing the camera directly with good lighting.
                        <br /> AI Models: {modelsLoaded ? <span style={{ color: 'green' }}>Ready</span> : <span style={{ color: 'orange' }}>Loading...</span>}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default VoterRegistration;
