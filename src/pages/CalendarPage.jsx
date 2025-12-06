import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import {
    Dialog, DialogTitle, DialogContent,
    TextField, DialogActions, Button, Box, MenuItem, Typography,
    List, ListItem, ListItemText, IconButton
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import api from '../api/axios';

const CalendarPage = () => {
    const [events, setEvents] = useState([]);
    const [todos, setTodos] = useState([]);
    const [combinedEvents, setCombinedEvents] = useState([]);

    const [eventModalOpen, setEventModalOpen] = useState(false);
    const [selectedEventId, setSelectedEventId] = useState(null);
    const [isSuggestionClick, setIsSuggestionClick] = useState(false);

    const [todoModalOpen, setTodoModalOpen] = useState(false);
    const [selectedTodoId, setSelectedTodoId] = useState(null);

    const initialEventForm = { title: '', description: '', start_at: '', end_at: '', importance: 1 };
    const [eventFormData, setEventFormData] = useState(initialEventForm);

    const initialTodoForm = { title: '', description: '', importance: 3, duration: 60 };
    const [todoFormData, setTodoFormData] = useState(initialTodoForm);

    const toLocalISOString = (date) => {
        const offset = date.getTimezoneOffset() * 60000;
        return (new Date(date - offset)).toISOString().slice(0, 16);
    };


    const findFirstFreeSlot = (currentEvents, taskDurationMinutes) => {
        const workStartHour = 8;
        const workEndHour = 22;

        let cursor = new Date();
        const remainder = 15 - (cursor.getMinutes() % 15);
        cursor.setMinutes(cursor.getMinutes() + remainder);
        cursor.setSeconds(0);

        if (cursor.getHours() >= workEndHour) {
            cursor.setDate(cursor.getDate() + 1);
            cursor.setHours(workStartHour, 0, 0, 0);
        } else if (cursor.getHours() < workStartHour) {
            cursor.setHours(workStartHour, 0, 0, 0);
        }

        const maxSearchDate = new Date();
        maxSearchDate.setDate(maxSearchDate.getDate() + 5);

        while (cursor < maxSearchDate) {
            const dayStart = new Date(cursor);
            dayStart.setHours(workStartHour, 0, 0, 0);
            const dayEnd = new Date(cursor);
            dayEnd.setHours(workEndHour, 0, 0, 0);

            if (cursor >= dayEnd) {
                cursor.setDate(cursor.getDate() + 1);
                cursor.setHours(workStartHour, 0, 0, 0);
                continue;
            }
            if (cursor < dayStart) cursor = new Date(dayStart);

            const potentialEnd = new Date(cursor.getTime() + taskDurationMinutes * 60000);

            if (potentialEnd > dayEnd) {
                cursor.setDate(cursor.getDate() + 1);
                cursor.setHours(workStartHour, 0, 0, 0);
                continue;
            }

            let hasCollision = false;
            let nextAvailableTime = null;

            for (let event of currentEvents) {
                const eventStart = new Date(event.start);
                const eventEnd = new Date(event.end);

                if (cursor < eventEnd && potentialEnd > eventStart) {
                    hasCollision = true;
                    nextAvailableTime = eventEnd;
                    break;
                }
            }

            if (!hasCollision) return { start: cursor, end: potentialEnd };
            else cursor = nextAvailableTime;
        }
        return null;
    };


    const fetchData = async () => {
        try {
            const [eventsRes, todosRes] = await Promise.all([
                api.get('/events/'),
                api.get('/todo/')
            ]);

            const formattedEvents = eventsRes.data.map(event => {
                let bgColor = '#42a5f5';
                if (event.importance === 2) bgColor = '#ffa726';
                if (event.importance === 3) bgColor = '#ef5350';

                return {
                    id: event.id.toString(),
                    title: event.title,
                    start: event.start_at,
                    end: event.end_at,
                    backgroundColor: bgColor,
                    borderColor: bgColor,
                    textColor: '#fff',
                    extendedProps: {
                        description: event.description,
                        importance: event.importance,
                        isReal: true
                    }
                };
            });

            setEvents(formattedEvents);
            setTodos(todosRes.data);
        } catch (error) {
            console.error("Error loading data:", error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);


    useEffect(() => {
        if (!todos.length) {
            setCombinedEvents(events);
            return;
        }
        const sortedTodos = [...todos].sort((a, b) => b.importance - a.importance);
        let simulatedEvents = [...events];

        for (let task of sortedTodos) {
            const freeSlot = findFirstFreeSlot(simulatedEvents, task.duration);
            if (freeSlot) {
                const suggestionEvent = {
                    id: `GHOST_${task.id}`,
                    title: `⇢ ${task.title}`,
                    start: freeSlot.start.toISOString(),
                    end: freeSlot.end.toISOString(),
                    backgroundColor: 'white',
                    borderColor: '#ab47bc',
                    textColor: '#ab47bc',
                    classNames: ['dashed-event'],
                    extendedProps: { isSuggestion: true, originalTask: task, description: task.description }
                };
                simulatedEvents.push(suggestionEvent);
            }
        }
        setCombinedEvents(simulatedEvents);
    }, [events, todos]);


    const handleDateSelect = (selectInfo) => {
        let startStr = toLocalISOString(selectInfo.start);
        let endStr = toLocalISOString(selectInfo.end);

        if (selectInfo.view.type === 'dayGridMonth') {
            startStr = selectInfo.startStr + "T09:00";
            endStr = selectInfo.startStr + "T10:00";
        }
        setEventFormData({ ...initialEventForm, start_at: startStr, end_at: endStr });
        setSelectedEventId(null);
        setIsSuggestionClick(false);
        setEventModalOpen(true);
    };

    const handleEventClick = (clickInfo) => {
        const event = clickInfo.event;
        const props = event.extendedProps;

        if (props.isSuggestion) {
            setIsSuggestionClick(true);
            setEventFormData({
                title: props.originalTask.title,
                description: props.originalTask.description || '',
                importance: props.originalTask.importance,
                start_at: toLocalISOString(event.start),
                end_at: toLocalISOString(event.end),
                taskId: props.originalTask.id
            });
        } else {
            setIsSuggestionClick(false);
            setEventFormData({
                title: event.title,
                description: props.description || '',
                importance: props.importance || 1,
                start_at: toLocalISOString(event.start),
                end_at: event.end ? toLocalISOString(event.end) : toLocalISOString(event.start)
            });
            setSelectedEventId(event.id);
        }
        setEventModalOpen(true);
    };

    const handleSaveEvent = async () => {
        try {
            const payload = {
                title: eventFormData.title,
                description: eventFormData.description || " ",
                importance: parseInt(eventFormData.importance),
                start_at: new Date(eventFormData.start_at).toISOString(),
                end_at: new Date(eventFormData.end_at).toISOString(),
            };

            if (selectedEventId) {
                await api.patch(`/events/${selectedEventId}/`, payload);
            } else {
                await api.post('/events/', payload);
                if (isSuggestionClick && eventFormData.taskId) {
                    await api.delete(`/todo/${eventFormData.taskId}/`);
                }
            }
            setEventModalOpen(false);
            fetchData();
        } catch (error) { alert("Error saving event"); }
    };

    const handleDeleteEvent = async () => {
        if (!window.confirm("Delete?")) return;
        try {
            await api.delete(`/events/${selectedEventId}/`);
            setEventModalOpen(false);
            fetchData();
        } catch (e) { console.error(e); }
    };

    const openTodoModal = (todo = null) => {
        if (todo) {
            setSelectedTodoId(todo.id);
            setTodoFormData({ ...todo, duration: todo.duration });
        } else {
            setSelectedTodoId(null);
            setTodoFormData(initialTodoForm);
        }
        setTodoModalOpen(true);
    };

    const handleSaveTodo = async () => {
        try {
            const payload = {
                title: todoFormData.title,
                description: todoFormData.description.trim() === '' ? ' ' : todoFormData.description,
                importance: parseInt(todoFormData.importance),
                duration: parseInt(todoFormData.duration)
            };
            if (selectedTodoId) await api.patch(`/todo/${selectedTodoId}/`, payload);
            else await api.post('/todo/', payload);
            setTodoModalOpen(false);
            fetchData();
        } catch (e) { alert("Error saving task"); }
    };

    const handleDeleteTodo = async (id) => {
        if (!window.confirm("Delete task?")) return;
        try { await api.delete(`/todo/${id}/`); fetchData(); } catch (e) { console.error(e); }
    };


    return (
        <Box sx={{
            display: 'flex',
            width: '100%',
            height: '100vh',
            overflow: 'hidden',
            bgcolor: '#ffffff'
        }}>
            <style>{`
                .dashed-event {
                    border: 2px dashed #ab47bc !important;
                    background-color: rgba(255, 255, 255, 0.9) !important;
                    font-weight: 600;
                }
                .fc { height: 100%; } 
            `}</style>


            <Box sx={{
                flex: 1,
                height: '100%',
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                minWidth: 0
            }}>
                <FullCalendar
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                    initialView="timeGridWeek"
                    headerToolbar={{
                        left: 'prev,next today',
                        center: 'title',
                        right: 'dayGridMonth,timeGridWeek,timeGridDay'
                    }}
                    slotMinTime="07:00:00"
                    slotMaxTime="23:00:00"
                    allDaySlot={false}
                    editable={true}
                    selectable={true}
                    selectMirror={true}
                    dayMaxEvents={true}
                    events={combinedEvents}
                    select={handleDateSelect}
                    eventClick={handleEventClick}
                    height="100%"
                    expandRows={true}
                />
            </Box>


            <Box sx={{
                width: '350px',
                height: '100%',
                borderLeft: '1px solid #e0e0e0',
                bgcolor: '#fafafa',
                display: 'flex',
                flexDirection: 'column',
                flexShrink: 0
            }}>
                <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0', bgcolor: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" fontWeight="bold" color="text.primary">TODO</Typography>
                    <IconButton onClick={() => openTodoModal(null)} color="primary" sx={{ bgcolor: '#e3f2fd' }}>
                        <AddIcon />
                    </IconButton>
                </Box>

                <Box sx={{ flex: 1, overflowY: 'auto' }}>
                    <List disablePadding>
                        {todos.map((todo) => (
                            <ListItem
                                key={todo.id}
                                sx={{
                                    borderBottom: '1px solid #f0f0f0',
                                    bgcolor: todo.importance === 3 ? '#fff8f8' : 'white',
                                    '&:hover': { bgcolor: '#f5f5f5' }
                                }}
                                secondaryAction={
                                    <Box>
                                        <IconButton size="small" onClick={() => openTodoModal(todo)}>
                                            <EditIcon fontSize="small" sx={{ color: '#757575' }} />
                                        </IconButton>
                                        <IconButton size="small" onClick={() => handleDeleteTodo(todo.id)}>
                                            <DeleteIcon fontSize="small" sx={{ color: '#ef5350' }} />
                                        </IconButton>
                                    </Box>
                                }
                            >
                                <ListItemText
                                    primary={
                                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                            {todo.importance === 3 && <span style={{color: '#d32f2f', marginRight: 4}}>❗</span>}
                                            {todo.title}
                                        </Typography>
                                    }
                                    secondary={`${todo.duration} min • ${todo.importance === 3 ? '🔴High' : (todo.importance === 2 ? '🟠 Medium' : '🟢 Low')}`}
                                />
                            </ListItem>
                        ))}
                    </List>
                </Box>
            </Box>


            <Dialog open={eventModalOpen} onClose={() => setEventModalOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>{isSuggestionClick ? "Approve & Schedule Task" : (selectedEventId ? 'Edit Event' : 'New Event')}</DialogTitle>
                <DialogContent>
                    <Box component="form" sx={{ mt: 1 }}>
                        <TextField label="Title" fullWidth margin="normal" value={eventFormData.title} onChange={(e) => setEventFormData({ ...eventFormData, title: e.target.value })} />
                        <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                            <TextField label="Start" type="datetime-local" fullWidth InputLabelProps={{ shrink: true }} value={eventFormData.start_at} onChange={(e) => setEventFormData({ ...eventFormData, start_at: e.target.value })} />
                            <TextField label="End" type="datetime-local" fullWidth InputLabelProps={{ shrink: true }} value={eventFormData.end_at} onChange={(e) => setEventFormData({ ...eventFormData, end_at: e.target.value })} />
                        </Box>
                        <TextField select label="Importance" fullWidth margin="normal" value={eventFormData.importance} onChange={(e) => setEventFormData({ ...eventFormData, importance: e.target.value })}>
                            <MenuItem value={1}>🟢 Low</MenuItem>
                            <MenuItem value={2}>🟠 Medium</MenuItem>
                            <MenuItem value={3}>🔴 High</MenuItem>
                        </TextField>
                        <TextField label="Description" fullWidth margin="normal" multiline rows={3} value={eventFormData.description} onChange={(e) => setEventFormData({ ...eventFormData, description: e.target.value })} />
                    </Box>
                </DialogContent>
                <DialogActions>
                    {!isSuggestionClick && selectedEventId && <Button onClick={handleDeleteEvent} color="error">Delete</Button>}
                    <Button onClick={() => setEventModalOpen(false)}>Cancel</Button>
                    <Button onClick={handleSaveEvent} variant="contained" color={isSuggestionClick ? "secondary" : "primary"}>
                        {isSuggestionClick ? "Schedule" : "Save"}
                    </Button>
                </DialogActions>
            </Dialog>


            <Dialog open={todoModalOpen} onClose={() => setTodoModalOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle>{selectedTodoId ? "Edit Task" : "New Task"}</DialogTitle>
                <DialogContent>
                    <Box component="form" sx={{ mt: 1 }}>
                        <TextField label="Task Title" fullWidth autoFocus margin="dense" value={todoFormData.title} onChange={(e) => setTodoFormData({ ...todoFormData, title: e.target.value })} />
                        <TextField label="Duration (minutes)" type="number" fullWidth margin="dense" value={todoFormData.duration} onChange={(e) => setTodoFormData({ ...todoFormData, duration: e.target.value })} />
                        <TextField select label="Importance" fullWidth margin="dense" value={todoFormData.importance} onChange={(e) => setTodoFormData({ ...todoFormData, importance: e.target.value })}>
                            <MenuItem value={1}>🟢 Low</MenuItem>
                            <MenuItem value={2}>🟠 Medium</MenuItem>
                            <MenuItem value={3}>🔴 High</MenuItem>
                        </TextField>
                        <TextField label="Description" fullWidth margin="dense" multiline rows={2} value={todoFormData.description} onChange={(e) => setTodoFormData({ ...todoFormData, description: e.target.value })} />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setTodoModalOpen(false)}>Cancel</Button>
                    <Button onClick={handleSaveTodo} variant="contained">{selectedTodoId ? "Update" : "Add"}</Button>
                </DialogActions>
            </Dialog>

        </Box>
    );
};

export default CalendarPage;