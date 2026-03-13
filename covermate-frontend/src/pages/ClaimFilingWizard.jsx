import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyPolicies } from '../services/policyService';
import { createClaim, uploadClaimDocument } from '../services/claimService';

export default function ClaimFilingWizard() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [policies, setPolicies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    
    // Form State
    const [formData, setFormData] = useState({
        user_policy_id: '',
        claim_type: 'medical', // default
        incident_date: '',
        amount_claimed: '',
    });
    const [files, setFiles] = useState([]);

    useEffect(() => {
        getMyPolicies()
            .then(data => {
                // Only active policies can have claims filed
                setPolicies(data.filter(p => p.status === 'active'));
            })
            .catch(() => setPolicies([]))
            .finally(() => setLoading(false));
    }, []);

    const handleNext = () => setStep(step + 1);
    const handlePrev = () => setStep(step - 1);

    const handleFileChange = (e) => {
        const selected = Array.from(e.target.files);
        // Add new files to existing ones (max 5)
        if (files.length + selected.length > 5) {
            setError('Maximum 5 files allowed');
            return;
        }
        setError('');
        setFiles(prev => [...prev, ...selected]);
    };

    const removeFile = (index) => {
        setFiles(files.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        setError('');

        try {
            // 1. Create the Claim
            const payload = {
                user_policy_id: Number(formData.user_policy_id),
                claim_type: formData.claim_type,
                incident_date: formData.incident_date,
                amount_claimed: Number(formData.amount_claimed),
            };
            const claim = await createClaim(payload);

            // 2. Upload all documents sequentially
            for (const file of files) {
                await uploadClaimDocument(claim.id, file);
            }

            // 3. Redirect to the newly created claim
            navigate(`/claims/${claim.id}`);
            
        } catch (err) {
            setError(err?.response?.data?.detail || '❌ Failed to submit claim. Please check all fields.');
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="page-wrapper">
                <div style={{ display: 'flex', justifyContent: 'center', padding: '10rem 0' }}>
                    <div className="spinner" />
                </div>
            </div>
        );
    }

    return (
        <div className="page-wrapper">
            <div className="page-content" style={{ maxWidth: '600px', margin: '0 auto' }}>
                
                {/* Header */}
                <div className="animate-fade-in-up" style={{ marginBottom: '2rem', textAlign: 'center' }}>
                    <button
                        onClick={() => navigate('/claims')}
                        style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            color: '#818cf8', fontSize: '0.875rem', fontWeight: 500,
                            marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.375rem',
                            margin: '0 auto 1rem auto'
                        }}
                    >
                        ← Back to Claims
                    </button>
                    <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                        File a <span className="gradient-text">New Claim</span>
                    </h1>
                    
                    {/* Step Indicator */}
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
                        {[1, 2, 3].map(s => (
                            <div key={s} style={{ 
                                width: '30px', height: '4px', borderRadius: '2px',
                                background: step >= s ? '#818cf8' : 'rgba(148,163,184,0.2)',
                                transition: 'background 0.3s'
                            }} />
                        ))}
                    </div>
                </div>

                {error && (
                    <div className="animate-fade-in-up" style={{
                        background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                        borderRadius: '0.75rem', padding: '1rem', color: '#fca5a5',
                        fontSize: '0.875rem', marginBottom: '1.5rem', textAlign: 'center'
                    }}>{error}</div>
                )}

                <div className="glass-card animate-fade-in-up" style={{ padding: '2rem' }}>
                    
                    {/* STEP 1: SELECT POLICY */}
                    {step === 1 && (
                        <div>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Select Policy</h2>
                            <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                                Which active policy are you claiming against?
                            </p>

                            {policies.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '2rem', background: 'rgba(239,68,68,0.05)', borderRadius: '0.5rem', border: '1px solid rgba(239,68,68,0.2)' }}>
                                    <p style={{ color: '#fca5a5' }}>You don't have any active policies to file a claim against.</p>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {policies.map(p => (
                                        <div 
                                            key={p.id}
                                            onClick={() => setFormData({ ...formData, user_policy_id: p.id })}
                                            style={{
                                                padding: '1rem', borderRadius: '0.5rem', cursor: 'pointer',
                                                border: formData.user_policy_id === p.id 
                                                    ? '2px solid #818cf8' 
                                                    : '2px solid rgba(148,163,184,0.1)',
                                                background: formData.user_policy_id === p.id 
                                                    ? 'rgba(99,102,241,0.1)' 
                                                    : 'rgba(15,23,42,0.4)',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            <p style={{ fontWeight: 600, color: 'white' }}>{p.policy?.title}</p>
                                            <p style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>#{p.policy_number} · Provider: {p.policy?.provider?.name}</p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div style={{ marginTop: '2rem', textAlign: 'right' }}>
                                <button 
                                    onClick={handleNext} 
                                    className="btn-primary" 
                                    disabled={!formData.user_policy_id}
                                >
                                    Next Step →
                                </button>
                            </div>
                        </div>
                    )}

                    {/* STEP 2: INCIDENT DETAILS */}
                    {step === 2 && (
                        <div>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Incident Details</h2>
                            <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                                Tell us about what happened.
                            </p>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                                        Type of Claim
                                    </label>
                                    <select
                                        value={formData.claim_type}
                                        onChange={(e) => setFormData({ ...formData, claim_type: e.target.value })}
                                        style={{ width: '100%', padding: '0.875rem 1rem', background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(148,163,184,0.12)', borderRadius: '0.5rem', color: 'white', outline: 'none' }}
                                    >
                                        <option value="medical">Medical / Hospitalization</option>
                                        <option value="accident">Accident</option>
                                        <option value="theft">Theft / Burglary</option>
                                        <option value="damage">Property/Vehicle Damage</option>
                                        <option value="death">Death</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                                        Date of Incident
                                    </label>
                                    <input
                                        type="date"
                                        max={new Date().toISOString().split('T')[0]} // Can't be future
                                        value={formData.incident_date}
                                        onChange={(e) => setFormData({ ...formData, incident_date: e.target.value })}
                                        style={{ width: '100%', padding: '0.875rem 1rem', background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(148,163,184,0.12)', borderRadius: '0.5rem', color: 'white', outline: 'none', boxSizing: 'border-box' }}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                                        Amount Claimed (₹)
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        placeholder="e.g. 50000"
                                        value={formData.amount_claimed}
                                        onChange={(e) => setFormData({ ...formData, amount_claimed: e.target.value })}
                                        style={{ width: '100%', padding: '0.875rem 1rem', background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(148,163,184,0.12)', borderRadius: '0.5rem', color: 'white', outline: 'none', boxSizing: 'border-box' }}
                                    />
                                </div>
                            </div>

                            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between' }}>
                                <button onClick={handlePrev} style={{ background: 'transparent', border: '1px solid rgba(148,163,184,0.3)', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', cursor: 'pointer' }}>
                                    ← Back
                                </button>
                                <button 
                                    onClick={handleNext} 
                                    className="btn-primary" 
                                    disabled={!formData.claim_type || !formData.incident_date || !formData.amount_claimed}
                                >
                                    Next Step →
                                </button>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: DOCUMENTS */}
                    {step === 3 && (
                        <div>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Supporting Documents</h2>
                            <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                                Upload receipts, hospital bills, FIR copies, or photos (Max 5 files).
                            </p>

                            <div style={{ border: '2px dashed rgba(99,102,241,0.3)', borderRadius: '0.5rem', padding: '2rem', textAlign: 'center', background: 'rgba(99,102,241,0.02)', marginBottom: '1.5rem' }}>
                                <input
                                    type="file"
                                    id="file-upload"
                                    multiple
                                    accept="image/*,.pdf"
                                    onChange={handleFileChange}
                                    style={{ display: 'none' }}
                                />
                                <label htmlFor="file-upload" style={{ cursor: 'pointer' }}>
                                    <p style={{ fontSize: '2rem', margin: '0 0 0.5rem 0' }}>📄</p>
                                    <p style={{ color: '#818cf8', fontWeight: 600, textDecoration: 'underline' }}>Click to browse files</p>
                                    <p style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '0.5rem' }}>JPG, PNG, or PDF up to 5MB</p>
                                </label>
                            </div>

                            {files.length > 0 && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
                                    {files.map((f, i) => (
                                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(15,23,42,0.6)', padding: '0.75rem 1rem', borderRadius: '0.5rem', border: '1px solid rgba(148,163,184,0.1)' }}>
                                            <span style={{ fontSize: '0.875rem', color: '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '80%' }}>
                                                {f.name} ({(f.size / 1024 / 1024).toFixed(2)} MB)
                                            </span>
                                            <button onClick={() => removeFile(i)} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontWeight: 800 }}>
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <button onClick={handlePrev} style={{ background: 'transparent', border: '1px solid rgba(148,163,184,0.3)', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', cursor: 'pointer' }}>
                                    ← Back
                                </button>
                                <button 
                                    onClick={handleSubmit} 
                                    className="btn-primary" 
                                    style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', boxShadow: '0 4px 14px rgba(16,185,129,0.3)' }}
                                    disabled={submitting}
                                >
                                    {submitting ? 'Submitting...' : '✓ Submit Claim'}
                                </button>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
