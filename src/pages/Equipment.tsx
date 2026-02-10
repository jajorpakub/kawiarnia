import React, { useState } from 'react';
import { Box, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton, Card, CardContent, Typography, CircularProgress, Select, MenuItem, FormControl, InputLabel, Chip } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { useFirebase } from '../context/FirebaseContext';
import { Equipment } from '../types';

const EquipmentPage: React.FC = () => {
  const { equipment, addEquipment, updateEquipment, deleteEquipment, loading } = useFirebase();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Equipment>>({
    name: '', quantity: 1, unitPrice: 0, supplier: '', status: 'pending', notes: ''
  });

  const handleOpen = (item?: Equipment) => {
    if (item) { setEditingId(item.id); setFormData(item); }
    else { setEditingId(null); setFormData({ name: '', quantity: 1, unitPrice: 0, supplier: '', status: 'pending', notes: '' }); }
    setOpen(true);
  };

  const handleClose = () => { setOpen(false); setEditingId(null); };

  const handleSave = async () => {
    if (!formData.name || formData.quantity! <= 0) { alert('Proszę wypełnić wszystkie pola'); return; }
    try {
      if (editingId) { await updateEquipment(editingId, formData); }
      else { await addEquipment({ name: formData.name!, quantity: formData.quantity || 1, unitPrice: formData.unitPrice || 0, supplier: formData.supplier, status: formData.status || 'pending', notes: formData.notes }); }
      handleClose();
    } catch (error) { console.error('Error:', error); }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Czy na pewno?')) { try { await deleteEquipment(id); } catch (error) { console.error('Error:', error); } }
  };

  const getStatusColor = (status?: string) => status === 'received' ? 'success' : status === 'ordered' ? 'warning' : 'error';
  const totalValue = equipment.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress /></Box>;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Wyposażenie</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()}>Dodaj urządzenie</Button>
      </Box>

      {equipment.length > 0 && (
        <Card sx={{ mb: 3, bgcolor: '#2a2a2a' }}>
          <CardContent>
            <Box sx={{ display: 'flex', gap: 4 }}>
              <Typography><strong>Przedmiotów:</strong> {equipment.reduce((sum, item) => sum + item.quantity, 0)}</Typography>
              <Typography><strong>Wartość:</strong> {totalValue.toFixed(2)} zł</Typography>
            </Box>
          </CardContent>
        </Card>
      )}

      <TableContainer component={Paper} sx={{ bgcolor: '#1e1e1e' }}>
        <Table>
          <TableHead sx={{ bgcolor: '#2a2a2a' }}>
            <TableRow>
              <TableCell sx={{ color: '#e0e0e0' }}><strong>Nazwa</strong></TableCell>
              <TableCell align="right" sx={{ color: '#e0e0e0' }}><strong>Ilość</strong></TableCell>
              <TableCell align="right" sx={{ color: '#e0e0e0' }}><strong>Cena jedn.</strong></TableCell>
              <TableCell align="right" sx={{ color: '#e0e0e0' }}><strong>Razem</strong></TableCell>
              <TableCell sx={{ color: '#e0e0e0' }}><strong>Dostawca</strong></TableCell>
              <TableCell sx={{ color: '#e0e0e0' }}><strong>Status</strong></TableCell>
              <TableCell sx={{ color: '#e0e0e0' }}><strong>Notatki</strong></TableCell>
              <TableCell align="center" sx={{ color: '#e0e0e0' }}><strong>Akcje</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {equipment.length === 0 ? (
              <TableRow><TableCell colSpan={8} align="center" sx={{ py: 4 }}><Typography color="textSecondary">Brak urządzeń</Typography></TableCell></TableRow>
            ) : (
              equipment.map((item) => (
                <TableRow key={item.id} hover sx={{ '&:hover': { bgcolor: '#2a2a2a' } }}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell align="right">{item.quantity}</TableCell>
                  <TableCell align="right">{item.unitPrice.toFixed(2)} zł</TableCell>
                  <TableCell align="right"><strong>{(item.unitPrice * item.quantity).toFixed(2)} zł</strong></TableCell>
                  <TableCell>{item.supplier || '-'}</TableCell>
                  <TableCell><Chip label={item.status} color={getStatusColor(item.status) as any} size="small" /></TableCell>
                  <TableCell>{item.notes || '-'}</TableCell>
                  <TableCell align="center">
                    <IconButton size="small" color="primary" onClick={() => handleOpen(item)}><EditIcon /></IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDelete(item.id)}><DeleteIcon /></IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? 'Edytuj urządzenie' : 'Dodaj urządzenie'}</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField fullWidth label="Nazwa" value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} margin="normal" />
          <TextField fullWidth label="Ilość" type="number" inputProps={{ min: 1, step: 1 }} value={formData.quantity || 1} onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })} margin="normal" />
          <TextField fullWidth label="Cena jednostkowa (zł)" type="number" inputProps={{ min: 0, step: 0.01 }} value={formData.unitPrice || 0} onChange={(e) => setFormData({ ...formData, unitPrice: parseFloat(e.target.value) || 0 })} margin="normal" />
          <TextField fullWidth label="Dostawca" value={formData.supplier || ''} onChange={(e) => setFormData({ ...formData, supplier: e.target.value })} margin="normal" />
          <FormControl fullWidth margin="normal">
            <InputLabel>Status</InputLabel>
            <Select value={formData.status || 'pending'} label="Status" onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}>
              <MenuItem value="pending">Oczekujące</MenuItem>
              <MenuItem value="ordered">Zamówione</MenuItem>
              <MenuItem value="received">Otrzymane</MenuItem>
            </Select>
          </FormControl>
          <TextField fullWidth label="Notatki" multiline rows={2} value={formData.notes || ''} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} margin="normal" />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Anuluj</Button>
          <Button onClick={handleSave} variant="contained" color="primary">Zapisz</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EquipmentPage;
