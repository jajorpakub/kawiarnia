import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
  Chip,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import { useFirebase } from '../context/FirebaseContext';
import { CalendarEvent } from '../types';

const CalendarPage: React.FC = () => {
  const { events, addEvent, updateEvent, deleteEvent } = useFirebase();
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<CalendarEvent, 'id'>>({
    title: '',
    description: '',
    startDate: new Date(),
    endDate: new Date(),
    category: 'other',
    color: '#1976d2',
    notes: '',
  });

  const handleOpenDialog = (item?: CalendarEvent) => {
    if (item) {
      setFormData(item);
      setEditingId(item.id);
    } else {
      setFormData({
        title: '',
        description: '',
        startDate: new Date(),
        endDate: new Date(),
        category: 'other',
        color: '#1976d2',
        notes: '',
      });
      setEditingId(null);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleSave = async () => {
    try {
      if (editingId) {
        await updateEvent(editingId, formData);
      } else {
        await addEvent(formData);
      }
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving event:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Czy na pewno chcesz usunąć to zdarzenie?')) {
      try {
        await deleteEvent(id);
      } catch (error) {
        console.error('Error deleting event:', error);
      }
    }
  };

  const getCategoryLabel = (category?: string) => {
    const labels: { [key: string]: string } = {
      inspection: 'Inspekcja',
      meeting: 'Spotkanie',
      deadline: 'Termin',
      other: 'Inne',
    };
    return labels[category || 'other'] || category || 'Inne';
  };

  const getCategoryColor = (category?: string): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    const colors: { [key: string]: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' } = {
      inspection: 'info',
      meeting: 'primary',
      deadline: 'error',
      other: 'default',
    };
    return colors[category || 'other'] || 'default';
  };

  const formatDate = (date?: Date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('pl-PL', { year: 'numeric', month: '2-digit', day: '2-digit' }) +
           ' ' +
           d.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
  };

  const upcomingEvents = events
    .filter(e => new Date(e.startDate) > new Date())
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    .slice(0, 5);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Kalendarz</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Dodaj zdarzenie
        </Button>
      </Box>

      {upcomingEvents.length > 0 && (
        <Card sx={{ mb: 3, bgcolor: '#2a2a2a' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>Nadchodzące zdarzenia</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {upcomingEvents.map((event) => (
                <Box
                  key={event.id}
                  sx={{
                    p: 2,
                    bgcolor: '#1e1e1e',
                    borderLeft: `4px solid ${event.color}`,
                    borderRadius: 1,
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <Box>
                      <Typography variant="subtitle1">{event.title}</Typography>
                      <Typography variant="body2" color="textSecondary">
                        {formatDate(event.startDate)}
                      </Typography>
                      {event.description && (
                        <Typography variant="body2" sx={{ mt: 1 }}>{event.description}</Typography>
                      )}
                    </Box>
                    <Chip
                      label={getCategoryLabel(event.category)}
                      color={getCategoryColor(event.category)}
                      size="small"
                    />
                  </Box>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      )}

      <Typography variant="h6" sx={{ mb: 2 }}>Wszystkie zdarzenia</Typography>
      <TableContainer component={Paper} sx={{ bgcolor: '#1e1e1e' }}>
        <Table>
          <TableHead sx={{ backgroundColor: '#2a2a2a' }}>
            <TableRow>
              <TableCell sx={{ color: '#e0e0e0' }}>Tytuł</TableCell>
              <TableCell sx={{ color: '#e0e0e0' }}>Opis</TableCell>
              <TableCell sx={{ color: '#e0e0e0' }}>Data začęcia</TableCell>
              <TableCell sx={{ color: '#e0e0e0' }}>Data zakończenia</TableCell>
              <TableCell sx={{ color: '#e0e0e0' }}>Kategoria</TableCell>
              <TableCell align="center" sx={{ color: '#e0e0e0' }}>Akcje</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {events.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <Typography color="textSecondary">Brak zdarzeń. Dodaj pierwsze zdarzenie!</Typography>
                </TableCell>
              </TableRow>
            ) : (
              events
                .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
                .map((item) => (
                  <TableRow key={item.id} hover sx={{ '&:hover': { bgcolor: '#2a2a2a' } }}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 12, height: 12, bgcolor: item.color, borderRadius: '50%' }} />
                        {item.title}
                      </Box>
                    </TableCell>
                    <TableCell>{item.description || '-'}</TableCell>
                    <TableCell>{formatDate(item.startDate)}</TableCell>
                    <TableCell>{formatDate(item.endDate)}</TableCell>
                    <TableCell>
                      <Chip
                        label={getCategoryLabel(item.category)}
                        color={getCategoryColor(item.category)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(item)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(item.id)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingId ? 'Edytuj zdarzenie' : 'Dodaj zdarzenie'}
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <TextField
            label="Tytuł"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            fullWidth
          />
          <TextField
            label="Opis"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            fullWidth
            multiline
            rows={2}
          />
          <TextField
            label="Data i czas rozpoczęcia"
            type="datetime-local"
            value={formData.startDate ? new Date(formData.startDate).toISOString().slice(0, 16) : ''}
            onChange={(e) => setFormData({ ...formData, startDate: new Date(e.target.value) })}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Data i czas zakończenia"
            type="datetime-local"
            value={formData.endDate ? new Date(formData.endDate).toISOString().slice(0, 16) : ''}
            onChange={(e) => setFormData({ ...formData, endDate: new Date(e.target.value) })}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
          <FormControl fullWidth>
            <InputLabel>Kategoria</InputLabel>
            <Select
              value={formData.category || 'other'}
              label="Kategoria"
              onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
            >
              <MenuItem value="inspection">Inspekcja</MenuItem>
              <MenuItem value="meeting">Spotkanie</MenuItem>
              <MenuItem value="deadline">Termin</MenuItem>
              <MenuItem value="other">Inne</MenuItem>
            </Select>
          </FormControl>
          <Box>
            <Typography variant="body2" sx={{ mb: 1 }}>Kolor</Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {['#1976d2', '#dc3545', '#ffc107', '#28a745', '#17a2b8', '#6f42c1'].map((color) => (
                <Box
                  key={color}
                  onClick={() => setFormData({ ...formData, color })}
                  sx={{
                    width: 40,
                    height: 40,
                    bgcolor: color,
                    borderRadius: '50%',
                    cursor: 'pointer',
                    border: formData.color === color ? '3px solid #e0e0e0' : '2px solid transparent',
                    transition: 'all 0.2s',
                  }}
                />
              ))}
            </Box>
          </Box>
          <TextField
            label="Notatki"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            fullWidth
            multiline
            rows={2}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Anuluj</Button>
          <Button onClick={handleSave} variant="contained">
            Zapisz
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CalendarPage;
