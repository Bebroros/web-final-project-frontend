import React, { useContext, useState } from 'react';
import AuthContext from '../context/AuthContext';
import { Container, TextField, Button, Typography, Box, Alert, Paper, Grid } from '@mui/material';
import { Link } from 'react-router-dom';

const RegisterPage = () => {
    const { registerUser, error } = useContext(AuthContext);


    const [formData, setFormData] = useState({
        username: '',
        email: '',
        first_name: '',
        last_name: '',
        date: '',
        password: '',
        confirmPassword: ''
    });

    const [localError, setLocalError] = useState(null);


    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setLocalError(null);

        // Перевірка паролів
        if (formData.password !== formData.confirmPassword) {
            setLocalError("Passwords do not match!");
            return;
        }

        const dataToSend = {
            username: formData.username,
            email: formData.email,
            first_name: formData.first_name,
            last_name: formData.last_name,
            date: formData.date,
            password: formData.password,
            password2: formData.confirmPassword
        };


        registerUser(dataToSend);
    };

    return (
        <Container component="main" maxWidth="sm">
            <Paper elevation={3} sx={{ marginTop: 4, padding: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography component="h1" variant="h5">
                    Sign Up
                </Typography>

                {(error || localError) && (
                    <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
                        {localError || error}
                    </Alert>
                )}

                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
                    <Grid container spacing={2}>


                        <Grid item xs={12}>
                            <TextField
                                required
                                fullWidth
                                id="username"
                                label="Username"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                required
                                fullWidth
                                id="email"
                                label="Email Address"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </Grid>


                        <Grid item xs={12} sm={6}>
                            <TextField
                                required
                                fullWidth
                                id="first_name"
                                label="First Name"
                                name="first_name"
                                value={formData.first_name}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                required
                                fullWidth
                                id="last_name"
                                label="Last Name"
                                name="last_name"
                                value={formData.last_name}
                                onChange={handleChange}
                            />
                        </Grid>


                        <Grid item xs={12}>
                            <TextField
                                required
                                fullWidth
                                id="date"
                                label="Date of Birth"
                                name="date"
                                type="date"
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                value={formData.date}
                                onChange={handleChange}
                            />
                        </Grid>


                        <Grid item xs={12}>
                            <TextField
                                required
                                fullWidth
                                name="password"
                                label="Password"
                                type="password"
                                id="password"
                                value={formData.password}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                required
                                fullWidth
                                name="confirmPassword"
                                label="Confirm Password"
                                type="password"
                                id="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                            />
                        </Grid>
                    </Grid>

                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                    >
                        Sign Up
                    </Button>

                    <Box sx={{ textAlign: 'center' }}>
                        <Link to="/login" style={{ textDecoration: 'none', color: '#1976d2' }}>
                            {"Already have an account? Sign In"}
                        </Link>
                    </Box>
                </Box>
            </Paper>
        </Container>
    );
};

export default RegisterPage;