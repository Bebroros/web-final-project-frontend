import React, { useContext } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { Button } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import AuthContext from '../context/AuthContext';

const GoogleButton = () => {
    const { googleLogin } = useContext(AuthContext);

    const login = useGoogleLogin({
        onSuccess: (tokenResponse) => {
            console.log("Google response:", tokenResponse);

            googleLogin(tokenResponse.access_token);
        },
        onError: () => {
            console.log('Google Login Failed');
        },
    });

    return (
        <Button
            variant="outlined"
            startIcon={<GoogleIcon />}
            fullWidth
            onClick={() => login()}
            sx={{ mt: 2, textTransform: 'none', borderColor: '#ccc', color: '#555' }}
        >
            Continue with Google
        </Button>
    );
};

export default GoogleButton;