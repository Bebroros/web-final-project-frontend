import React, { useState, useEffect, useContext } from 'react';
import {
    Container, Grid, Paper, Typography, Box, Button,
    Card, CardContent, CardActions, CircularProgress, Alert, Chip
} from '@mui/material';
import { Link } from 'react-router-dom';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import EventIcon from '@mui/icons-material/Event';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import api from '../api/axios';
import AuthContext from '../context/AuthContext';

const HomePage = () => {
    const { user } = useContext(AuthContext);

    const [firstName, setFirstName] = useState('');
    const [stats, setStats] = useState({
        nextEvent: null,
        monthlyExpenses: 0,
        loading: true
    });
    const [prediction, setPrediction] = useState(null);
    const [astroLoading, setAstroLoading] = useState(false);
    const [astroError, setAstroError] = useState(null);

    useEffect(() => {

        if (!user || !user.user_id) return;

        const fetchData = async () => {
            try {

                const userReq = api.get(`/auth/user/${user.user_id}/`);
                const eventsReq = api.get('/events/');
                const subsReq = api.get('/subs/');

                const [userRes, eventsRes, subsRes] = await Promise.all([userReq, eventsReq, subsReq]);

                setFirstName(userRes.data.first_name || userRes.data.username || 'Friend');

                const now = new Date();

                const eventsList = Array.isArray(eventsRes.data) ? eventsRes.data : [];

                const upcomingEvents = eventsList
                    .filter(e => new Date(e.start_at) > now)
                    .sort((a, b) => new Date(a.start_at) - new Date(b.start_at));


                const subsList = Array.isArray(subsRes.data) ? subsRes.data : [];

                const total = subsList.reduce((acc, sub) => {
                    const cost = parseFloat(sub.cost);
                    if (sub.cycle === 'weekly') return acc + (cost * 4);
                    if (sub.cycle === 'daily') return acc + (cost * 30);
                    if (sub.cycle === 'fortnight') return acc + (cost * 2);
                    return acc + cost;
                }, 0);

                setStats({
                    nextEvent: upcomingEvents[0] || null,
                    monthlyExpenses: total.toFixed(2),
                    loading: false
                });

            } catch (error) {
                console.error("Dashboard data fetch failed", error);
                setStats(prev => ({ ...prev, loading: false }));
            }
        };

        fetchData();
    }, [user]);

    const getPrediction = async () => {
        setAstroLoading(true);
        setAstroError(null);
        setPrediction(null); // Очищаємо попереднє, щоб показати анімацію
        try {
            const response = await api.get('/horoscope/');
            setPrediction(response.data.horoscope);
        } catch (error) {
            console.error("Astro fetch failed", error);
            setAstroError("Stars are silent...");
        } finally {
            setAstroLoading(false);
        }
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
            <style>{`
                @keyframes pulse-glow {
                    0% { box-shadow: 0 0 0 0 rgba(235, 223, 248, 0.4); transform: scale(1); }
                    70% { box-shadow: 0 0 0 20px rgba(235, 223, 248, 0); transform: scale(1.05); }
                    100% { box-shadow: 0 0 0 0 rgba(235, 223, 248, 0); transform: scale(1); }
                }
                @keyframes twinkle {
                    0%, 100% { opacity: 0.2; transform: scale(0.8); }
                    50% { opacity: 1; transform: scale(1.2); }
                }
                .magic-ball {
                    width: 60px;
                    height: 60px;
                    background: radial-gradient(circle at 30% 30%, #f6f2d9, #ab47bc);
                    border-radius: 50%;
                    margin: 0 auto;
                    animation: pulse-glow 2s infinite;
                    position: relative;
                }
                .star {
                    position: absolute;
                    background: white;
                    border-radius: 50%;
                    animation: twinkle 1.5s infinite ease-in-out;
                }
            `}</style>

            <Paper
                elevation={0}
                sx={{
                    p: 4,
                    mb: 5,
                    borderRadius: 4,
                    background: 'linear-gradient(to right, #fff 0%, #c4e1f9 100%)',
                    color: '#1f2e4c',
                    boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
                }}
            >
                <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1, textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                    Hello, {firstName}!
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.95 }}>
                    Ready to plan your day?
                </Typography>
            </Paper>

            <Grid container spacing={4} alignItems="stretch">

                <Grid item xs={12} md={4} sx={{ display: 'flex' }}>
                    <Card sx={{ width: '100%', borderRadius: 4, boxShadow: 3, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, color: '#1a252f' }}>
                                <EventIcon fontSize="large" sx={{ mr: 1 }} />
                                <Typography variant="h5" fontWeight="bold">Next Event</Typography>
                            </Box>

                            {stats.loading ? <CircularProgress size={30} /> : (
                                <Box>
                                    {stats.nextEvent ? (
                                        <>
                                            <Typography variant="h5" fontWeight="bold" gutterBottom>
                                                {stats.nextEvent.title}
                                            </Typography>
                                            <Typography variant="body1" color="#1a252f" sx={{ mb: 2 }}>
                                                {stats.nextEvent.description ? stats.nextEvent.description.substring(0, 50) + "..." : "No description"}
                                            </Typography>
                                            <Chip
                                                label={new Date(stats.nextEvent.start_at).toLocaleString()}
                                                color="primary"
                                                variant="outlined"
                                                sx={{ fontSize: '0.9rem', color: '#1a252f' }}
                                            />
                                        </>
                                    ) : (
                                        <Typography variant="h6" color="#1a252f">
                                            No upcoming events found.
                                        </Typography>
                                    )}
                                </Box>
                            )}
                        </CardContent>
                        <CardActions sx={{ p: 2, pt: 0 }}>
                            <Button component={Link} to="/calendar" fullWidth variant="outlined" endIcon={<ArrowForwardIcon />} sx={{ borderRadius: 2, py: 1, color: '#1a252f' }}>
                                Open Calendar
                            </Button>
                        </CardActions>
                    </Card>
                </Grid>


                <Grid item xs={12} md={4} sx={{ display: 'flex' }}>
                    <Card sx={{ width: '100%', borderRadius: 4, boxShadow: 3, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, color: '#003304' }}>
                                <MonetizationOnIcon fontSize="large" sx={{ mr: 1 }} />
                                <Typography variant="h5" fontWeight="bold">Subscriptions</Typography>
                            </Box>

                            <Typography variant="body1" color="#003304" gutterBottom>
                                Monthly estimation
                            </Typography>
                            <Typography variant="h2" color="#003304" fontWeight="bold">
                                ${stats.monthlyExpenses}
                            </Typography>
                        </CardContent>
                        <CardActions sx={{ p: 2, pt: 0 }}>
                            <Button component={Link} to="/subs" fullWidth variant="outlined" color="success" endIcon={<ArrowForwardIcon />} sx={{ borderRadius: 2, py: 1, color: '#003304' }}>
                                Manage Budget
                            </Button>
                        </CardActions>
                    </Card>
                </Grid>


                <Grid item xs={12} md={4} sx={{ display: 'flex' }}>
                    <Card sx={{ width: '100%', borderRadius: 4, boxShadow: 5, bgcolor: '#0a092c', color: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', overflow: 'hidden' }}>
                        <Box sx={{ position: 'absolute', top: -50, right: -50, width: 150, height: 150, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.1)' }} />
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                <AutoAwesomeIcon fontSize="large" sx={{ mr: 1, color: '#f6f2d9' }} />
                                <Typography variant="h5" fontWeight="bold" sx={{ color: '#ede1fa' }}>
                                    Daily Horoscope
                                </Typography>
                            </Box>

                            <Box sx={{ minHeight: 120, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                {!astroLoading && !astroError && !prediction && (
                                    <Typography variant="body1" sx={{ opacity: 0.8, fontStyle: 'italic', fontSize: '1.1rem' }}>
                                        "The stars are aligning... What do they hold for you today?"
                                    </Typography>
                                )}

                                {astroLoading && (
                                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                                        <div className="magic-ball">
                                            <div className="star" style={{ top: '-10px', left: '10px', width: '4px', height: '4px', animationDelay: '0.1s' }}></div>
                                            <div className="star" style={{ bottom: '5px', right: '-10px', width: '6px', height: '6px', animationDelay: '0.5s' }}></div>
                                            <div className="star" style={{ top: '20px', left: '-15px', width: '3px', height: '3px', animationDelay: '0.8s' }}></div>
                                        </div>
                                        <Typography variant="body2" sx={{ color: '#bb8fd3', fontStyle: 'italic' }}>
                                            Consulting the cosmos...
                                        </Typography>
                                    </Box>
                                )}

                                {prediction && !astroLoading && (
                                    <Typography variant="body1" sx={{ fontStyle: 'italic', fontSize: '1rem', lineHeight: 1.6 }}>
                                        "{prediction}"
                                    </Typography>
                                )}

                                {astroError && (
                                    <Alert severity="warning" sx={{ mt: 1, bgcolor: 'rgb(46,35,75)', color: '#ffffff', fontWeight: 'bold' }}>
                                        {astroError}
                                    </Alert>
                                )}
                            </Box>
                        </CardContent>
                        <CardActions sx={{ p: 2, pt: 0 }}>
                            <Button
                                fullWidth
                                variant="contained"
                                size="large"
                                onClick={getPrediction}
                                disabled={astroLoading}
                                sx={{
                                    borderRadius: 2,
                                    py: 1,
                                    bgcolor: '#2e234c',
                                    color: '#ebdff8',
                                    fontWeight: 'bold',
                                    '&:hover': { bgcolor: '#490078' },
                                    '&.Mui-disabled': { bgcolor: '#1a1430', color: '#666' }
                                }}
                            >
                                {astroLoading ? 'Divining...' : 'Get Prediction'}
                            </Button>
                        </CardActions>
                    </Card>
                </Grid>

            </Grid>
        </Container>
    );
};

export default HomePage;