import React, { useState } from 'react';
import { Box, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton, Card, CardContent, Typography, CircularProgress, Select, MenuItem, FormControl, InputLabel, Chip } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon, CheckCircle as CheckCircleIcon } from '@mui/icons-material';
import { useFirebase } from '../context/FirebaseContext';
import { Task } from '../types';

const Tasks: React.FC = () => {
  const { tasks, addTask, updateTask, deleteTask, loading } = useFirebase();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Task>>({
    title: '', description: '', assignedTo: '', status: 'todo', priority: 'medium', dueDate: undefined
  });

  const handleOpen = (task?: Task) => {
    if (task) { setEditingId(task.id); setFormData(task); }
    else { setEditingId(null); setFormData({ title: '', description: '', assignedTo: '', status: 'todo', priority: 'medium', dueDate: undefined }); }
    setOpen(true);
  };

  const handleClose = () => { setOpen(false); setEditingId(null); };

  const handleSave = async () => {
    if (!formData.title) { alert('Proszę podać tytuł'); return; }
    try {
      if (editingId) { await updateTask(editingId, formData); }
      else { await addTask({ title: formData.title!, description: formData.description, assignedTo: formData.assignedTo, status: formData.status || 'todo', priority: formData.priority || 'medium', dueDate: formData.dueDate }); }
      handleClose();
    } catch (error) { console.error('Error:', error); }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Czy na pewno?')) { try { await deleteTask(id); } catch (error) { console.error('Error:', error); } }
  };

  const getStatusColor = (status?: string) => status === 'done' ? 'success' : status === 'in-progress' ? 'warning' : 'default';
  const todoCount = tasks.filter(t => t.status === 'todo').length;
  const inProgressCount = tasks.filter(t => t.status === 'in-progress').length;
  const doneCount = tasks.filter(t => t.status === 'done').length;

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress /></Box>;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Zadania</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()}>Dodaj zadanie</Button>
      </Box>

      {tasks.length > 0 && (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 2, mb: 3 }}>
          <Card sx={{ bgcolor: '#fff3e0' }}><CardContent><Typography color="textSecondary">Do zrobienia</Typography><Typography variant="h5">{todoCount}</Typography></CardContent></Card>
          <Card sx={{ bgcolor: '#fff9c4' }}><CardContent><Typography color="textSecondary">W trakcie</Typography><Typography variant="h5">{inProgressCount}</Typography></CardContent></Card>
          <Card sx={{ bgcolor: '#e8f5e9' }}><CardContent><Typography color="textSecondary">Gotowe</Typography><Typography variant="h5">{doneCount}</Typography></CardContent></Card>
        </Box>
      )}

      <TableContainer component={Paper} sx={{ bgcolor: '#1e1e1e' }}>
        <Table>
          <TableHead sx={{ bgcolor: '#2a2a2a' }}>
            <TableRow>
              <TableCell sx={{ color: '#e0e0e0' }}><strong>Tytuł</strong></TableCell>
              <TableCell sx={{ color: '#e0e0e0' }}><strong>Przydzielono</strong></TableCell>
              <TableCell sx={{ color: '#e0e0e0' }}><strong>Priorytet</strong></TableCell>
              <TableCell sx={{ color: '#e0e0e0' }}><strong>Status</strong></TableCell>
              <TableCell align="center" sx={{ color: '#e0e0e0' }}><strong>Akcje</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tasks.length === 0 ? (
              <TableRow><TableCell colSpan={5} align="center" sx={{ py: 4 }}><Typography color="textSecondary">Brak zadań</Typography></TableCell></TableRow>
            ) : (
              tasks.map((task) => (
                <TableRow key={task.id} hover sx={{ '&:hover': { bgcolor: '#2a2a2a' } }}>
                  <TableCell><strong>{task.title}</strong></TableCell>
                  <TableCell>{task.assignedTo || '-'}</TableCell>
                  <TableCell><Chip label={task.priority} size="small" color={task.priority === 'high' ? 'error' : task.priority === 'medium' ? 'warning' : 'success'} /></TableCell>
                  <TableCell><Chip label={task.status} color={getStatusColor(task.status) as any} size="small" /></TableCell>
                  <TableCell align="center">
                    {task.status !== 'done' && <IconButton size="small" color="success" onClick={() => updateTask(task.id, { status: 'done' })}><CheckCircleIcon /></IconButton>}
                    <IconButton size="small" color="primary" onClick={() => handleOpen(task)}><EditIcon /></IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDelete(task.id)}><DeleteIcon /></IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? 'Edytuj zadanie' : 'Dodaj zadanie'}</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField fullWidth label="Tytuł" value={formData.title || ''} onChange={(e) => setFormData({ ...formData, title: e.target.value })} margin="normal" />
          <TextField fullWidth label="Opis" multiline rows={3} value={formData.description || ''} onChange={(e) => setFormData({ ...formData, description: e.target.value })} margin="normal" />
          <TextField fullWidth label="Przydzielono do" value={formData.assignedTo || ''} onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })} margin="normal" />
          <FormControl fullWidth margin="normal">
            <InputLabel>Priorytet</InputLabel>
            <Select value={formData.priority || 'medium'} label="Priorytet" onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}>
              <MenuItem value="low">Niski</MenuItem>
              <MenuItem value="medium">Średni</MenuItem>
              <MenuItem value="high">Wysoki</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>Status</InputLabel>
            <Select value={formData.status || 'todo'} label="Status" onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}>
              <MenuItem value="todo">Do zrobienia</MenuItem>
              <MenuItem value="in-progress">W trakcie</MenuItem>
              <MenuItem value="done">Gotowe</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Anuluj</Button>
          <Button onClick={handleSave} variant="contained" color="primary">Zapisz</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Tasks;
