import React, { useState, useEffect, useContext } from 'react';
import {
    Container, TextField, Button, Typography, Box, Paper, Avatar,
    Grid, InputAdornment, CircularProgress, Alert
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import BadgeIcon from '@mui/icons-material/Badge';
import api from '../api/axios';
import AuthContext from '../context/AuthContext';

const ProfilePage = () => {
    const { logoutUser, user } = useContext(AuthContext);

    const [formData, setFormData] = useState({
        username: '',
        first_name: '',
        last_name: '',
        email: '',
        date: ''
    });

    const [loading, setLoading] = useState(true);
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');

    const generateRandomAvatar = (username) => {
        const randomSalt = Math.random().toString(36).substring(7);
        return `https://api.dicebear.com/9.x/fun-emoji/svg?seed=${username}-${randomSalt}`;
    };

    useEffect(() => {
        if (!user || !user.user_id) return;

        const fetchProfile = async () => {
            try {

                const response = await api.get(`/auth/user/${user.user_id}/`);
                const data = response.data;

                setFormData({
                    username: data.username || '',
                    first_name: data.first_name || '',
                    last_name: data.last_name || '',
                    email: data.email || '',
                    date: data.date ? data.date : ''
                });

                setAvatarUrl(generateRandomAvatar(data.username));

            } catch (error) {
                console.error("Failed to fetch profile", error);
                setErrorMsg("Failed to load profile data.");

            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [user]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSuccessMsg('');
        setErrorMsg('');

        if (!user || !user.user_id) {
            setErrorMsg("User ID not found.");
            return;
        }

        try {

            const { email, ...dataToSend } = formData;

            await api.patch(`/auth/user/${user.user_id}/`, dataToSend);

            setSuccessMsg("Profile updated successfully!");
            setTimeout(() => setSuccessMsg(''), 3000);
        } catch (error) {
            console.error("Error updating profile:", error);
            setErrorMsg("Failed to update profile.");
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container component="main" maxWidth="md" sx={{ mt: 4, mb: 8 }}>
            <Paper
                elevation={6}
                sx={{
                    borderRadius: 4,
                    overflow: 'hidden',
                    mb: 4
                }}
            >
                <Box sx={{
                    background: 'linear-gradient(90deg, #1e3c72 0%, #2a5298 100%)',
                    height: 140,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }} />

                <Box sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    mt: -8,
                    pb: 3
                }}>
                    <Avatar
                        src={avatarUrl}
                        alt="User Avatar"
                        imgProps={{
                            onError: (e) => {
                                e.target.onerror = null;
                                e.target.src = "/logo192.png";
                            }
                        }}
                        sx={{
                            width: 140,
                            height: 140,
                            border: '4px solid white',
                            boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
                            bgcolor: '#fff'
                        }}
                    />
                    <Typography variant="h5" sx={{ mt: 2, fontWeight: 'bold' }}>
                        @{formData.username}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {formData.first_name} {formData.last_name}
                    </Typography>
                </Box>
            </Paper>

            <Paper elevation={3} sx={{ p: 4, borderRadius: 4 }}>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold', color: '#333' }}>
                    Edit Personal Information
                </Typography>

                {successMsg && <Alert severity="success" sx={{ mb: 3 }}>{successMsg}</Alert>}
                {errorMsg && <Alert severity="error" sx={{ mb: 3 }}>{errorMsg}</Alert>}

                <Box component="form" onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                required
                                fullWidth
                                label="Username"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <PersonIcon color="action" />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Email"
                                name="email"
                                value={formData.email}
                                disabled
                                variant="filled"
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <EmailIcon color="action" />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="First Name"
                                name="first_name"
                                value={formData.first_name}
                                onChange={handleChange}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <BadgeIcon color="action" />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Last Name"
                                name="last_name"
                                value={formData.last_name}
                                onChange={handleChange}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <BadgeIcon color="action" />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Date of Birth"
                                name="date"
                                type="date"
                                InputLabelProps={{ shrink: true }}
                                value={formData.date}
                                onChange={handleChange}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <CalendarTodayIcon color="action" />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>
                    </Grid>

                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mt: 5,
                        pt: 3,
                        borderTop: '1px solid #eee'
                    }}>
                        <Button
                            variant="outlined"
                            color="error"
                            startIcon={<LogoutIcon />}
                            onClick={logoutUser}
                            sx={{ borderRadius: 2 }}
                        >
                            Log Out
                        </Button>

                        <Button
                            type="submit"
                            variant="contained"
                            startIcon={<SaveIcon />}
                            size="large"
                            sx={{
                                borderRadius: 2,
                                px: 4,
                                background: 'linear-gradient(90deg, #1e3c72 0%, #2a5298 100%)'
                            }}
                        >
                            Save Changes
                        </Button>
                    </Box>
                </Box>
            </Paper>
        </Container>
    );
};

export default ProfilePage;