import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from "../../services/axios";

const EmailVerification = () => {
    const { token } = useParams(); // Extract token from URL using React Router
    const [verificationStatus, setVerificationStatus] = useState(null);

    useEffect(() => {
        const verifyEmail = async () => {
            try {
                const response = await axios.get(`/api/verify-email/${token}`);
                console.log(response);
                setVerificationStatus('success');
            } catch (error) {
                setVerificationStatus('error');
            }
        };

        verifyEmail();
    }, [token]);

    return (
        <div>
            {verificationStatus === 'success' && <p>Email verified successfully!</p>}
            {verificationStatus === 'error' && <p>Error verifying email.</p>}
            {verificationStatus === null && <p>Verifying email...</p>}
        </div>
    );
};

export default EmailVerification;
