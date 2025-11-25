import React, { useState, useEffect } from 'react';
import {
    Container, Typography, Grid, Card, CardContent, CardActionArea,
    Button, Fab, Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, MenuItem, Box, Chip, Paper, Divider
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import api from '../api/axios';

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const SubscriptionsPage = () => {
    const [subs, setSubs] = useState([]);
    const [open, setOpen] = useState(false);
    const [selectedId, setSelectedId] = useState(null);

    const initialForm = {
        name: '',
        cost: '',
        payment_date: new Date().toISOString().slice(0, 10),
        cycle: 'monthly'
    };
    const [formData, setFormData] = useState(initialForm);

    const cycles = [
        { value: 'daily', label: 'Daily' },
        { value: 'weekly', label: 'Weekly' },
        { value: 'fortnight', label: 'Fortnight (Every 2 weeks)' },
        { value: 'monthly', label: 'Monthly' },
    ];


    const COLORS = ['#FF8042', '#00C49F', '#FFBB28', '#0088FE', '#a05195', '#f95d6a'];

    const fetchSubs = async () => {
        try {
            const response = await api.get('/subs/');
            setSubs(response.data);
        } catch (error) {
            console.error("Failed to fetch subs:", error);
        }
    };

    useEffect(() => {
        fetchSubs();
    }, []);

    const getMonthlyCost = (cost, cycle) => {
        const numCost = parseFloat(cost);
        switch (cycle) {
            case 'daily': return numCost * 30;
            case 'weekly': return numCost * 4;
            case 'fortnight': return numCost * 2;
            case 'monthly': return numCost;
            default: return numCost;
        }
    };


    const calculateTotalMonthly = () => {
        return subs.reduce((acc, sub) => acc + getMonthlyCost(sub.cost, sub.cycle), 0).toFixed(2);
    };


    const prepareChartData = () => {
        return subs.map(sub => ({
            name: sub.name,
            value: parseFloat(getMonthlyCost(sub.cost, sub.cycle).toFixed(2))
        }));
    };


    const handleOpen = (sub = null) => {
        if (sub) {
            setSelectedId(sub.id);
            setFormData({
                name: sub.name,
                cost: sub.cost,
                payment_date: sub.payment_date,
                cycle: sub.cycle
            });
        } else {
            setSelectedId(null);
            setFormData(initialForm);
        }
        setOpen(true);
    };

    const handleSave = async () => {
        try {
            if (selectedId) {
                await api.patch(`/subs/${selectedId}/`, formData);
            } else {
                await api.post('/subs/', formData);
            }
            setOpen(false);
            fetchSubs();
        } catch (error) {
            console.error("Error saving sub:", error);
            alert("Error saving subscription");
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Are you sure?")) return;
        try {
            await api.delete(`/subs/${selectedId}/`);
            setOpen(false);
            fetchSubs();
        } catch (error) {
            console.error("Error deleting sub:", error);
        }
    };

    return (
        <Container sx={{ mt: 4, mb: 10 }}>


            <Paper
                elevation={3}
                sx={{
                    p: 3, mb: 4, borderRadius: 3,
                    background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}
            >
                <Box>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#2e426e' }}>
                        Monthly Expenses
                    </Typography>
                </Box>
                <Chip
                    icon={<MonetizationOnIcon sx={{ color: 'white !important' }}/>}
                    label={`$${calculateTotalMonthly()}`}
                    color="primary"
                    sx={{ fontSize: '1.5rem', padding: 3, height: 'auto', borderRadius: 4, backgroundColor: 'rgba(46,66,110,0.85)', }}
                />
            </Paper>


            <Grid container spacing={3} sx={{ mb: 6 }}>
                {subs.map((sub) => (
                    <Grid item xs={12} sm={6} md={4} key={sub.id}>
                        <Card elevation={4} sx={{ borderRadius: 3, transition: '0.3s', '&:hover': { transform: 'translateY(-4px)' } }}>
                            <CardActionArea onClick={() => handleOpen(sub)}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                        <Typography variant="h6" fontWeight="bold">{sub.name}</Typography>
                                        <Chip label={sub.cycle} size="small" color={sub.cycle === 'monthly' ? 'success' : 'default'} variant="outlined" />
                                    </Box>
                                    <Typography variant="h5" color="primary.main" sx={{ mb: 1 }}>${sub.cost}</Typography>
                                    <Typography variant="body2" color="text.secondary">Next: {sub.payment_date}</Typography>
                                </CardContent>
                            </CardActionArea>
                        </Card>
                    </Grid>
                ))}
            </Grid>


            {subs.length > 0 && (
                <Paper elevation={3} sx={{ p: 4, borderRadius: 3, textAlign: 'center' }}>
                    <Typography variant="h6" gutterBottom color="text.secondary">
                        Where does your money go?
                    </Typography>
                    <Divider sx={{ mb: 3 }} />

                    <Box sx={{ width: '100%', height: 350 }}>
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie
                                    data={prepareChartData()}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60} // Робить "пончик" (дірка всередині)
                                    outerRadius={100}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                    label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`} // Підписи
                                >
                                    {prepareChartData().map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => `$${value}`} />
                                <Legend verticalAlign="bottom" height={36}/>
                            </PieChart>
                        </ResponsiveContainer>
                    </Box>
                </Paper>
            )}


            <Fab
                color="primary"
                aria-label="add"
                sx={{ position: 'fixed', bottom: 32, right: 32 }}
                onClick={() => handleOpen(null)}
            >
                <AddIcon />
            </Fab>

            {/* Модальне вікно */}
            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
                <DialogTitle sx={{ textAlign: 'center', fontWeight: 'bold' }}>
                    {selectedId ? 'Edit Subscription' : 'Add New Subscription'}
                </DialogTitle>
                <DialogContent>
                    <Box component="form" sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField label="Service Name" fullWidth value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                        <TextField label="Cost" type="number" fullWidth InputProps={{ startAdornment: <Box sx={{ mr: 1 }}>$</Box> }} value={formData.cost} onChange={(e) => setFormData({ ...formData, cost: e.target.value })} />
                        <TextField label="Next Payment Date" type="date" fullWidth InputLabelProps={{ shrink: true }} value={formData.payment_date} onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })} />
                        <TextField select label="Billing Cycle" fullWidth value={formData.cycle} onChange={(e) => setFormData({ ...formData, cycle: e.target.value })}>
                            {cycles.map((option) => (
                                <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                            ))}
                        </TextField>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ justifyContent: 'space-between', px: 3, pb: 3 }}>
                    {selectedId ? <Button onClick={handleDelete} color="error" startIcon={<DeleteIcon />}>Delete</Button> : <Box />}
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button onClick={() => setOpen(false)} color="inherit">Cancel</Button>
                        <Button onClick={handleSave} variant="contained">Save</Button>
                    </Box>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default SubscriptionsPage;