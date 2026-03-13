import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getClaim, uploadClaimDocument } from '../services/claimService';
import { API_URL } from '../services/api';

const STATUS_ORDER = ['draft', 'submitted', 'under_review', 'approved', 'paid'];
const STATUS_LABELS = {
    draft: 'Draft', submitted: 'Submitted', under_review: 'Under Review',
    approved: 'Approved', paid: 'Paid', rejected: 'Rejected',
};

function formatCurrency(amount) {
    if (!amount) return '—';
    return new Intl.NumberFormat('en-IN', {
        style: 'currency', currency: 'INR', maximumFractionDigits: 0,
    }).format(amount);
}

function formatDate(d) {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function ClaimDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [claim, setClaim] = useState(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [toast, setToast] = useState('');
    const [error, setError] = useState('');

    const load = () => {
        setLoading(true);
        getClaim(id)
            .then(setClaim)
            .catch(() => navigate('/claims'))
            .finally(() => setLoading(false));
    };

    useEffect(load, [id, navigate]);

    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(''), 3500);
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Basic validation
        if (file.size > 5 * 1024 * 1024) {
            setError('File size must be less than 5MB');
            return;
        }

        setUploading(true);
        setError('');
        try {
            await uploadClaimDocument(id, file);
            showToast('✅ Document uploaded successfully');
            load(); // Reload to get the new document
        } catch (err) {
            setError(err?.response?.data?.detail || '❌ Failed to upload document');
        } finally {
            setUploading(false);
            e.target.value = ''; // Reset input
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

    if (!claim) return null;

    const currentStatusIdx = STATUS_ORDER.indexOf(claim.status);
    const isRejected = claim.status === 'rejected';

    return (
        <div className="page-wrapper">
            <div className="page-content" style={{ maxWidth: '800px', margin: '0 auto' }}>
                {/* Toast & Error */}
                {toast && (
                    <div style={{
                        position: 'fixed', top: '5rem', right: '1.5rem', zIndex: 9999,
                        background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(34,197,94,0.3)',
                        borderRadius: '0.75rem', padding: '1rem 1.5rem', color: 'white',
                        fontSize: '0.875rem', fontWeight: 500, boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                    }}>{toast}</div>
                )}
                {error && (
                    <div style={{
                        background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                        borderRadius: '0.75rem', padding: '1rem', color: '#fca5a5',
                        fontSize: '0.875rem', marginBottom: '1.5rem',
                    }}>{error}</div>
                )}

                {/* Header */}
                <div className="animate-fade-in-up" style={{ marginBottom: '2rem' }}>
                    <button
                        onClick={() => navigate('/claims')}
                        style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            color: '#818cf8', fontSize: '0.875rem', fontWeight: 500,
                            marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.375rem',
                        }}
                    >
                        ← Back to Claims
                    </button>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.25rem' }}>
                                Claim <span className="gradient-text">#{claim.claim_number}</span>
                            </h1>
                            <p style={{ color: '#94a3b8', fontSize: '1rem' }}>
                                Filed on {formatDate(claim.created_at)}
                            </p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <p style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, marginBottom: '0.125rem' }}>
                                Amount Claimed
                            </p>
                            <p style={{ fontSize: '1.75rem', fontWeight: 800, color: '#e2e8f0' }}>
                                {formatCurrency(claim.amount_claimed)}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Progress Tracker / Timeline */}
                <div className="glass-card animate-fade-in-up" style={{ padding: '2rem', marginBottom: '2rem', overflowX: 'auto' }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'white', marginBottom: '1.5rem' }}>
                        Claim Status
                    </h3>
                    
                    {isRejected ? (
                        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '0.75rem', padding: '1.5rem', textAlign: 'center', color: '#fca5a5' }}>
                            <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>❌</p>
                            <p style={{ fontSize: '1.125rem', fontWeight: 700 }}>Claim Rejected</p>
                            <p style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>Unfortunately, your claim was not approved. Please contact support for details.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', minWidth: '500px' }}>
                            {/* Background Line */}
                            <div style={{ position: 'absolute', top: '15px', left: '10%', right: '10%', height: '3px', background: 'rgba(148,163,184,0.2)', zIndex: 0 }} />
                            
                            {/* Active Line (Progress) */}
                            <div style={{ 
                                position: 'absolute', top: '15px', left: '10%', 
                                right: `${100 - (currentStatusIdx / (STATUS_ORDER.length - 1)) * 80}%`, 
                                height: '3px', background: '#3b82f6', zIndex: 0,
                                transition: 'right 0.5s ease-out'
                            }} />

                            {STATUS_ORDER.map((step, idx) => {
                                const isCompleted = currentStatusIdx >= idx;
                                const isCurrent = currentStatusIdx === idx;
                                
                                let circleColor = 'rgba(15,23,42,1)';
                                let borderColor = 'rgba(148,163,184,0.3)';
                                let textColor = '#64748b';

                                if (isCompleted) {
                                    circleColor = '#3b82f6';
                                    borderColor = '#3b82f6';
                                    textColor = 'white';
                                }
                                if (step === 'paid' && isCompleted) {
                                    circleColor = '#10b981';
                                    borderColor = '#10b981';
                                }

                                return (
                                    <div key={step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1, width: '20%' }}>
                                        <div style={{ 
                                            width: '32px', height: '32px', borderRadius: '50%', 
                                            background: circleColor, border: `3px solid ${borderColor}`,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            marginBottom: '0.75rem', color: 'white', fontSize: '0.875rem', fontWeight: 700,
                                            boxShadow: isCurrent ? '0 0 0 4px rgba(59,130,246,0.2)' : 'none'
                                        }}>
                                            {isCompleted && step !== 'paid' ? '✓' : idx + 1}
                                        </div>
                                        <p style={{ fontSize: '0.75rem', fontWeight: 600, color: textColor, textAlign: 'center' }}>
                                            {STATUS_LABELS[step]}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Details & Documents Grid */}
                <div className="animate-fade-in-up" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                    
                    {/* Left Col: Details */}
                    <div className="glass-card" style={{ padding: '2rem' }}>
                        <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'white', marginBottom: '1.5rem' }}>
                            Incident Details
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <p style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Claim Type</p>
                                <p style={{ fontSize: '1rem', color: '#e2e8f0', fontWeight: 500, textTransform: 'capitalize' }}>{claim.claim_type}</p>
                            </div>
                            <div>
                                <p style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Incident Date</p>
                                <p style={{ fontSize: '1rem', color: '#e2e8f0', fontWeight: 500 }}>{formatDate(claim.incident_date)}</p>
                            </div>
                            <div>
                                <p style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Policy</p>
                                <p style={{ fontSize: '1rem', color: '#e2e8f0', fontWeight: 500 }}>{claim.user_policy?.policy?.title || 'Unknown'}</p>
                            </div>
                            <div>
                                <p style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Provider</p>
                                <p style={{ fontSize: '1rem', color: '#e2e8f0', fontWeight: 500 }}>{claim.user_policy?.policy?.provider?.name || 'Unknown'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Right Col: Documents */}
                    <div className="glass-card" style={{ padding: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'white' }}>
                                Documents
                            </h3>
                            {/* Hidden file input triggered by label */}
                            <label style={{ 
                                cursor: 'pointer', color: '#818cf8', fontSize: '0.875rem', 
                                fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' 
                            }}>
                                <span>{uploading ? 'Uploading…' : '+ Attach File'}</span>
                                <input 
                                    type="file" 
                                    accept="image/*,.pdf" 
                                    style={{ display: 'none' }} 
                                    onChange={handleFileUpload}
                                    disabled={uploading}
                                />
                            </label>
                        </div>

                        {claim.documents?.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '2rem 1rem', background: 'rgba(15,23,42,0.4)', borderRadius: '0.75rem', border: '1px dashed rgba(148,163,184,0.2)' }}>
                                <p style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>📄</p>
                                <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>No documents uploaded yet.<br/>Please attach bills, receipts, or FIR copies.</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {claim.documents?.map(doc => {
                                    // Make sure URL works whether it includes the backend host or not
                                    const fileUrl = doc.file_url.startsWith('http') 
                                        ? doc.file_url 
                                        : `${API_URL}${doc.file_url}`;
                                        
                                    return (
                                        <div key={doc.id} style={{ 
                                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                            padding: '0.75rem 1rem', background: 'rgba(15,23,42,0.4)',
                                            borderRadius: '0.5rem', border: '1px solid rgba(148,163,184,0.1)'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <span style={{ fontSize: '1.25rem' }}>📎</span>
                                                <div>
                                                    <p style={{ color: '#e2e8f0', fontSize: '0.875rem', fontWeight: 500 }}>
                                                        Document {doc.id}
                                                    </p>
                                                    <p style={{ color: '#64748b', fontSize: '0.6875rem' }}>
                                                        {formatDate(doc.uploaded_at)}
                                                    </p>
                                                </div>
                                            </div>
                                            <a 
                                                href={fileUrl} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                style={{ color: '#3b82f6', fontSize: '0.8125rem', fontWeight: 600, textDecoration: 'none' }}
                                            >
                                                View
                                            </a>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
