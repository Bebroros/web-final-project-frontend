import { AppBar, Toolbar, Button, Box, Container } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';


const Layout = ({ children }) => {
    const location = useLocation();

    const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

    return (
        <>
            {!isAuthPage && (
                <AppBar position="static" sx={{ backgroundColor: '#2e436f' }}>
                    <Container maxWidth="lg">
                        <Toolbar disableGutters>

                            <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
                                <Box
                                    component="img"
                                    src="/pot_logo.png"
                                    alt="Logo"
                                    sx={{
                                        height: 70,
                                        width: 'auto',
                                        objectFit: 'contain'
                                    }}
                                />
                            </Box>

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