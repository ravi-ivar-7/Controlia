import React from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import axiosInstance from '../../services/axiosInstance';
import useToast from '../../hooks/useToast';
import { useUser } from '../../context/UserContext';

const clientId = '1020802754930-t0s2jcpvq5qvltpahol8l5pjvfnga3d6.apps.googleusercontent.com'; // Use your actual client ID

function GoogleAuth() {

    const { showErrorToast, showSuccessToast } = useToast();
    const { user,setUser } = useUser();


    const onSuccess = async (response) => {
        try {
            const result = await axiosInstance.post('/google-auth', { response }, {
                withCredentials: true
            });
            console.log(result.data.payload);
            showSuccessToast(result.data.info)

        } catch (error) {
            console.error('Login failed:', error);
            showErrorToast('Google Login failed.')
        }
    };

    const onFailure = (response) => {
        console.error('Login failed:', response);
        showErrorToast('Failed goolge login response.')
    };

    return (
        <GoogleOAuthProvider clientId={clientId}>
            <div>
                <h2>Login with Google</h2>
                <GoogleLogin
                    onSuccess={onSuccess}
                    onFailure={onFailure}
                    useOneTap
                />
            </div>
        </GoogleOAuthProvider>
    );
}

export default GoogleAuth;
