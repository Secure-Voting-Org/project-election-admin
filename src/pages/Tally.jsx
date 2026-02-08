import React, { useState } from 'react';
import * as paillier from 'paillier-bigint';

const API_URL = "http://localhost:5000/api"; // Adjust if different

const Tally = () => {
    const [votes, setVotes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState({});
    const [status, setStatus] = useState("");
    const [privateKey, setPrivateKey] = useState(null);

    const fetchAndTally = async () => {
        setLoading(true);
        setStatus("Fetching Data...");
        try {
            // 1. Fetch Private Key
            const keyResponse = await fetch(`${API_URL}/admin/election/private-key`);
            if (!keyResponse.ok) throw new Error("Failed to fetch private key");
            const keyData = await keyResponse.json();

            // Reconstruct Private Key
            const publicKey = new paillier.PublicKey(BigInt(keyData.publicKey.n), BigInt(keyData.publicKey.g));
            const privKey = new paillier.PrivateKey(
                BigInt(keyData.lambda),
                BigInt(keyData.mu),
                publicKey,
                BigInt(keyData.p),
                BigInt(keyData.q)
            );
            setPrivateKey(privKey);

            // 2. Fetch All Encrypted Votes
            const votesResponse = await fetch(`${API_URL}/admin/votes`);
            if (!votesResponse.ok) throw new Error("Failed to fetch votes");
            const votesData = await votesResponse.json();
            setVotes(votesData);

            // 3. Decrypt and Tally
            setStatus(`Decrypting ${votesData.length} votes...`);

            // Structure: { "ConstituencyName": { "CandidateId": Count, ... }, ... }
            const tally = {};

            // Allow UI to update before blocking with heavy computation
            setTimeout(async () => {
                const startTime = performance.now();

                for (const vote of votesData) {
                    try {
                        // Decrypt candidateId
                        // votes table stores candidate_id as TEXT (Ciphertext)
                        const encryptedVal = BigInt(vote.candidate_id);
                        const decryptedVal = privKey.decrypt(encryptedVal);
                        const candidateId = decryptedVal.toString();
                        const constituency = vote.constituency || "Unknown Constituency";

                        if (!tally[constituency]) {
                            tally[constituency] = {};
                        }

                        tally[constituency][candidateId] = (tally[constituency][candidateId] || 0) + 1;
                    } catch (e) {
                        console.error("Decryption failed for a vote:", e);
                    }
                }

                const endTime = performance.now();
                console.log(`Tallying took ${(endTime - startTime).toFixed(2)}ms`);

                setResults(tally);
                setStatus("Tally Complete.");
                setLoading(false);
            }, 100);

        } catch (error) {
            console.error(error);
            setStatus("Error: " + error.message);
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '2rem' }}>
            <h2>Election Tallying Authority</h2>
            <div style={{ marginBottom: '1rem' }}>
                <p>Status: <strong>{status}</strong></p>
                <button onClick={fetchAndTally} disabled={loading} style={{ padding: '10px 20px', fontSize: '16px' }}>
                    {loading ? 'Processing...' : 'Decrypt & Tally Votes'}
                </button>
            </div>

            {Object.keys(results).length > 0 && (
                <div>
                    {Object.entries(results).map(([constituency, candidates]) => (
                        <div key={constituency} style={{ marginBottom: '2rem', border: '1px solid #ddd', padding: '1rem', borderRadius: '8px' }}>
                            <h3 style={{ borderBottom: '2px solid #333', paddingBottom: '0.5rem' }}>{constituency}</h3>
                            <table border="1" cellPadding="10" style={{ borderCollapse: 'collapse', width: '100%' }}>
                                <thead>
                                    <tr style={{ background: '#f5f5f5' }}>
                                        <th style={{ textAlign: 'left' }}>Candidate ID</th>
                                        <th style={{ textAlign: 'left' }}>Vote Count</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Object.entries(candidates)
                                        .sort(([, a], [, b]) => b - a) // Sort by votes descending
                                        .map(([id, count]) => (
                                            <tr key={id}>
                                                <td>{id}</td>
                                                <td style={{ fontWeight: 'bold' }}>{count}</td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Tally;
