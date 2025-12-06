import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, List, ListItem, ListItemText,
    Chip, Divider, CircularProgress, Card, CardContent, Button, IconButton
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import api from '../api/axios';

const TodoSidebar = () => {
    const [todos, setTodos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [suggestion, setSuggestion] = useState(null);


    const fetchTodos = async () => {
        try {
            const response = await api.get('/todo/');
            setTodos(response.data);
            generateSuggestion(response.data);
        } catch (error) {
            console.error("Error fetching todos:", error);
        } finally {
            setLoading(false);
        }
    };

    const generateSuggestion = (todoList) => {
        if (!todoList || todoList.length === 0) {
            setSuggestion(null);
            return;
        }


        const sorted = [...todoList].sort((a, b) => {
            if (b.importance !== a.importance) {
                return b.importance - a.importance;
            }
            return a.duration - b.duration;
        });


        setSuggestion(sorted[0]);
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/todo/${id}/`);
            const newTodos = todos.filter(t => t.id !== id);
            setTodos(newTodos);
            generateSuggestion(newTodos);
        } catch (error) {
            console.error("Failed to delete", error);
        }
    };

    useEffect(() => {
        fetchTodos();
    }, []);

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}><CircularProgress /></Box>;

    return (
        <Paper elevation={3} sx={{ height: '100%', p: 2, bgcolor: '#f5f7fa', overflowY: 'auto' }}>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight="bold" color="text.secondary">
                    Tasks
                </Typography>
                <IconButton color="primary" size="small">
                    <AddIcon />
                </IconButton>
            </Box>

            {suggestion && (
                <Card sx={{ mb: 3, border: '1px solid #2a5298', bgcolor: '#e3f2fd' }}>
                    <CardContent>
                        <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                            <AccessTimeIcon fontSize="small" /> Free time? Do this:
                        </Typography>
                        <Typography variant="h6" sx={{ mt: 1, fontWeight: 'bold' }}>
                            {suggestion.title}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                            <Chip label={`${suggestion.duration} min`} size="small" icon={<AccessTimeIcon />} />
                            <Chip label={`Imp: ${suggestion.importance}`} size="small" color={suggestion.importance > 2 ? "error" : "default"} icon={<PriorityHighIcon />} />
                        </Box>
                        <Button
                            fullWidth
                            variant="contained"
                            size="small"
                            color="primary"
                            sx={{ mt: 2 }}
                            onClick={() => handleDelete(suggestion.id)}
                        >
                            Mark Done
                        </Button>
                    </CardContent>
                </Card>
            )}

            <Divider sx={{ mb: 2 }}>All Tasks</Divider>

            <List dense>
                {todos.map((todo) => (
                    <ListItem
                        key={todo.id}
                        secondaryAction={
                            <IconButton edge="end" aria-label="delete" onClick={() => handleDelete(todo.id)}>
                                <DeleteIcon color="action" />
                            </IconButton>
                        }
                        sx={{ bgcolor: 'white', mb: 1, borderRadius: 1, boxShadow: 1 }}
                    >
                        <ListItemText
                            primary={todo.title}
                            secondary={
                                <React.Fragment>
                                    <Typography component="span" variant="caption" color="text.primary">
                                        {todo.duration} min
                                    </Typography>
                                    {" — " + (todo.description ? todo.description.substring(0, 20) + '...' : '')}
                                </React.Fragment>
                            }
                        />
                    </ListItem>
                ))}
                {todos.length === 0 && (
                    <Typography variant="body2" color="text.secondary" align="center">
                        No tasks yet. Add one!
                    </Typography>
                )}
            </List>
        </Paper>
    );
};

export default TodoSidebar;