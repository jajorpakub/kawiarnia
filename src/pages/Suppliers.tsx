import React, { useState } from 'react';
import { Box, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton, Card, CardContent, Typography, CircularProgress } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { useFirebase } from '../context/FirebaseContext';
import { Supplier } from '../types';

const Suppliers: React.FC = () => {
  const { suppliers, addSupplier, updateSupplier, deleteSupplier, loading } = useFirebase();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Supplier>>({
    name: '', contact: '', email: '', phone: '', category: '', notes: ''
  });

  const handleOpen = (supplier?: Supplier) => {
    if (supplier) {
      setEditingId(supplier.id);
      setFormData(supplier);
    } else {
      setEditingId(null);
      setFormData({ name: '', contact: '', email: '', phone: '', category: '', notes: '' });
    }
    setOpen(true);
  };

  const handleClose = () => { setOpen(false); setEditingId(null); };

  const handleSave = async () => {
    if (!formData.name || !formData.contact) {
      alert('Proszę wypełnić wymagane pola');
      return;
    }
    try {
      if (editingId) {
        await updateSupplier(editingId, formData);
      } else {
        await addSupplier({
          name: formData.name!, contact: formData.contact!, email: formData.email || '',
          phone: formData.phone || '', category: formData.category, notes: formData.notes
        });
      }
      handleClose();
    } catch (error) { console.error('Error:', error); }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Czy na pewno?')) {
      try { await deleteSupplier(id); } catch (error) { console.error('Error:', error); }
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress /></Box>;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Dostawcy</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()}>Dodaj dostawcę</Button>
      </Box>

      {suppliers.length > 0 && (
        <Card sx={{ mb: 3, bgcolor: '#2a2a2a' }}>
          <CardContent>
            <Typography><strong>Liczba dostawców:</strong> {suppliers.length}</Typography>
          </CardContent>
        </Card>
      )}

      <TableContainer component={Paper} sx={{ bgcolor: '#1e1e1e' }}>
        <Table>
          <TableHead sx={{ bgcolor: '#2a2a2a' }}>
            <TableRow>
              <TableCell sx={{ color: '#e0e0e0' }}><strong>Nazwa</strong></TableCell>
              <TableCell sx={{ color: '#e0e0e0' }}><strong>Osoba kontaktowa</strong></TableCell>
              <TableCell sx={{ color: '#e0e0e0' }}><strong>Email</strong></TableCell>
              <TableCell sx={{ color: '#e0e0e0' }}><strong>Telefon</strong></TableCell>
              <TableCell sx={{ color: '#e0e0e0' }}><strong>Kategoria</strong></TableCell>
              <TableCell align="center" sx={{ color: '#e0e0e0' }}><strong>Akcje</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {suppliers.length === 0 ? (
              <TableRow><TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                <Typography color="textSecondary">Brak dostawców</Typography>
              </TableCell></TableRow>
            ) : (
              suppliers.map((supplier) => (
                <TableRow key={supplier.id} hover sx={{ '&:hover': { bgcolor: '#2a2a2a' } }}>
                  <TableCell>{supplier.name}</TableCell>
                  <TableCell>{supplier.contact}</TableCell>
                  <TableCell>{supplier.email && <a href={`mailto:${supplier.email}`}>{supplier.email}</a>}</TableCell>
                  <TableCell>{supplier.phone && <a href={`tel:${supplier.phone}`}>{supplier.phone}</a>}</TableCell>
                  <TableCell>{supplier.category}</TableCell>
                  <TableCell align="center">
                    <IconButton size="small" color="primary" onClick={() => handleOpen(supplier)}><EditIcon /></IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDelete(supplier.id)}><DeleteIcon /></IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? 'Edytuj dostawcę' : 'Dodaj dostawcę'}</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField fullWidth label="Nazwa firmy" value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} margin="normal" />
          <TextField fullWidth label="Osoba kontaktowa" value={formData.contact || ''} onChange={(e) => setFormData({ ...formData, contact: e.target.value })} margin="normal" />
          <TextField fullWidth label="Email" type="email" value={formData.email || ''} onChange={(e) => setFormData({ ...formData, email: e.target.value })} margin="normal" />
          <TextField fullWidth label="Telefon" value={formData.phone || ''} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} margin="normal" />
          <TextField fullWidth label="Kategoria" value={formData.category || ''} onChange={(e) => setFormData({ ...formData, category: e.target.value })} margin="normal" />
          <TextField fullWidth label="Notatki" multiline rows={3} value={formData.notes || ''} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} margin="normal" />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Anuluj</Button>
          <Button onClick={handleSave} variant="contained" color="primary">Zapisz</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Suppliers;
