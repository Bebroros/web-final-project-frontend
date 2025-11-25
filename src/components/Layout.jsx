import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Container } from '@mui/material';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Layout = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();


    const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

    const handleLogout = () => {
        // Потім тут буде очищення токена
        console.log("Logout clicked");
        navigate('/login');
    };

    return (
        <>
            {!isAuthPage && (
                <AppBar position="static">
                    <Container maxWidth="lg">
                        <Toolbar disableGutters>

                            <Typography variant="h6" component="div" sx={{ flexGrow: 1, mr: 2 }}>
                                Smart Calendar
                            </Typography>


                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <Button color="inherit" component={Link} to="/calendar">
                                    Calendar
                                </Button>
                                <Button color="inherit" component={Link} to="/subs">
                                    Subscriptions
                                </Button>
                                <Button color="inherit" component={Link} to="/profile">
                                    My Profile
                                </Button>
                                <Button color="error" variant="contained" size="small" onClick={handleLogout} sx={{ ml: 2 }}>
                                    Logout
                                </Button>
                            </Box>
                        </Toolbar>
                    </Container>
                </AppBar>
            )}


            <Container maxWidth="lg" sx={{ marginTop: 4 }}>
                {children}
            </Container>
        </>
    );
};

export default Layout;