import api from './api';

// Create a new claim
export const createClaim = async (claimData) => {
    const res = await api.post('/claims/', claimData);
    return res.data;
};

// Get all claims for the current user
export const getMyClaims = async () => {
    const res = await api.get('/claims/');
    return res.data;
};

// Get a single claim by ID
export const getClaim = async (claimId) => {
    const res = await api.get(`/claims/${claimId}`);
    return res.data;
};

// Upload a document to a claim
export const uploadClaimDocument = async (claimId, file) => {
    // We must use FormData for file uploads
    const formData = new FormData();
    formData.append('file', file);

    const res = await api.post(`/claims/${claimId}/documents`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return res.data;
};
