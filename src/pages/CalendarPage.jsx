import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import {
    Container, Paper, Dialog, DialogTitle, DialogContent,
    TextField, DialogActions, Button, Box, MenuItem, Typography
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import api from '../api/axios';

const CalendarPage = () => {
    const [events, setEvents] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedEventId, setSelectedEventId] = useState(null);


    const toLocalISOString = (date) => {
        const offset = date.getTimezoneOffset() * 60000;
        return (new Date(date - offset)).toISOString().slice(0, 16);
    };

    const initialFormState = {
        title: '',
        description: '',
        start_at: '',
        end_at: '',
        importance: 1
    };
    const [formData, setFormData] = useState(initialFormState);


    const fetchEvents = async () => {
        try {
            const response = await api.get('/events/');
            const formattedEvents = response.data.map(event => {

                let bgColor = '#90caf9';
                if (event.importance === 3) bgColor = '#ff8a80';
                if (event.importance === 2) bgColor = '#ffcc80';
                if (event.importance === 1) bgColor = '#a5d6a7';

                return {
                    id: event.id,
                    title: event.title,
                    start: event.start_at,
                    end: event.end_at,
                    backgroundColor: bgColor,
                    borderColor: bgColor,
                    textColor: '#333333',
                    extendedProps: {
                        description: event.description,
                        importance: event.importance,
                    }
                };
            });
            setEvents(formattedEvents);
        } catch (error) {
            console.error("Failed to fetch events:", error);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);


    const handleDateSelect = (selectInfo) => {
        let startStr = toLocalISOString(selectInfo.start);
        let endStr = toLocalISOString(selectInfo.end);


        if (selectInfo.view.type === 'dayGridMonth') {
            startStr = selectInfo.startStr + "T09:00";
            endStr = selectInfo.startStr + "T10:00";
        }

        setFormData({
            ...initialFormState,
            start_at: startStr,
            end_at: endStr
        });
        setSelectedEventId(null);
        setModalOpen(true);
    };


    const handleEventClick = (clickInfo) => {
        const event = clickInfo.event;
        const props = event.extendedProps;

        setFormData({
            title: event.title,
            description: props.description || '',
            importance: props.importance || 1,
            start_at: toLocalISOString(event.start),
            end_at: event.end ? toLocalISOString(event.end) : toLocalISOString(event.start)
        });
        setSelectedEventId(event.id);
        setModalOpen(true);
    };


    const handleSubmit = async () => {
        try {

            const payload = {
                ...formData,
                start_at: new Date(formData.start_at).toISOString(),
                end_at: new Date(formData.end_at).toISOString(),
            };

            if (selectedEventId) {

                await api.patch(`/events/${selectedEventId}/`, payload);
            } else {

                await api.post('/events/', payload);
            }

            setModalOpen(false);
            fetchEvents();
        } catch (error) {
            console.error("Error saving event:", error);
            alert("Error saving event. Check console.");
        }
    };


    const handleDelete = async () => {
        if (!window.confirm("Delete this event?")) return;
        try {
            await api.delete(`/events/${selectedEventId}/`);
            setModalOpen(false);
            fetchEvents();
        } catch (error) {
            console.error("Error deleting event:", error);
        }
    };


    const renderEventContent = (eventInfo) => {
        return (
            <Box sx={{
                p: '4px',
                overflow: 'hidden',
                borderRadius: '4px',
                lineHeight: '1.2'
            }}>
                <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block' }}>
                    {eventInfo.timeText}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {eventInfo.event.title}
                </Typography>
            </Box>
        );
    };

    return (
        <Container sx={{ mt: 4, mb: 4 }}>
            <Paper elevation={3} sx={{ p: 2, borderRadius: 2 }}>
                <FullCalendar
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                    initialView="dayGridMonth"
                    headerToolbar={{
                        left: 'prev,next today',
                        center: 'title',
                        right: 'dayGridMonth,timeGridWeek,timeGridDay'
                    }}
                    editable={true}
                    selectable={true}
                    selectMirror={true}
                    dayMaxEvents={true}
                    events={events}
                    select={handleDateSelect}
                    eventClick={handleEventClick}
                    eventContent={renderEventContent}
                    height="80vh"
                />
            </Paper>


            <Dialog
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: { borderRadius: 3, p: 1 }
                }}
            >
                <DialogTitle sx={{ fontWeight: 'bold', textAlign: 'center' }}>
                    {selectedEventId ? 'Edit Event' : 'Create New Event'}
                </DialogTitle>
                <DialogContent>
                    <Box component="form" sx={{ mt: 1 }}>
                        <TextField
                            autoFocus
                            margin="dense"
                            label="Event Title"
                            fullWidth
                            variant="outlined"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            sx={{ mb: 2 }}
                        />


                        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                            <TextField
                                label="Start"
                                type="datetime-local"
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                                value={formData.start_at}
                                onChange={(e) => setFormData({ ...formData, start_at: e.target.value })}
                            />
                            <TextField
                                label="End"
                                type="datetime-local"
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                                value={formData.end_at}
                                onChange={(e) => setFormData({ ...formData, end_at: e.target.value })}
                            />
                        </Box>

                        <TextField
                            select
                            margin="dense"
                            label="Importance"
                            fullWidth
                            value={formData.importance}
                            onChange={(e) => setFormData({ ...formData, importance: e.target.value })}
                            sx={{ mb: 2 }}
                        >
                            <MenuItem value={1}>🟢 Low Priority</MenuItem>
                            <MenuItem value={2}>🟠 Medium Priority</MenuItem>
                            <MenuItem value={3}>🔴 High Priority</MenuItem>
                        </TextField>

                        <TextField
                            margin="dense"
                            label="Description"
                            fullWidth
                            multiline
                            rows={3}
                            variant="outlined"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ justifyContent: 'space-between', px: 3, pb: 3 }}>
                    {selectedEventId ? (
                        <Button
                            onClick={handleDelete}
                            color="error"
                            startIcon={<DeleteIcon />}
                            sx={{ textTransform: 'none' }}
                        >
                            Delete
                        </Button>
                    ) : <Box></Box>}

                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button onClick={() => setModalOpen(false)} sx={{ textTransform: 'none', color: 'text.secondary' }}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            variant="contained"
                            sx={{
                                textTransform: 'none',
                                borderRadius: 2,
                                px: 4,
                                backgroundColor: '#6600ae'
                            }}
                        >
                            Save
                        </Button>
                    </Box>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default CalendarPage;