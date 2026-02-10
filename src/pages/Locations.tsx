import React, { useState } from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Paper,
  IconButton,
  Box,
  MenuItem,
  Chip,
  Link
} from '@mui/material';
import { Edit, Delete, OpenInNew } from '@mui/icons-material';
import { useFirebase } from '../context/FirebaseContext';
import { Location } from '../types';

export const Locations: React.FC = () => {
  const { locations, addLocation, updateLocation, deleteLocation } = useFirebase();
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<Location, 'id'>>({
    street: '',
    squareMeters: 0,
    monthlyRent: 0,
    link: '',
    status: 'viewing',
    notes: ''
  });

  const handleOpenDialog = (location?: Location) => {
    if (location) {
      setFormData(location);
      setEditingId(location.id);
    } else {
      setFormData({
        street: '',
        squareMeters: 0,
        monthlyRent: 0,
        link: '',
        status: 'viewing',
        notes: ''
      });
      setEditingId(null);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingId(null);
  };

  const handleSave = async () => {
    if (!formData.street.trim()) return;

    if (editingId) {
      await updateLocation(editingId, formData);
    } else {
      await addLocation(formData);
    }
    handleCloseDialog();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Czy na pewno chcesz usunąć ten lokal?')) {
      await deleteLocation(id);
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'interested':
        return 'info';
      case 'negotiating':
        return 'warning';
      case 'viewing':
        return 'default';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status?: string) => {
    const labels: { [key: string]: string } = {
      'viewing': 'Oglądane',
      'interested': 'Zainteresowane',
      'negotiating': 'Negocjacje',
      'rejected': 'Odrzucone'
    };
    return labels[status || 'default'] || status || 'Brak statusu';
  };

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <h2>Lokale</h2>
        <Button variant="contained" onClick={() => handleOpenDialog()}>
          + Dodaj lokal
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ bgcolor: '#1e1e1e' }}>
        <Table size="small" sx={{ '& tbody tr:hover': { bgcolor: '#2a2a2a' } }}>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#2a2a2a' }}>
              <TableCell sx={{ color: '#e0e0e0' }}>Ulica</TableCell>
              <TableCell align="right" sx={{ color: '#e0e0e0' }}>Metraż (m²)</TableCell>
              <TableCell align="right" sx={{ color: '#e0e0e0' }}>Czynsz (zł/m-c)</TableCell>
              <TableCell sx={{ color: '#e0e0e0' }}>Link</TableCell>
              <TableCell sx={{ color: '#e0e0e0' }}>Status</TableCell>
              <TableCell sx={{ color: '#e0e0e0' }}>Notatki</TableCell>
              <TableCell sx={{ color: '#e0e0e0' }} align="center">Akcje</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {locations.map((location) => (
              <TableRow key={location.id}>
                <TableCell sx={{ color: '#e0e0e0' }}>{location.street}</TableCell>
                <TableCell align="right" sx={{ color: '#e0e0e0' }}>{location.squareMeters}</TableCell>
                <TableCell align="right" sx={{ color: '#e0e0e0' }}>{location.monthlyRent.toFixed(2)}</TableCell>
                <TableCell sx={{ color: '#e0e0e0' }}>
                  {location.link ? (
                    <Link href={location.link} target="_blank" rel="noopener noreferrer" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#8B4513' }}>
                      Obejrzyj
                      <OpenInNew sx={{ fontSize: 16 }} />
                    </Link>
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell sx={{ color: '#e0e0e0' }}>
                  <Chip label={getStatusLabel(location.status)} size="small" color={getStatusColor(location.status)} />
                </TableCell>
                <TableCell sx={{ color: '#e0e0e0' }}>{location.notes || '-'}</TableCell>
                <TableCell align="center">
                  <IconButton size="small" onClick={() => handleOpenDialog(location)}>
                    <Edit sx={{ color: '#e0e0e0' }} />
                  </IconButton>
                  <IconButton size="small" onClick={() => handleDelete(location.id)}>
                    <Delete sx={{ color: '#e0e0e0' }} />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? 'Edytuj lokal' : 'Dodaj nowy lokal'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <TextField
            label="Ulica"
            value={formData.street}
            onChange={(e) => setFormData({ ...formData, street: e.target.value })}
            fullWidth
          />
          <TextField
            label="Metraż (m²)"
            type="number"
            value={formData.squareMeters}
            onChange={(e) => setFormData({ ...formData, squareMeters: parseFloat(e.target.value) })}
            fullWidth
          />
          <TextField
            label="Czynsz miesięczny (zł)"
            type="number"
            value={formData.monthlyRent}
            onChange={(e) => setFormData({ ...formData, monthlyRent: parseFloat(e.target.value) })}
            fullWidth
          />
          <TextField
            label="Link do ogłoszenia"
            value={formData.link || ''}
            onChange={(e) => setFormData({ ...formData, link: e.target.value })}
            fullWidth
            placeholder="https://..."
          />
          <TextField
            select
            label="Status"
            value={formData.status || 'viewing'}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as Location['status'] })}
            fullWidth
          >
            <MenuItem value="viewing">Oglądane</MenuItem>
            <MenuItem value="interested">Zainteresowane</MenuItem>
            <MenuItem value="negotiating">Negocjacje</MenuItem>
            <MenuItem value="rejected">Odrzucone</MenuItem>
          </TextField>
          <TextField
            label="Notatki"
            value={formData.notes || ''}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            multiline
            rows={4}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Anuluj</Button>
          <Button onClick={handleSave} variant="contained">
            {editingId ? 'Aktualizuj' : 'Dodaj'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Locations;
