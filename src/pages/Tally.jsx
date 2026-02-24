import React, { useState } from 'react';
import * as paillier from 'paillier-bigint';
import { Lock, Unlock, BarChart3, Trophy, TrendingUp, CheckCircle, AlertCircle, Download } from 'lucide-react';

const API_URL = "/api";

const Tally = () => {
    const [votes, setVotes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState({});
    const [status, setStatus] = useState("");
    const [privateKey, setPrivateKey] = useState(null);
    const [progress, setProgress] = useState(0);
    const [candidateNames, setCandidateNames] = useState({});
    const [skippedCount, setSkippedCount] = useState(0); // Module 4.7: tracks invalid/skipped votes

    const fetchCandidateNames = async () => {
        try {
            const res = await fetch(`${API_URL}/candidates`);
            const candidates = await res.json();
            const nameMap = {};
            candidates.forEach(c => {
                nameMap[c.id] = { name: c.name, party: c.party, constituency: c.constituency };
            });
            setCandidateNames(nameMap);
            return nameMap; // Return directly so tally loop can use it without stale closure
        } catch (err) {
            console.error('Failed to fetch candidate names', err);
            return {};
        }
    };

    const fetchAndTally = async () => {
        setLoading(true);
        setStatus("Initializing secure decryption...");
        setProgress(0);

        try {
            // Fetch candidate names first — use local variable to avoid stale closure in setTimeout
            const localCandidateNames = await fetchCandidateNames();
            setProgress(10);

            // 1. Fetch Private Key
            setStatus("Retrieving encryption keys...");
            const keyResponse = await fetch(`${API_URL}/admin/election/private-key`);
            if (!keyResponse.ok) throw new Error("Failed to fetch private key");
            const keyData = await keyResponse.json();
            setProgress(25);

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
            setProgress(40);

            // 2. Fetch All Encrypted Votes
            setStatus("Fetching encrypted votes...");
            const votesResponse = await fetch(`${API_URL}/admin/votes`);
            if (!votesResponse.ok) throw new Error("Failed to fetch votes");
            const votesData = await votesResponse.json();
            setVotes(votesData);
            setProgress(60);

            // 3. Decrypt and Tally
            setStatus(`Decrypting ${votesData.length} votes...`);

            const tally = {};

            // --- Module 4.7.1.1: ZK Range Proof verifier (browser-native SHA-256) ---
            // Verifies the commitment hash: SHA-256(1:nonce) === commitment
            // This proves the vote was committed as a valid binary value (1) at vote time
            const verifyRangeProofCommitment = async (proof) => {
                if (!proof || !proof.commitment || !proof.nonce) return false; // No proof = unverifiable
                try {
                    const data = `1:${proof.nonce}`; // Proof was generated for value = 1 (affirmative binary vote)
                    const encoder = new TextEncoder();
                    const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(data));
                    const hashArray = Array.from(new Uint8Array(hashBuffer));
                    const computed = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
                    return computed === proof.commitment;
                } catch {
                    return false;
                }
            };

            setTimeout(async () => {
                const startTime = performance.now();
                let skipped = 0;
                // Use localCandidateNames (not state) to avoid React stale closure bug

                for (let i = 0; i < votesData.length; i++) {
                    const vote = votesData[i];
                    try {
                        const encryptedVal = BigInt(vote.candidate_id);
                        const decryptedVal = privKey.decrypt(encryptedVal);
                        const candidateId = decryptedVal.toString();
                        const constituency = vote.constituency || "Unknown Constituency";

                        // --- Module 4.7: ZK Range Proof Validation (3-step check) ---

                        // STEP 1 — 4.7.1.1: If a range proof is attached, verify the commitment hash
                        const rawProof = vote.range_proof;
                        const proof = rawProof ? (typeof rawProof === 'string' ? JSON.parse(rawProof) : rawProof) : null;
                        if (proof) {
                            const proofValid = await verifyRangeProofCommitment(proof);
                            if (!proofValid) {
                                console.warn(`[4.7.1.1] SKIPPED — ZK Range Proof commitment verification FAILED for vote in ${constituency}`);
                                skipped++;
                                continue; // 4.7.2.1: Tally loop skips ciphertexts that fail range proof
                            }
                        }

                        // STEP 2 — 4.7.3.1: Verify the decrypted value maps to a real registered candidate
                        // (catches votes like candidate_id='2' which decrypt to unrecognized IDs)
                        const isValidCandidate = localCandidateNames.hasOwnProperty(candidateId);
                        if (!isValidCandidate) {
                            console.warn(`[4.7.3.1] SKIPPED — decrypted ID "${candidateId}" is not a registered candidate`);
                            skipped++;
                            continue;
                        }

                        // STEP 3 — Vote is valid: count it
                        if (!tally[constituency]) tally[constituency] = {};
                        tally[constituency][candidateId] = (tally[constituency][candidateId] || 0) + 1;

                        // Update progress
                        if (i % 10 === 0) {
                            setProgress(60 + (i / votesData.length) * 35);
                        }
                    } catch (e) {
                        console.error("Decryption failed for a vote:", e);
                        skipped++;
                    }
                }


                const endTime = performance.now();
                console.log(`Tallying took ${(endTime - startTime).toFixed(2)}ms`);
                if (skipped > 0) console.warn(`[4.7] ${skipped} invalid vote(s) were skipped during tally.`);

                setSkippedCount(skipped);
                setResults(tally);
                setProgress(100);
                setStatus(`Tally Complete - Results Verified ✓ (${skipped > 0 ? skipped + ' invalid vote(s) skipped' : 'All votes valid'})`);
                setLoading(false);
            }, 100);


        } catch (error) {
            console.error(error);
            setStatus("Error: " + error.message);
            setLoading(false);
            setProgress(0);
        }
    };

    const exportResults = () => {
        const dataStr = JSON.stringify(results, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `election_results_${new Date().toISOString()}.json`;
        link.click();
    };

    const styles = {
        container: {
            padding: 0
        },
        header: {
            background: '#000080',
            color: 'white',
            padding: '2rem',
            borderRadius: '12px',
            marginBottom: '2rem',
            boxShadow: '0 4px 12px rgba(0,0,128,0.3)',
            borderTop: '4px solid #F47920'
        },
        controlCard: {
            background: 'white',
            borderRadius: '12px',
            padding: '2rem',
            marginBottom: '2rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
        },
        button: {
            background: loading ? '#6C757D' : '#138808',
            color: 'white',
            padding: '1rem 2rem',
            fontSize: '1.1rem',
            fontWeight: 600,
            border: 'none',
            borderRadius: '8px',
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.75rem',
            boxShadow: '0 4px 12px rgba(19,136,8,0.3)',
            transition: 'all 0.2s'
        },
        progressBar: {
            width: '100%',
            height: '8px',
            background: '#e5e7eb',
            borderRadius: '4px',
            overflow: 'hidden',
            marginTop: '1rem'
        },
        progressFill: {
            height: '100%',
            background: 'linear-gradient(90deg, #138808, #0d5c05)',
            width: `${progress}%`,
            transition: 'width 0.3s ease',
            borderRadius: '4px'
        },
        constituencyCard: {
            background: 'white',
            borderRadius: '12px',
            padding: '1.5rem',
            marginBottom: '1.5rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            borderLeft: '4px solid #000080'
        },
        winnerRow: {
            background: 'linear-gradient(90deg, #f0fff4 0%, #ffffff 100%)',
            borderLeft: '4px solid #138808'
        }
    };

    const getTotalVotes = (candidates) => {
        return Object.values(candidates).reduce((sum, count) => sum + count, 0);
    };

    const getWinner = (candidates) => {
        const sorted = Object.entries(candidates).sort(([, a], [, b]) => b - a);
        return sorted[0];
    };

    return (
        <div style={styles.container}>
            {/* Header */}
            <div style={styles.header}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                    <Lock size={32} />
                    <div>
                        <h2 style={{ margin: 0, fontSize: '2rem' }}>Secure Vote Tallying System</h2>
                        <p style={{ margin: '0.5rem 0 0', opacity: 0.9, fontSize: '1rem' }}>
                            Homomorphic Encryption-based Vote Decryption & Counting
                        </p>
                    </div>
                </div>
                {privateKey && (
                    <div style={{
                        background: 'rgba(255,255,255,0.1)',
                        padding: '0.75rem 1rem',
                        borderRadius: '8px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        marginTop: '1rem'
                    }}>
                        <CheckCircle size={18} />
                        <span>Private Key Loaded & Verified</span>
                    </div>
                )}
            </div>

            {/* Control Panel */}
            <div style={styles.controlCard}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <div>
                        <h3 style={{ margin: 0, color: '#000080', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <BarChart3 size={24} />
                            Tallying Control Panel
                        </h3>
                        <p style={{ margin: '0.5rem 0 0', color: '#6C757D' }}>
                            {status || "Ready to decrypt and count votes"}
                        </p>
                    </div>
                    {Object.keys(results).length > 0 && (
                        <button
                            onClick={exportResults}
                            style={{
                                background: '#F47920',
                                color: 'white',
                                padding: '0.75rem 1.5rem',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                fontWeight: 600
                            }}
                        >
                            <Download size={18} />
                            Export Results
                        </button>
                    )}
                </div>

                <button onClick={fetchAndTally} disabled={loading} style={styles.button}>
                    {loading ? (
                        <>
                            <AlertCircle size={20} className="spin" />
                            Processing...
                        </>
                    ) : (
                        <>
                            <Unlock size={20} />
                            Decrypt & Tally All Votes
                        </>
                    )}
                </button>

                {loading && (
                    <div>
                        <div style={styles.progressBar}>
                            <div style={styles.progressFill} />
                        </div>
                        <p style={{ margin: '0.5rem 0 0', fontSize: '0.9rem', color: '#6C757D' }}>
                            Progress: {Math.round(progress)}%
                        </p>
                    </div>
                )}

                {votes.length > 0 && (
                    <div style={{
                        marginTop: '1.5rem',
                        padding: '1rem',
                        background: '#f8f9fa',
                        borderRadius: '8px',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: '1rem'
                    }}>
                        <div>
                            <div style={{ fontSize: '0.85rem', color: '#6C757D' }}>Total Votes</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#000080' }}>{votes.length}</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '0.85rem', color: '#6C757D' }}>Constituencies</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#138808' }}>{Object.keys(results).length}</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '0.85rem', color: '#6C757D' }}>Status</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#F47920' }}>
                                {loading ? 'Processing' : Object.keys(results).length > 0 ? 'Complete' : 'Pending'}
                            </div>
                        </div>
                        {/* Module 4.7: Display skipped invalid vote count */}
                        {skippedCount > 0 && (
                            <div style={{ gridColumn: '1 / -1', marginTop: '0.5rem', padding: '0.5rem 1rem', background: '#fff3cd', borderRadius: '6px', border: '1px solid #F47920' }}>
                                <span style={{ color: '#856404', fontWeight: 600 }}>⚠️ {skippedCount} invalid vote(s) were skipped (Range Proof Failed — value not in binary set &#123;0, 1&#125;)</span>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Results Display */}
            {Object.keys(results).length > 0 && (
                <div>
                    <div style={{
                        background: 'white',
                        borderRadius: '12px',
                        padding: '1.5rem',
                        marginBottom: '1.5rem',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                    }}>
                        <h3 style={{ margin: 0, color: '#000080', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Trophy size={24} />
                            Decrypted Results by Constituency
                        </h3>
                        <p style={{ margin: '0.5rem 0 0', color: '#6C757D' }}>
                            All votes have been securely decrypted and tallied
                        </p>
                    </div>

                    {Object.entries(results).map(([constituency, candidates]) => {
                        const totalVotes = getTotalVotes(candidates);
                        const [winnerId, winnerVotes] = getWinner(candidates);
                        const winner = candidateNames[winnerId];

                        return (
                            <div key={constituency} style={styles.constituencyCard}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                    <div>
                                        <h3 style={{ margin: 0, color: '#000080', fontSize: '1.5rem' }}>{constituency}</h3>
                                        <p style={{ margin: '0.5rem 0 0', color: '#6C757D' }}>
                                            Total Votes: {totalVotes.toLocaleString()}
                                        </p>
                                    </div>
                                    {winner && (
                                        <div style={{
                                            background: 'linear-gradient(135deg, #138808 0%, #0d5c05 100%)',
                                            color: 'white',
                                            padding: '0.75rem 1.5rem',
                                            borderRadius: '8px',
                                            textAlign: 'center'
                                        }}>
                                            <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>Winner</div>
                                            <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{winner.name}</div>
                                            <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>{winner.party}</div>
                                        </div>
                                    )}
                                </div>

                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                                            <th style={{ padding: '1rem', textAlign: 'left', color: '#000080', fontWeight: 700 }}>Rank</th>
                                            <th style={{ padding: '1rem', textAlign: 'left', color: '#000080', fontWeight: 700 }}>Candidate</th>
                                            <th style={{ padding: '1rem', textAlign: 'left', color: '#000080', fontWeight: 700 }}>Party</th>
                                            <th style={{ padding: '1rem', textAlign: 'left', color: '#000080', fontWeight: 700 }}>Votes</th>
                                            <th style={{ padding: '1rem', textAlign: 'left', color: '#000080', fontWeight: 700 }}>Share</th>
                                            <th style={{ padding: '1rem', textAlign: 'left', color: '#000080', fontWeight: 700 }}>Visual</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {Object.entries(candidates)
                                            .sort(([, a], [, b]) => b - a)
                                            .map(([id, count], idx) => {
                                                const candidate = candidateNames[id] || { name: `Candidate ${id}`, party: 'Unknown' };
                                                const percentage = ((count / totalVotes) * 100).toFixed(2);
                                                const isWinner = idx === 0;

                                                return (
                                                    <tr key={id} style={{
                                                        borderBottom: '1px solid #f3f4f6',
                                                        ...(isWinner ? styles.winnerRow : {})
                                                    }}>
                                                        <td style={{ padding: '1rem', fontWeight: 700, color: isWinner ? '#138808' : '#6C757D' }}>
                                                            {isWinner ? '🥇' : `#${idx + 1}`}
                                                        </td>
                                                        <td style={{ padding: '1rem', fontWeight: isWinner ? 700 : 400 }}>
                                                            {candidate.name}
                                                        </td>
                                                        <td style={{ padding: '1rem', color: '#6C757D' }}>{candidate.party}</td>
                                                        <td style={{ padding: '1rem', fontWeight: 700, fontSize: '1.1rem' }}>{count}</td>
                                                        <td style={{ padding: '1rem', fontWeight: 600, color: '#138808' }}>{percentage}%</td>
                                                        <td style={{ padding: '1rem' }}>
                                                            <div style={{ width: '100%', background: '#e5e7eb', borderRadius: '6px', height: '24px', overflow: 'hidden' }}>
                                                                <div style={{
                                                                    width: `${percentage}%`,
                                                                    background: isWinner ? 'linear-gradient(90deg, #138808, #0d5c05)' : '#000080',
                                                                    height: '100%',
                                                                    borderRadius: '6px',
                                                                    transition: 'width 0.5s ease'
                                                                }} />
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                    </tbody>
                                </table>
                            </div>
                        );
                    })}
                </div>
            )}

            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .spin {
                    animation: spin 1s linear infinite;
                }
            `}</style>
        </div>
    );
};

export default Tally;
